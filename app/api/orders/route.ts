import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { SpiceOrder } from "@/models/SpiceOrder";
import { checkoutSchema } from "@/lib/admin/schemas";
import { guardRequest, serverError, zodErrors } from "@/lib/security";
import { getWhatsappNumber } from "@/lib/cms";
import { sumMoney } from "@/lib/cart/price";
import { priceLines, type PricedLine } from "@/lib/orders/pricing";
import { buildOrderMessage, whatsappUrl } from "@/lib/orders/whatsapp";

function generateOrderNumber() {
  return `GF-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function POST(request: Request) {
  const guard = guardRequest(request, "orders:create");
  if (guard) return guard;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Please check your details.", errors: zodErrors(parsed.error) }, { status: 422 });
  }

  const { customer, items: requestedItems, notes, source } = parsed.data;

  try {
    const results = await priceLines(requestedItems);

    const errors: Record<string, string> = {};
    for (const result of results) {
      if (!result.ok) errors[`item_${result.variantId}`] = result.reason;
    }
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ ok: false, message: "Some items in your cart are no longer available. Please review your order.", errors }, { status: 422 });
    }

    // Never place an order at a price the customer has not seen: send them back to review the new one.
    const lines = results.flatMap((r) => (r.ok ? [r] : []));
    const changed = lines.filter((r) => r.priceChanged);
    if (changed.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "A price has changed since you added it. Please review the updated total and submit again.",
          errors: Object.fromEntries(changed.map((r) => [`item_${r.variantId}`, `${r.line.name} (${r.line.quality}) is now priced differently.`])),
          data: { lines: results },
        },
        { status: 409 },
      );
    }

    const validatedItems: PricedLine[] = lines.map((r) => r.line);
    const currency = validatedItems[0].currency;
    const subtotal = sumMoney(validatedItems.map((i) => i.lineTotal));
    const totalAmount = subtotal; // shipping TBD
    const orderNumber = generateOrderNumber();

    const order = await SpiceOrder.create({
      orderNumber,
      customer,
      items: validatedItems,
      subtotal,
      shippingAmount: null,
      totalAmount,
      currency,
      notes,
      source,
      status: "pending",
    });

    const message = buildOrderMessage({ orderNumber, customer, items: validatedItems, totalAmount, currency, notes });
    const number = await getWhatsappNumber();
    const waHref = number ? whatsappUrl(number, message) : null;

    // Records that the link was prepared. The order stays pending until an admin confirms it.
    if (waHref) await SpiceOrder.updateOne({ _id: order._id }, { whatsappOpenedAt: new Date() });

    return NextResponse.json({
      ok: true,
      data: {
        orderNumber,
        orderId: String(order._id),
        waHref,
        message,
        totalAmount,
        currency,
      },
    });
  } catch (error) {
    return serverError(error, "orders:create");
  }
}

import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { softwarePurchaseSchema } from "@/lib/admin/schemas";
import { getWhatsappNumber } from "@/lib/cms";
import { formatPrice } from "@/lib/cart/price";
import { connectToDatabase } from "@/lib/mongodb";
import { guardRequest, looksLikeSpam, serverError, zodErrors } from "@/lib/security";
import { softwareCategoryLabel } from "@/lib/admin/constants";
import { whatsappUrl } from "@/lib/orders/whatsapp";
import { TradingSoftware } from "@/models/TradingSoftware";
import { TradingSoftwareOrder } from "@/models/TradingSoftwareOrder";

export const runtime = "nodejs";

const generateOrderNumber = () => `GS-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;

/**
 * Public purchase request for one licence of one product. The price always comes from the database. The order is saved
 * as pending and unpaid: no payment is taken here, and an admin confirms the order and arranges payment and delivery.
 */
export async function POST(request: Request) {
  const guard = guardRequest(request, "software-orders");
  if (guard) return guard;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const parsed = softwarePurchaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Please check your details.", errors: zodErrors(parsed.error) }, { status: 422 });
  }
  const { productId, licenceId, expectedPrice, customer, notes, website, startedAt } = parsed.data;
  if (looksLikeSpam({ website, startedAt })) {
    return NextResponse.json({ ok: true, data: { orderNumber: "GS-RECEIVED", waHref: null } });
  }

  try {
    await connectToDatabase();
    const product = await TradingSoftware.findOne({ _id: productId, status: "published" }).lean();
    const licence = product?.licenceOptions.find((l) => String(l._id) === licenceId);
    const onSale = product && (product.availability === "available" || product.availability === "limited");
    if (!product || !licence || licence.active === false || !(licence.price > 0) || !onSale) {
      return NextResponse.json({ ok: false, message: "This licence is no longer available. Please review the product and try again." }, { status: 422 });
    }

    // Never record an order at a price the customer has not seen.
    if (expectedPrice !== undefined && Math.abs(expectedPrice - licence.price) > 0.001) {
      return NextResponse.json(
        { ok: false, message: `The price of ${licence.name} has changed to ${formatPrice(licence.price, product.currency)}. Please review it and submit again.`, data: { price: licence.price } },
        { status: 409 },
      );
    }

    const orderNumber = generateOrderNumber();
    const order = await TradingSoftwareOrder.create({
      orderNumber,
      customer,
      items: [
        {
          productId: product._id,
          licenceId: licence._id,
          name: product.name,
          category: softwareCategoryLabel(product.category),
          licenceName: licence.name,
          licenceType: licence.licenceType,
          quantity: 1,
          unitPrice: licence.price,
          currency: product.currency,
          lineTotal: licence.price,
        },
      ],
      amount: licence.price,
      currency: product.currency,
      notes,
      status: "pending",
      paymentStatus: "unpaid",
    });

    const message = [
      "*NEW SOFTWARE ORDER REQUEST — GOLDENFALCONE*",
      `*Reference:* ${orderNumber}`,
      `*Name:* ${customer.name}`,
      `*Email:* ${customer.email}`,
      `*Phone:* ${customer.phone}`,
      "",
      `*Software:* ${product.name}`,
      `*Licence:* ${licence.name}`,
      `*Price:* ${formatPrice(licence.price, product.currency)}`,
      "",
      "Please confirm availability, payment details and delivery.",
    ].join("\n");
    const number = await getWhatsappNumber();
    const waHref = number ? whatsappUrl(number, message) : null;
    if (waHref) await TradingSoftwareOrder.updateOne({ _id: order._id }, { whatsappOpenedAt: new Date() });

    return NextResponse.json({ ok: true, data: { orderNumber, waHref, amount: licence.price, currency: product.currency, productName: product.name, licenceName: licence.name } });
  } catch (error) {
    return serverError(error, "software-orders");
  }
}

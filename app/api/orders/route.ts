import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { SpiceOrder } from "@/models/SpiceOrder";
import { SpiceProduct } from "@/models/SpiceProduct";
import { checkoutSchema } from "@/lib/admin/schemas";
import { guardRequest, zodErrors } from "@/lib/security";
import { getSettings } from "@/lib/cms";
import { mediaUrl } from "@/lib/media";

function generateOrderNumber() {
  return `GF-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function currencySymbol(currency: string) {
  const map: Record<string, string> = { INR: "₹", USD: "$", AED: "AED ", GBP: "£", EUR: "€", SGD: "S$" };
  return map[currency] ?? currency + " ";
}

function fmt(n: number, currency: string) {
  return `${currencySymbol(currency)}${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

  const { customer, items: requestedItems, notes } = parsed.data;

  await connectToDatabase();

  // --- Server-side product validation: fetch all products, reject unknown/unavailable/unpublished ---
  const productIds = requestedItems.map((i) => i.productId);
  const products = await SpiceProduct.find({ _id: { $in: productIds }, status: "published" }).lean();
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  const validatedItems: {
    productId: string;
    name: string;
    image: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    currency: string;
    lineTotal: number;
  }[] = [];

  const errors: Record<string, string> = {};

  for (const req of requestedItems) {
    const product = productMap.get(req.productId);
    if (!product) {
      errors[`item_${req.productId}`] = "Product is no longer available.";
      continue;
    }
    if (product.availability === "unavailable") {
      errors[`item_${req.productId}`] = `${product.name} is currently unavailable.`;
      continue;
    }
    const price = (product as Record<string, unknown>).ourPrice as number | null;
    if (price === null || price === undefined) {
      errors[`item_${req.productId}`] = `${product.name} does not have a confirmed price. Please enquire directly.`;
      continue;
    }
    const minQty = (product as Record<string, unknown>).minimumOrderQuantity as number | null;
    if (minQty && req.quantity < minQty) {
      errors[`item_${req.productId}`] = `Minimum order for ${product.name} is ${minQty}.`;
      continue;
    }
    const firstImage = (product.images?.[0] as { mediaId?: string } | undefined);
    validatedItems.push({
      productId: req.productId,
      name: product.name,
      image: firstImage?.mediaId ? mediaUrl(firstImage.mediaId) : "",
      unit: (product as Record<string, unknown>).unit as string ?? "",
      quantity: req.quantity,
      unitPrice: price,
      currency: (product as Record<string, unknown>).currency as string ?? "INR",
      lineTotal: price * req.quantity,
    });
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, message: "Some items in your cart are no longer available or have changed. Please review your order.", errors }, { status: 422 });
  }

  if (validatedItems.length === 0) {
    return NextResponse.json({ ok: false, message: "Your cart is empty." }, { status: 422 });
  }

  const currency = validatedItems[0].currency;
  const subtotal = validatedItems.reduce((s, i) => s + i.lineTotal, 0);
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
    status: "pending-whatsapp",
  });

  // Build WhatsApp message
  const settings = await getSettings();
  const rawWa =
    process.env.GOLDENFALCONE_WHATSAPP_NUMBER ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    settings.whatsappNumber ||
    "919790586474";
  const digits = rawWa.replace(/\D/g, "");
  const waNumber = digits.length === 10 ? `91${digits}` : (digits || "919790586474");

  const lines: string[] = [
    `*NEW SPICE ORDER — GOLDENFALCONE*`,
    `----------------------------------------`,
    `*Order Reference:* #${orderNumber}`,
    ``,
    `*Customer Details:*`,
    `• *Name:* ${customer.name}`,
    `• *Phone:* ${customer.phone}`,
    ...(customer.email ? [`• *Email:* ${customer.email}`] : []),
    `• *Location:* ${[customer.city, customer.state, customer.country].filter(Boolean).join(", ")}`,
    ``,
    `*Ordered Items:*`,
    ...validatedItems.flatMap((item, i) => [
      `${i + 1}. *${item.name}*`,
      `   Qty: ${item.quantity}${item.unit ? ` ${item.unit}` : ""}`,
      `   Unit Price: ${fmt(item.unitPrice, item.currency)}`,
      `   Item Total: ${fmt(item.lineTotal, item.currency)}`,
      ``,
    ]),
    `----------------------------------------`,
    `*Subtotal:* ${fmt(subtotal, currency)}`,
    `*Shipping:* To be confirmed`,
    `*Estimated Total:* ${fmt(totalAmount, currency)}`,
    `----------------------------------------`,
    ...(customer.address || customer.city ? [
      ``,
      `*Delivery Address:*`,
      [customer.address, customer.city, customer.state, customer.postalCode, customer.country].filter(Boolean).join(", "),
      ``,
    ] : []),
    ...(notes ? [`*Order Notes:* ${notes}`, ``] : []),
    `Please confirm product availability, shipping charges, and payment details.`,
    ``,
    `Thank you!`,
  ];

  const message = lines.join("\n");
  const waHref = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

  // Record that the WhatsApp link was generated
  await SpiceOrder.updateOne({ _id: order._id }, { whatsappOpenedAt: new Date() });

  return NextResponse.json({
    ok: true,
    data: {
      orderNumber,
      orderId: String(order._id),
      waHref,
      message,
    },
  });
}
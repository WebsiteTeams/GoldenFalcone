import { formatPrice } from "@/lib/cart/price";

type MessageLine = {
  name: string;
  category: string;
  quality: string;
  qualityPercent: number | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  currency: string;
};

type MessageOrder = {
  orderNumber: string;
  customer: { name: string; phone: string; email?: string; address?: string; city?: string; state?: string; postalCode?: string; country?: string };
  items: MessageLine[];
  totalAmount: number;
  currency: string;
  notes?: string;
};

/** The order message a customer sends us. It requests confirmation: sending it does not confirm the order. */
export function buildOrderMessage(order: MessageOrder) {
  const { customer } = order;
  const address = [customer.address, customer.city, customer.state, customer.postalCode, customer.country].filter(Boolean).join(", ");

  return [
    `*NEW SPICE ORDER — GOLDENFALCONE*`,
    `----------------------------------------`,
    `*Order Reference:* ${order.orderNumber}`,
    `*Customer Name:* ${customer.name}`,
    `*Phone:* ${customer.phone}`,
    ...(customer.email ? [`*Email:* ${customer.email}`] : []),
    ``,
    `*Ordered Items:*`,
    ...order.items.flatMap((item, i) => [
      `${i + 1}. *${item.name}*`,
      `   Category: ${item.category}`,
      `   Quality: ${item.quality}${item.qualityPercent !== null ? ` (${item.qualityPercent}%)` : ""}`,
      `   Quantity: ${item.quantity} kg`,
      `   Price: ${formatPrice(item.unitPrice, item.currency)} per kg`,
      `   Item Total: ${formatPrice(item.lineTotal, item.currency)}`,
      ``,
    ]),
    `----------------------------------------`,
    `*Total Amount:* ${formatPrice(order.totalAmount, order.currency)}`,
    `*Shipping:* To be confirmed`,
    `----------------------------------------`,
    ...(address ? [`*Delivery Address:* ${address}`, ``] : []),
    ...(order.notes ? [`*Order Notes:* ${order.notes}`, ``] : []),
    `Please confirm availability, shipping charges and payment details.`,
  ].join("\n");
}

export const whatsappUrl = (number: string, message: string) => `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

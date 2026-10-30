import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ExternalLink, Mail, MessageCircle, Package, Phone } from "lucide-react";
import { Card, DetailList } from "@/components/admin/DetailList";
import { NotesPanel, type Note } from "@/components/admin/NotesPanel";
import { PageHeader } from "@/components/admin/PageHeader";
import { RecordActions } from "@/components/admin/RecordActions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { isObjectId } from "@/lib/admin/api";
import { formatDate } from "@/lib/admin/client";
import { orderStatuses } from "@/lib/admin/constants";
import { getRecord, resources } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth/session";
import { formatPrice } from "@/lib/cart/price";

export const metadata: Metadata = { title: "Spice Order Details" };

type OrderItem = {
  productId?: string;
  name: string;
  image?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  lineTotal: number;
};

type OrderDoc = {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    country?: string;
    state?: string;
    city?: string;
    address?: string;
    postalCode?: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingAmount?: number | null;
  totalAmount: number;
  currency: string;
  notes?: string;
  status: string;
  whatsappOpenedAt?: string | null;
  internalNotes?: Note[];
  createdAt: string;
  updatedAt: string;
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdmin();
  const { id } = await params;
  if (!isObjectId(id)) notFound();

  const order = await getRecord<OrderDoc>(resources.orders, id);
  if (!order) notFound();

  const cleanPhone = order.customer.phone.replace(/[^0-9]/g, "");
  const waReplyHref = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Hello ${order.customer.name}, thank you for your order (${order.orderNumber}) with Goldenfalcone Whole Spices. We are reviewing your request...`
      )}`
    : null;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/orders", label: "All orders" }}
        title={`Order ${order.orderNumber}`}
        description={`Submitted by ${order.customer.name} · ${formatDate(order.createdAt, true)}`}
        actions={<StatusBadge status={order.status} className="text-sm" />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Order Items & Customer Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order items card */}
          <Card title={`Ordered Products (${order.items.length})`}>
            <div className="divide-y divide-line">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line bg-ivory">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-6 w-6 text-gold/40" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-ink truncate">{item.name}</h4>
                    <p className="text-xs text-muted">
                      Quantity: <strong className="text-ink">{item.quantity}</strong>
                      {item.unit ? ` ${item.unit}` : ""} ×{" "}
                      {formatPrice(item.unitPrice, item.currency || order.currency)}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-semibold text-forest">
                      {formatPrice(item.lineTotal, item.currency || order.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Price calculation summary */}
            <div className="mt-6 border-t border-line pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted">
                <span>Products Subtotal</span>
                <span className="font-medium text-ink">
                  {formatPrice(order.subtotal, order.currency)}
                </span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Shipping & Freight</span>
                <span className="font-medium text-ink">
                  {order.shippingAmount !== null && order.shippingAmount !== undefined
                    ? formatPrice(order.shippingAmount, order.currency)
                    : "To be confirmed"}
                </span>
              </div>
              <div className="flex justify-between border-t border-line pt-3 font-semibold text-forest text-base">
                <span>Total Amount</span>
                <span>{formatPrice(order.totalAmount, order.currency)}</span>
              </div>
            </div>
          </Card>

          {/* Customer details card */}
          <Card title="Customer & Delivery Details">
            <DetailList
              items={
                [
                  { label: "Customer Name", value: order.customer.name },
                  {
                    label: "Phone / WhatsApp",
                    value: (
                      <div className="flex items-center gap-3">
                        <a
                          href={`tel:${order.customer.phone}`}
                          className="inline-flex items-center gap-1.5 text-forest underline hover:text-gold"
                        >
                          <Phone className="h-3.5 w-3.5 text-gold-dark" />
                          {order.customer.phone}
                        </a>
                        {waReplyHref && (
                          <a
                            href={waReplyHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-full bg-[#25D366]/15 px-2.5 py-0.5 text-xs font-semibold text-[#1EBE5D] hover:bg-[#25D366]/25 transition-colors"
                          >
                            <MessageCircle className="h-3 w-3" />
                            Chat on WhatsApp
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                    ),
                  },
                  order.customer.email
                    ? {
                        label: "Email",
                        value: (
                          <a
                            href={`mailto:${order.customer.email}`}
                            className="inline-flex items-center gap-1.5 text-forest underline hover:text-gold"
                          >
                            <Mail className="h-3.5 w-3.5 text-gold-dark" />
                            {order.customer.email}
                          </a>
                        ),
                      }
                    : null,
                  order.customer.address
                    ? { label: "Street Address", value: order.customer.address }
                    : null,
                  {
                    label: "Destination",
                    value:
                      [order.customer.city, order.customer.state, order.customer.postalCode, order.customer.country]
                        .filter(Boolean)
                        .join(", ") || "—",
                  },
                  order.notes ? { label: "Customer Notes", value: order.notes } : null,
                  order.whatsappOpenedAt
                    ? {
                        label: "WhatsApp Opened",
                        value: formatDate(order.whatsappOpenedAt, true),
                      }
                    : null,
                ].filter(Boolean) as { label: string; value: React.ReactNode }[]
              }
            />
          </Card>
        </div>

        {/* Right Column: Status & Internal Notes */}
        <div className="space-y-6">
          <Card title="Order Status">
            <RecordActions
              endpoint={`/api/admin/orders/${id}`}
              status={order.status}
              statuses={orderStatuses}
              canDelete={admin.role === "admin"}
              entity="order"
              listHref="/admin/orders"
              deleteWarning="Deleting this order removes it permanently from the database."
            />
          </Card>

          <Card title="Internal Notes">
            <NotesPanel
              initialNotes={order.internalNotes ?? []}
              endpoint={`/api/admin/orders/${id}/notes`}
            />
          </Card>
        </div>
      </div>
    </>
  );
}

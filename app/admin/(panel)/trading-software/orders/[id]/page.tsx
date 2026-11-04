import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, Mail, MessageCircle, Phone } from "lucide-react";
import { Card, DetailList } from "@/components/admin/DetailList";
import { NotesPanel, type Note } from "@/components/admin/NotesPanel";
import { PageHeader } from "@/components/admin/PageHeader";
import { SoftwareOrderPanel } from "@/components/admin/SoftwareOrderPanel";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { isObjectId } from "@/lib/admin/api";
import { formatDate } from "@/lib/admin/client";
import { normalizeOrderStatus } from "@/lib/admin/constants";
import { getRecord, resources } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth/session";
import { formatPrice } from "@/lib/cart/price";

export const metadata: Metadata = { title: "Software Order" };

type OrderDoc = {
  _id: string;
  orderNumber: string;
  customer: { name: string; email: string; phone: string; company?: string; country?: string };
  items: { name: string; category?: string; licenceName: string; licenceType?: string; unitPrice: number; currency: string; lineTotal: number }[];
  amount: number;
  currency: string;
  notes?: string;
  status: string;
  paymentStatus: string;
  deliveryMethod?: string;
  deliveryStatus: string;
  licenceKey?: string;
  activationInstructions?: string;
  downloadUrl?: string;
  deliveredAt?: string | null;
  whatsappOpenedAt?: string | null;
  internalNotes?: Note[];
  createdAt: string;
};

export default async function SoftwareOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  if (!isObjectId(id)) notFound();
  const order = await getRecord<OrderDoc>(resources.softwareOrders, id);
  if (!order) notFound();

  const status = normalizeOrderStatus(order.status);
  const digits = order.customer.phone.replace(/\D/g, "");
  const waHref = digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(`Hello ${order.customer.name}, thank you for your software order (${order.orderNumber}) with Goldenfalcone.`)}`
    : null;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/trading-software/orders", label: "All software orders" }}
        title={`Order ${order.orderNumber}`}
        description={`Requested by ${order.customer.name} · ${formatDate(order.createdAt, true)}`}
        actions={<StatusBadge status={status} className="text-sm" />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Software ordered">
            <div className="divide-y divide-line">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{item.name}</p>
                    <p className="text-xs text-muted">{[item.category, item.licenceName].filter(Boolean).join(" · ")}</p>
                  </div>
                  <span className="shrink-0 font-semibold text-forest">{formatPrice(item.lineTotal, item.currency || order.currency)}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-between border-t border-line pt-4 text-base font-semibold text-forest">
              <span>Total</span>
              <span>{formatPrice(order.amount, order.currency)}</span>
            </div>
          </Card>

          <Card title="Customer">
            <DetailList
              items={[
                { label: "Name", value: order.customer.name },
                { label: "Company", value: order.customer.company },
                {
                  label: "Email",
                  value: (
                    <a href={`mailto:${order.customer.email}`} className="inline-flex items-center gap-1.5 text-forest underline hover:text-gold">
                      <Mail className="h-3.5 w-3.5 text-gold-dark" />
                      {order.customer.email}
                    </a>
                  ),
                },
                {
                  label: "Phone / WhatsApp",
                  value: (
                    <div className="flex flex-wrap items-center gap-3">
                      <a href={`tel:${order.customer.phone}`} className="inline-flex items-center gap-1.5 text-forest underline hover:text-gold">
                        <Phone className="h-3.5 w-3.5 text-gold-dark" />
                        {order.customer.phone}
                      </a>
                      {waHref ? (
                        <a
                          href={waHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-full bg-[#25D366]/15 px-2.5 py-0.5 text-xs font-semibold text-[#1EBE5D] transition-colors hover:bg-[#25D366]/25"
                        >
                          <MessageCircle className="h-3 w-3" />
                          Chat on WhatsApp
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      ) : null}
                    </div>
                  ),
                },
                { label: "Country", value: order.customer.country },
                { label: "Delivered", value: order.deliveredAt ? formatDate(order.deliveredAt, true) : "" },
                { label: "Customer notes", value: order.notes, wide: true },
              ]}
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Status & delivery">
            <SoftwareOrderPanel
              id={id}
              canDelete={admin.role === "admin"}
              initial={{
                status,
                paymentStatus: order.paymentStatus ?? "unpaid",
                deliveryMethod: order.deliveryMethod ?? "",
                deliveryStatus: order.deliveryStatus ?? "pending",
                licenceKey: order.licenceKey ?? "",
                activationInstructions: order.activationInstructions ?? "",
                downloadUrl: order.downloadUrl ?? "",
              }}
            />
          </Card>
          <Card title="Internal notes">
            <NotesPanel initialNotes={order.internalNotes ?? []} endpoint={`/api/admin/trading-software/orders/${id}/notes`} />
          </Card>
        </div>
      </div>
    </>
  );
}

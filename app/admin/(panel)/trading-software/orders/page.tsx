import type { Metadata } from "next";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/admin/client";
import { deliveryStatuses, normalizeOrderStatus, orderStatuses, toOptions } from "@/lib/admin/constants";
import { readListQuery } from "@/lib/admin/query";
import { listRecords, resources } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth/session";
import { formatPrice } from "@/lib/cart/price";

export const metadata: Metadata = { title: "Software Orders" };

type Row = {
  _id: string;
  orderNumber: string;
  customer: { name: string; email: string; phone: string };
  items: { name: string; licenceName: string }[];
  amount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  deliveryStatus: string;
  createdAt: string;
};

const columns: Column<Row>[] = [
  {
    header: "Order",
    primary: true,
    cell: (r) => (
      <div>
        <span className="font-mono font-semibold text-ink">{r.orderNumber}</span>
        <span className="block text-xs text-muted">{formatDate(r.createdAt, true)}</span>
      </div>
    ),
  },
  {
    header: "Customer",
    cell: (r) => (
      <div>
        <span className="font-medium text-ink">{r.customer?.name}</span>
        <span className="block text-xs text-muted">{r.customer?.email}</span>
      </div>
    ),
  },
  {
    header: "Software",
    cell: (r) => (
      <ul className="space-y-1 text-xs">
        {r.items?.map((item, i) => (
          <li key={i}>
            <span className="font-medium text-ink">{item.name}</span>
            <span className="block text-muted">{item.licenceName}</span>
          </li>
        ))}
      </ul>
    ),
  },
  { header: "Amount", cell: (r) => <span className="font-semibold text-forest">{formatPrice(r.amount, r.currency)}</span> },
  { header: "Payment", cell: (r) => <StatusBadge status={r.paymentStatus === "paid" ? "completed" : r.paymentStatus === "refunded" ? "cancelled" : "pending"} />, hideOnMobile: true },
  { header: "Delivery", cell: (r) => <StatusBadge status={r.deliveryStatus === "delivered" ? "completed" : r.deliveryStatus === "ready" ? "confirmed" : "pending"} />, hideOnMobile: true },
  { header: "Status", cell: (r) => <StatusBadge status={normalizeOrderStatus(r.status)} /> },
];

export default async function SoftwareOrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const { query, params } = readListQuery(await searchParams);
  const result = await listRecords<Row>(resources.softwareOrders, query);
  const filtered = Boolean(query.q || query.status || query.filter || query.from || query.to);

  return (
    <>
      <PageHeader
        title="Software Orders"
        description="Purchase requests for trading software. Every order stays pending and unpaid until you confirm it and record payment here."
      />
      <ListToolbar
        searchPlaceholder="Search order, customer, email or software"
        statuses={toOptions(orderStatuses)}
        filter={{ label: "Delivery", options: toOptions(deliveryStatuses) }}
        dates
      />
      {result.items.length ? (
        <>
          <DataTable
            caption="Software orders"
            columns={columns}
            rows={result.items}
            rowHref={(r) => `/admin/trading-software/orders/${r._id}`}
            rowLabel={(r) => `${r.orderNumber} (${r.customer?.name})`}
          />
          <Pagination basePath="/admin/trading-software/orders" params={params} page={result.page} pages={result.pages} total={result.total} />
        </>
      ) : (
        <EmptyState
          title={filtered ? "No matching orders" : "No software orders yet"}
          description={filtered ? "Try a different search or clear the filters." : "Purchase requests from the software page will appear here."}
        />
      )}
    </>
  );
}

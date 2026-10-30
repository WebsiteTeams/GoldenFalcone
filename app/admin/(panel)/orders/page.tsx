import type { Metadata } from "next";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/admin/client";
import { orderStatuses, toOptions } from "@/lib/admin/constants";
import { readListQuery } from "@/lib/admin/query";
import { listRecords, resources } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth/session";
import { formatPrice } from "@/lib/cart/price";

export const metadata: Metadata = { title: "Spice Orders" };

type Row = {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    city?: string;
    country?: string;
  };
  items: Array<{ name: string; quantity: number; unit?: string }>;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
};

const columns: Column<Row>[] = [
  {
    header: "Order Ref",
    primary: true,
    cell: (r) => (
      <div>
        <span className="font-mono font-semibold text-ink">{r.orderNumber}</span>
        <span className="block text-xs text-muted">
          {r.items?.length || 0} item{r.items?.length !== 1 ? "s" : ""}
        </span>
      </div>
    ),
  },
  {
    header: "Customer",
    cell: (r) => (
      <div>
        <span className="font-medium text-ink">{r.customer?.name}</span>
        <span className="block text-xs text-muted">{r.customer?.phone}</span>
      </div>
    ),
  },
  {
    header: "Location",
    cell: (r) => (
      <span className="text-muted text-xs">
        {[r.customer?.city, r.customer?.country].filter(Boolean).join(", ") || "—"}
      </span>
    ),
    hideOnMobile: true,
  },
  {
    header: "Total",
    cell: (r) => (
      <span className="font-semibold text-forest">
        {formatPrice(r.totalAmount, r.currency || "INR")}
      </span>
    ),
  },
  {
    header: "Received",
    cell: (r) => formatDate(r.createdAt),
    hideOnMobile: true,
  },
  {
    header: "Status",
    cell: (r) => <StatusBadge status={r.status} />,
  },
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const { query, params } = readListQuery(await searchParams);
  const result = await listRecords<Row>(resources.orders, query);
  const filtered = Boolean(query.q || query.status || query.from || query.to);

  return (
    <>
      <PageHeader
        title="Spice Orders"
        description="Orders and WhatsApp enquiry requests submitted through the spices e-commerce storefront."
      />
      <ListToolbar
        searchPlaceholder="Search order ref, customer name, or phone"
        statuses={toOptions(orderStatuses)}
        dates
      />
      {result.items.length ? (
        <>
          <DataTable
            caption="Spice Orders"
            columns={columns}
            rows={result.items}
            rowHref={(r) => `/admin/orders/${r._id}`}
            rowLabel={(r) => `${r.orderNumber} (${r.customer?.name})`}
          />
          <Pagination
            basePath="/admin/orders"
            params={params}
            page={result.page}
            pages={result.pages}
            total={result.total}
          />
        </>
      ) : (
        <EmptyState
          title={filtered ? "No matching orders" : "No spice orders yet"}
          description={
            filtered
              ? "Try a different search or clear the filters."
              : "When customers submit an order through the spices store, it will appear here."
          }
        />
      )}
    </>
  );
}

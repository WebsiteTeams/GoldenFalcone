import type { Metadata } from "next";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { ExportOrdersButton } from "@/components/admin/ExportOrdersButton";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/admin/client";
import { normalizeOrderStatus, orderSourceLabels, orderSources, orderStatuses, toOptions, type OrderSource } from "@/lib/admin/constants";
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
  items: Array<{ name: string; quality?: string; quantity: number; unit?: string; unitPrice: number; currency?: string }>;
  totalAmount: number;
  currency: string;
  source?: OrderSource;
  status: string;
  createdAt: string;
};

const columns: Column<Row>[] = [
  {
    header: "Order ID",
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
        <span className="block text-xs text-muted">{r.customer?.phone}</span>
      </div>
    ),
  },
  {
    header: "Products",
    cell: (r) => (
      <ul className="space-y-1 text-xs">
        {r.items?.map((item, i) => (
          <li key={i}>
            <span className="font-medium text-ink">{item.name}</span>
            <span className="block text-muted">
              {[item.quality, `${item.quantity} ${item.unit || "kg"}`, `${formatPrice(item.unitPrice, item.currency || r.currency || "INR")}/${item.unit || "kg"}`]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </li>
        ))}
      </ul>
    ),
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
    header: "Source",
    cell: (r) => <span className="text-xs text-muted">{orderSourceLabels[r.source ?? "website"]}</span>,
    hideOnMobile: true,
  },
  {
    header: "Status",
    cell: (r) => <StatusBadge status={normalizeOrderStatus(r.status)} />,
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
  const filtered = Boolean(query.q || query.status || query.filter || query.from || query.to);

  return (
    <>
      <PageHeader
        title="Spice Orders"
        description="Orders submitted through the spices store. Every order stays pending until you confirm it here; sharing it on WhatsApp does not confirm it."
        actions={<ExportOrdersButton />}
      />
      <ListToolbar
        searchPlaceholder="Search order ID, customer, phone or product"
        statuses={toOptions(orderStatuses)}
        filter={{ label: "Source", options: orderSources.map((value) => ({ value, label: orderSourceLabels[value] })) }}
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

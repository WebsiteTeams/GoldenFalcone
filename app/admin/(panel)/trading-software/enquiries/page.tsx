import type { Metadata } from "next";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/admin/client";
import { enquiryStatuses, toOptions } from "@/lib/admin/constants";
import { readListQuery } from "@/lib/admin/query";
import { listRecords, resources } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import { TradingSoftware } from "@/models/TradingSoftware";

export const metadata: Metadata = { title: "Software Demo Requests" };

type Row = { _id: string; name: string; email: string; softwareName?: string; preferredContactMethod?: string; status: string; createdAt: string };

const columns: Column<Row>[] = [
  { header: "Name", primary: true, cell: (r) => r.name },
  { header: "Contact", cell: (r) => <span className="text-muted">{r.email}</span>, hideOnMobile: true },
  { header: "Software", cell: (r) => r.softwareName || <span className="text-muted">General</span> },
  { header: "Prefers", cell: (r) => <span className="text-muted">{r.preferredContactMethod}</span>, hideOnMobile: true },
  { header: "Received", cell: (r) => formatDate(r.createdAt) },
  { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
];

export default async function SoftwareEnquiriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const { query, params } = readListQuery(await searchParams);
  const result = await listRecords<Row>(resources.softwareEnquiries, query);
  const filtered = Boolean(query.q || query.status || query.filter || query.from || query.to);

  await connectToDatabase();
  const products = await TradingSoftware.find().select("name").sort({ name: 1 }).limit(200).lean();

  return (
    <>
      <PageHeader title="Demo Requests" description="Demo and product enquiries from the trading software page." />
      <ListToolbar
        searchPlaceholder="Search name, email, phone or software"
        statuses={toOptions(enquiryStatuses)}
        filter={{ label: "Software", options: products.map((p) => ({ value: String(p._id), label: p.name })) }}
        dates
      />
      {result.items.length ? (
        <>
          <DataTable
            caption="Demo requests"
            columns={columns}
            rows={result.items}
            rowHref={(r) => `/admin/trading-software/enquiries/${r._id}`}
            rowLabel={(r) => r.name}
          />
          <Pagination basePath="/admin/trading-software/enquiries" params={params} page={result.page} pages={result.pages} total={result.total} />
        </>
      ) : (
        <EmptyState
          title={filtered ? "No matching requests" : "No demo requests yet"}
          description={filtered ? "Try a different search or clear the filters." : "Requests submitted on the trading software page will appear here."}
        />
      )}
    </>
  );
}

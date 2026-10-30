import type { Metadata } from "next";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/admin/client";
import { enquiryStatuses, serviceTypeLabels, toOptions } from "@/lib/admin/constants";
import { readListQuery } from "@/lib/admin/query";
import { listRecords, resources } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth/session";
import { serviceTypes } from "@/lib/validations";

export const metadata: Metadata = { title: "Enquiries" };

type Row = { _id: string; name: string; email: string; phone?: string; serviceType: string; status: string; createdAt: string };

const columns: Column<Row>[] = [
  { header: "Name", primary: true, cell: (r) => r.name },
  { header: "Contact", cell: (r) => <span className="text-muted">{r.email}</span>, hideOnMobile: true },
  { header: "Service", cell: (r) => serviceTypeLabels[r.serviceType] ?? r.serviceType },
  { header: "Received", cell: (r) => formatDate(r.createdAt) },
  { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
];

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const { query, params } = readListQuery(await searchParams);
  const result = await listRecords<Row>(resources.enquiries, query);
  const filtered = Boolean(query.q || query.status || query.filter || query.from || query.to);

  return (
    <>
      <PageHeader title="Enquiries" description="Business enquiries submitted through the website, across every division." />
      <ListToolbar
        searchPlaceholder="Search name, email or phone"
        statuses={toOptions(enquiryStatuses)}
        filter={{ label: "Service", options: serviceTypes.map((s) => ({ value: s, label: serviceTypeLabels[s] })) }}
        dates
      />
      {result.items.length ? (
        <>
          <DataTable caption="Enquiries" columns={columns} rows={result.items} rowHref={(r) => `/admin/enquiries/${r._id}`} rowLabel={(r) => r.name} />
          <Pagination basePath="/admin/enquiries" params={params} page={result.page} pages={result.pages} total={result.total} />
        </>
      ) : (
        <EmptyState
          title={filtered ? "No matching enquiries" : "No enquiries yet"}
          description={filtered ? "Try a different search or clear the filters." : "Enquiries submitted on the website will appear here."}
        />
      )}
    </>
  );
}

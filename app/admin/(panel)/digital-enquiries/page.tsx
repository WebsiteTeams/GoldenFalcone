import type { Metadata } from "next";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/admin/client";
import { enquiryStatuses, serviceTypes, toOptions } from "@/lib/admin/constants";
import { readListQuery } from "@/lib/admin/query";
import { listRecords, resources } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Enquiries" };

type EnquiryRow = {
  _id: string;
  referenceNumber: string;
  name: string;
  email: string;
  serviceType: string;
  status: string;
  createdAt: string;
};

const columns: Column<EnquiryRow>[] = [
  { header: "Reference", primary: true, cell: (r) => referenceNumberCell(r) },
  { header: "Client", cell: (r) => fullNameCell(r), hideOnMobile: true },
  { header: "Service", cell: (r) => r.serviceType },
  { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
  { header: "Received", cell: (r) => formatDate(r.createdAt) },
];

function referenceNumberCell(r: EnquiryRow) {
  return (
    <a
      href={`/admin/enquiries/${r._id}`}
      className="font-medium text-forest hover:text-gold transition-colors"
    >
      #{r.referenceNumber}
    </a>
  );
}

function fullNameCell(r: EnquiryRow) {
  return (
    <span>
      {r.name}
      {r.email && <span className="ml-2 text-xs text-gold/60">({r.email})</span>}
    </span>
  );
}

export default async function DigitalEnquiriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const { query, params } = readListQuery(await searchParams);
  const result = await listRecords<EnquiryRow>(resources.enquiries, query);
  const filtered = Boolean(query.q || query.status || query.filter || query.serviceType || query.from || query.to);

  return (
    <>
      <PageHeader
        title="Enquiries"
        description="Project enquiries submitted via the website"
      />
      <ListToolbar
        searchPlaceholder="Search reference number, name or email"
        statuses={toOptions(enquiryStatuses)}
        filter={{ label: "Service Type", options: serviceTypes.map((st) => ({ value: st, label: st })) }}
        dates
      />
      {result.items.length ? (
        <>
          <DataTable
            caption="Enquiries"
            columns={columns}
            rows={result.items}
            rowHref={(r) => `/admin/enquiries/${r._id}`}
            rowLabel={(r) => r.referenceNumber}
          />
          <Pagination basePath="/admin/enquiries" params={params} page={result.page} pages={result.pages} total={result.total} />
        </>
      ) : (
        <EmptyState
          title={filtered ? "No matching enquiries" : "No enquiries yet"}
          description={filtered ? "Try a different search or clear the filters." : "Enquiries submitted via the website will appear here."}
        />
      )}
    </>
  );
}
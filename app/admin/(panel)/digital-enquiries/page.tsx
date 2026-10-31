import type { Metadata } from "next";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/admin/client";
import { digitalEnquiryStatuses, digitalIndustries, digitalProjectTypes, toOptions } from "@/lib/admin/constants";
import { readListQuery } from "@/lib/admin/query";
import { listRecords, resources } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Digital Enquiries" };

type DigitalEnquiryRow = {
  _id: string;
  referenceNumber: string;
  fullName: string;
  email: string;
  projectType: string;
  projectName?: string;
  industry: string;
  status: string;
  createdAt: string;
};

const columns: Column<DigitalEnquiryRow>[] = [
  { header: "Reference", primary: true, cell: (r) => referenceNumberCell(r) },
  { header: "Client", cell: (r) => fullNameCell(r), hideOnMobile: true },
  { header: "Project Type", cell: (r) => r.projectType },
  { header: "Industry", cell: (r) => r.industry },
  { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
  { header: "Received", cell: (r) => formatDate(r.createdAt) },
];

function referenceNumberCell(r: DigitalEnquiryRow) {
  return (
    <a
      href={`/admin/digital-enquiries/${r._id}`}
      className="font-medium text-forest hover:text-gold transition-colors"
    >
      #{r.referenceNumber}
    </a>
  );
}

function fullNameCell(r: DigitalEnquiryRow) {
  return (
    <span>
      {r.fullName}
      {r.projectName && <span className="ml-2 text-xs text-gold/60">({r.projectName})</span>}
    </span>
  );
}

export default async function DigitalEnquiriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const { query, params } = readListQuery(await searchParams);
  const result = await listRecords<DigitalEnquiryRow>(resources.digitalEnquiries, query);
  const filtered = Boolean(query.q || query.status || query.filter || query.industry || query.from || query.to);

  return (
    <>
      <PageHeader
        title="Digital Enquiries"
        description="Project enquiries for websites, mobile apps, web applications and custom software"
      />
      <ListToolbar
        searchPlaceholder="Search reference number, name or email"
        statuses={toOptions(digitalEnquiryStatuses)}
        filter={{ label: "Project Type", options: digitalProjectTypes.map((pt) => ({ value: pt, label: pt })) }}
        filters={[{ name: "industry", label: "Industry", options: digitalIndustries.map((ind) => ({ value: ind, label: ind })) }]}
        dates
      />
      {result.items.length ? (
        <>
          <DataTable
            caption="Digital Enquiries"
            columns={columns}
            rows={result.items}
            rowHref={(r) => `/admin/digital-enquiries/${r._id}`}
            rowLabel={(r) => r.referenceNumber}
          />
          <Pagination basePath="/admin/digital-enquiries" params={params} page={result.page} pages={result.pages} total={result.total} />
        </>
      ) : (
        <EmptyState
          title={filtered ? "No matching digital enquiries" : "No digital enquiries yet"}
          description={filtered ? "Try a different search or clear the filters." : "Project enquiries submitted via the Digital Solutions page will appear here."}
        />
      )}
    </>
  );
}
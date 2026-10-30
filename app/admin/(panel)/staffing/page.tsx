import type { Metadata } from "next";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/admin/client";
import { staffingStatuses, toOptions } from "@/lib/admin/constants";
import { readListQuery } from "@/lib/admin/query";
import { listRecords, resources } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth/session";
import { employmentTypes, salonRoles } from "@/lib/content";

export const metadata: Metadata = { title: "Staffing Requests" };

type Row = {
  _id: string;
  salonName: string;
  contactName: string;
  location: string;
  businessType?: string;
  professionalCategory: string;
  quantity: number;
  employmentType?: string;
  referenceNumber?: string;
  status: string;
  createdAt: string;
};

const columns: Column<Row>[] = [
  { header: "Salon", primary: true, cell: (r) => r.salonName },
  { header: "Reference", cell: (r) => <span className="font-mono text-xs text-muted">{r.referenceNumber ?? "—"}</span>, hideOnMobile: true },
  { header: "Contact", cell: (r) => r.contactName, hideOnMobile: true },
  { header: "Location", cell: (r) => r.location },
  { header: "Role", cell: (r) => r.professionalCategory },
  { header: "Qty", cell: (r) => <span className="tabular-nums">{r.quantity}</span>, className: "w-16" },
  { header: "Type", cell: (r) => r.employmentType ?? "—", hideOnMobile: true },
  { header: "Requested", cell: (r) => formatDate(r.createdAt), hideOnMobile: true },
  { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
];

export default async function StaffingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const { query, params } = readListQuery(await searchParams);
  const result = await listRecords<Row>(resources.staffing, query);
  const filtered = Boolean(
    query.q || query.status || query.filter || query.location || query.employment || query.from || query.to,
  );

  return (
    <>
      <PageHeader title="Staffing Requests" description="Hiring requirements from salon and beauty-business owners looking for professionals." />
      <ListToolbar
        searchPlaceholder="Search salon, contact, location, reference or role"
        statuses={toOptions(staffingStatuses)}
        filter={{ label: "Role", options: salonRoles.map((r) => ({ value: r, label: r })) }}
        filters={[{ name: "employment", label: "Type", options: employmentTypes.map((t) => ({ value: t, label: t })) }]}
        textFilters={[{ name: "location", label: "Location", placeholder: "City or area" }]}
        dates
      />
      {result.items.length ? (
        <>
          <DataTable caption="Staffing requests" columns={columns} rows={result.items} rowHref={(r) => `/admin/staffing/${r._id}`} rowLabel={(r) => r.salonName} />
          <Pagination basePath="/admin/staffing" params={params} page={result.page} pages={result.pages} total={result.total} />
        </>
      ) : (
        <EmptyState
          title={filtered ? "No matching requests" : "No staffing requests yet"}
          description={filtered ? "Try a different search or clear the filters." : "Requests submitted on the salon staffing page will appear here."}
        />
      )}
    </>
  );
}

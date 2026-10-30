import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { PurgeButton } from "@/components/admin/PurgeButton";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { EmptyState } from "@/components/admin/EmptyState";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/admin/client";
import { candidateStatuses, toOptions } from "@/lib/admin/constants";
import { readListQuery } from "@/lib/admin/query";
import { listRecords, resources } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth/session";
import { getSettings } from "@/lib/cms";
import { salonRoles } from "@/lib/content";
import { experienceOptions } from "@/lib/validations";

export const metadata: Metadata = { title: "Candidates" };

type Row = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  professionalCategory: string;
  experience: string;
  location: string;
  preferredWorkLocation?: string;
  employmentPreference?: string;
  availability?: string;
  status: string;
  cv?: { originalName?: string };
  createdAt: string;
};

const columns: Column<Row>[] = [
  { header: "Name", primary: true, cell: (r) => r.fullName },
  { header: "Role", cell: (r) => r.professionalCategory },
  { header: "Experience", cell: (r) => r.experience, hideOnMobile: true },
  { header: "Location", cell: (r) => r.location },
  { header: "Availability", cell: (r) => r.availability || "—", hideOnMobile: true },
  {
    header: "CV",
    cell: (r) => (r.cv?.originalName ? <FileText aria-label="CV attached" className="h-4 w-4 text-emerald" /> : <span className="text-muted">—</span>),
    className: "w-12",
    hideOnMobile: true,
  },
  { header: "Applied", cell: (r) => formatDate(r.createdAt), hideOnMobile: true },
  { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
];

export default async function CandidatesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const admin = await requireAdmin();
  const { query, params } = readListQuery(await searchParams);
  const [result, settings] = await Promise.all([listRecords<Row>(resources.candidates, query), getSettings()]);
  const filtered = Boolean(
    query.q ||
      query.status ||
      query.filter ||
      query.location ||
      query.experience ||
      query.availability ||
      query.skill ||
      query.from ||
      query.to,
  );

  return (
    <>
      <PageHeader
        title="Candidates"
        description={`Salon professionals who have submitted their profiles. Personal data is retained for ${settings.retentionMonths} months (change in Settings).`}
        actions={admin.role === "admin" ? <PurgeButton months={settings.retentionMonths} /> : null}
      />
      <ListToolbar
        searchPlaceholder="Search name, email, phone, location, skill or reference"
        statuses={toOptions(candidateStatuses)}
        filter={{ label: "Role", options: salonRoles.map((r) => ({ value: r, label: r })) }}
        filters={[
          { name: "experience", label: "Experience", options: experienceOptions.map((e) => ({ value: e, label: e })) },
        ]}
        textFilters={[
          { name: "location", label: "Location", placeholder: "City or area" },
          { name: "availability", label: "Availability", placeholder: "e.g. immediate" },
          { name: "skill", label: "Skill", placeholder: "e.g. balayage" },
        ]}
        dates
      />
      {result.items.length ? (
        <>
          <DataTable caption="Candidate profiles" columns={columns} rows={result.items} rowHref={(r) => `/admin/candidates/${r._id}`} rowLabel={(r) => r.fullName} />
          <Pagination basePath="/admin/candidates" params={params} page={result.page} pages={result.pages} total={result.total} />
        </>
      ) : (
        <EmptyState
          title={filtered ? "No matching candidates" : "No profiles yet"}
          description={filtered ? "Try a different search or clear the filters." : "Candidate profiles submitted on the salon staffing page will appear here."}
        />
      )}
    </>
  );
}

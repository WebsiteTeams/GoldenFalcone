import type { Metadata } from "next";
import { GraduationCap, Plus } from "lucide-react";
import { ButtonLink } from "@/components/admin/Button";
import { CatalogueList, type CatalogueRow } from "@/components/admin/catalogue/CatalogueList";
import { PageHeader } from "@/components/admin/PageHeader";
import { readListQuery } from "@/lib/admin/query";
import { listRecords, resources } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Mentorship" };

type Row = CatalogueRow & { title: string; format?: string; topics: string[] };

export default async function MentorshipAdminPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const { query, params } = readListQuery(await searchParams);
  const result = await listRecords<Row>(resources.mentorship, query);

  return (
    <>
      <PageHeader
        title="Mentorship Programmes"
        description="Educational programmes listed on the trading mentorship page. Published programmes appear above the curriculum."
        actions={
          <ButtonLink href="/admin/mentorship/new" icon={<Plus aria-hidden className="h-4 w-4" />}>
            Add programme
          </ButtonLink>
        }
      />
      <CatalogueList
        result={result}
        query={query}
        params={params}
        basePath="/admin/mentorship"
        editPath="/admin/mentorship"
        newHref="/admin/mentorship/new"
        newLabel="Add programme"
        noun="programmes"
        icon={GraduationCap}
        title={(r) => r.title}
        searchPlaceholder="Search programmes"
        emptyText="The mentorship page shows its built-in curriculum until a programme is published."
        extraColumns={[
          { header: "Format", cell: (r) => r.format || <span className="text-muted">—</span> },
          { header: "Topics", cell: (r) => <span className="tabular-nums text-muted">{r.topics.length}</span>, className: "w-20", hideOnMobile: true },
        ]}
      />
    </>
  );
}

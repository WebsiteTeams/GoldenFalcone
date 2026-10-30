import type { Metadata } from "next";
import Link from "next/link";
import { FolderKanban, MonitorSmartphone, Plus } from "lucide-react";
import { ButtonLink } from "@/components/admin/Button";
import { CatalogueList, type CatalogueRow } from "@/components/admin/catalogue/CatalogueList";
import { PageHeader } from "@/components/admin/PageHeader";
import { readListQuery } from "@/lib/admin/query";
import { listRecords, resources } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Digital Services" };

type ServiceRow = CatalogueRow & { title: string; category?: string; startingPrice?: string };
type ProjectRow = CatalogueRow & { title: string; category?: string; isConcept: boolean };

const tabs = [
  { key: "services", label: "Services", icon: MonitorSmartphone },
  { key: "portfolio", label: "Portfolio", icon: FolderKanban },
] as const;

export default async function DigitalServicesAdminPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const { query, params } = readListQuery(await searchParams);
  const tab = params.tab === "portfolio" ? "portfolio" : "services";
  const newHref = tab === "portfolio" ? "/admin/digital-services/portfolio/new" : "/admin/digital-services/services/new";

  return (
    <>
      <PageHeader
        title="Digital Services"
        description="Services and portfolio items shown on the digital solutions page. Only published items are visible."
        actions={
          <ButtonLink href={newHref} icon={<Plus aria-hidden className="h-4 w-4" />}>
            {tab === "portfolio" ? "Add project" : "Add service"}
          </ButtonLink>
        }
      />

      <nav aria-label="Digital content" className="mb-6 inline-flex rounded-xl border border-line bg-white p-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <Link
            key={key}
            href={key === "services" ? "/admin/digital-services" : "/admin/digital-services?tab=portfolio"}
            aria-current={tab === key ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === key ? "bg-forest text-ivory" : "text-ink hover:bg-ivory",
            )}
          >
            <Icon aria-hidden className={cn("h-4 w-4", tab === key && "text-gold")} />
            {label}
          </Link>
        ))}
      </nav>

      {tab === "services" ? (
        <CatalogueList<ServiceRow>
          result={await listRecords<ServiceRow>(resources["digital-services"], query)}
          query={query}
          params={params}
          basePath="/admin/digital-services"
          editPath="/admin/digital-services/services"
          newHref={newHref}
          newLabel="Add service"
          noun="services"
          icon={MonitorSmartphone}
          title={(r) => r.title}
          searchPlaceholder="Search services"
          emptyText="The digital solutions page shows its built-in service list until a service is published."
          extraColumns={[
            { header: "Category", cell: (r) => r.category || <span className="text-muted">—</span> },
            { header: "Starting price", cell: (r) => r.startingPrice || <span className="text-muted">Hidden</span>, hideOnMobile: true },
          ]}
        />
      ) : (
        <CatalogueList<ProjectRow>
          result={await listRecords<ProjectRow>(resources.portfolio, query)}
          query={query}
          params={params}
          basePath="/admin/digital-services"
          editPath="/admin/digital-services/portfolio"
          newHref={newHref}
          newLabel="Add project"
          noun="portfolio projects"
          icon={FolderKanban}
          title={(r) => r.title}
          searchPlaceholder="Search projects"
          emptyText="The digital solutions page shows its built-in concept showcases until a project is published."
          extraColumns={[
            { header: "Category", cell: (r) => r.category || <span className="text-muted">—</span> },
            { header: "Type", cell: (r) => (r.isConcept ? "Concept" : "Client work") },
          ]}
        />
      )}
    </>
  );
}

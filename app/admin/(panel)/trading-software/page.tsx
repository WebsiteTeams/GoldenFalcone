import type { Metadata } from "next";
import { Monitor, Plus } from "lucide-react";
import { ButtonLink } from "@/components/admin/Button";
import { CatalogueList, type CatalogueRow } from "@/components/admin/catalogue/CatalogueList";
import { PageHeader } from "@/components/admin/PageHeader";
import { availabilityOptions, labelFor, softwareCategories, softwareCategoryLabel } from "@/lib/admin/constants";
import { readListQuery } from "@/lib/admin/query";
import { listRecords, resources } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth/session";
import { formatPrice } from "@/lib/cart/price";

export const metadata: Metadata = { title: "Trading Software" };

type Row = CatalogueRow & { name: string; category: string; startingPrice: number | null; currency: string; availability: string; featured: boolean };

export default async function TradingSoftwareAdminPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const { query, params } = readListQuery(await searchParams);
  const result = await listRecords<Row>(resources.software, query);

  return (
    <>
      <PageHeader
        title="Trading Software"
        description="Software products sold on the trading software page. Published products appear there immediately; drafts stay hidden."
        actions={
          <ButtonLink href="/admin/trading-software/new" icon={<Plus aria-hidden className="h-4 w-4" />}>
            Add software
          </ButtonLink>
        }
      />
      <CatalogueList
        result={result}
        query={query}
        params={params}
        basePath="/admin/trading-software"
        editPath="/admin/trading-software"
        newHref="/admin/trading-software/new"
        newLabel="Add software"
        noun="software products"
        icon={Monitor}
        title={(r) => r.name}
        searchPlaceholder="Search software"
        filter={{ label: "Category", options: softwareCategories.map(({ value, label }) => ({ value, label })) }}
        emptyText="The software page shows an empty state until a product is published."
        extraColumns={[
          { header: "Category", cell: (r) => softwareCategoryLabel(r.category), hideOnMobile: true },
          { header: "From", cell: (r) => (r.startingPrice !== null ? formatPrice(r.startingPrice, r.currency) : <span className="text-muted">On request</span>) },
          { header: "Availability", cell: (r) => <span className="text-xs text-muted">{labelFor(r.availability, availabilityOptions)}</span>, hideOnMobile: true },
          { header: "Featured", cell: (r) => (r.featured ? <span className="text-xs font-semibold text-gold-dark">Featured</span> : <span className="text-muted">—</span>), className: "w-24", hideOnMobile: true },
        ]}
      />
    </>
  );
}

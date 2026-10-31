import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronRight as Separator, SearchX } from "lucide-react";
import { ShopControls } from "@/components/spices/ShopControls";
import { SpiceProductCard } from "@/components/spices/SpiceProductCard";
import { productTypeLabels, productTypes, type ProductType } from "@/lib/admin/constants";
import { getPublishedSpices, getSettings } from "@/lib/cms";
import { catalogueHref, queryCatalogue, readCatalogueQuery } from "@/lib/spices/catalogue";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const typeHeadings: Record<ProductType, { title: string; intro: string }> = {
  powder: { title: "Spice Powders", intro: "Ground spices in three quality levels, priced per kilogram." },
  solid: { title: "Solid & Whole Spices", intro: "Whole spices in three quality levels, priced per kilogram." },
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { type, q, page } = readCatalogueQuery(await searchParams);
  const title = `${type ? typeHeadings[type].title : "Shop All Spices"} | Goldenfalcone`;
  return {
    title,
    description: type ? `${typeHeadings[type].intro} Compare quality, sourcing and lab reports at Goldenfalcone.` : "Shop spice powders and whole spices from Goldenfalcone. Compare quality levels, sourcing areas, lab reports and prices per kilogram.",
    // Each category's first page is the version search engines should index.
    alternates: { canonical: catalogueHref({ type }) },
    robots: q || page > 1 ? { index: false, follow: true } : undefined,
    openGraph: { title, url: catalogueHref({ type }) },
  };
}

export default async function ShopPage({ searchParams }: Props) {
  const query = readCatalogueQuery(await searchParams);
  const [products, settings] = await Promise.all([getPublishedSpices(), getSettings()]);
  const result = queryCatalogue(products, query, settings.store.productsPerPage);
  const heading = query.type ? typeHeadings[query.type] : { title: "All Spices", intro: "Powders and whole spices in three quality levels, priced per kilogram." };

  const tabs: { label: string; type: ProductType | null }[] = [
    { label: "All", type: null },
    ...productTypes.map((type) => ({ label: productTypeLabels[type], type })),
  ];
  const countFor = (type: ProductType | null) => (type ? products.filter((p) => p.productType === type).length : products.length);

  return (
    <div className="min-h-screen bg-ivory pb-24">
      <header className="bg-forest-deep pb-14 pt-32 text-ivory sm:pt-36">
        <div className="container-lux">
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs text-ivory/60">
            <Link href="/spices" className="transition-colors hover:text-gold">Spices</Link>
            <Separator aria-hidden className="h-3.5 w-3.5" />
            <span className="text-ivory" aria-current="page">{heading.title}</span>
          </nav>
          <h1 className="text-5xl text-ivory sm:text-6xl">{heading.title}</h1>
          <p className="mt-3 max-w-xl text-ivory/70">{heading.intro}</p>
        </div>
      </header>

      <div className="container-lux">
        <div className="flex flex-col gap-4 border-b border-line py-6 lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label="Product categories" className="flex flex-wrap gap-2">
            {tabs.map(({ label, type }) => {
              const active = query.type === type;
              return (
                <Link
                  key={label}
                  href={catalogueHref({ type, q: query.q, sort: query.sort })}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                    active ? "bg-forest text-ivory" : "border border-line bg-white text-forest hover:border-gold"
                  }`}
                >
                  {label} <span className={active ? "text-ivory/70" : "text-muted"}>({countFor(type)})</span>
                </Link>
              );
            })}
          </nav>
          <ShopControls query={query} />
        </div>

        <p role="status" className="mt-6 text-sm text-muted">
          {result.total === 0 ? "No products found" : `Showing ${result.items.length} of ${result.total} product${result.total === 1 ? "" : "s"}`}
          {query.q ? ` for “${query.q}”` : ""}
        </p>

        {result.items.length ? (
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {result.items.map((spice) => (
              <li key={spice.id}>
                <SpiceProductCard spice={spice} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 rounded-[1.25rem] border border-line bg-white p-12 text-center">
            <SearchX aria-hidden className="mx-auto h-8 w-8 text-gold-dark" strokeWidth={1.5} />
            <h2 className="mt-4 text-3xl text-forest">{query.q || query.type ? "No matching products" : "Our range is being prepared"}</h2>
            <p className="mt-2 text-muted">{query.q || query.type ? "Try a different search or category." : "New products will appear here as soon as they are published."}</p>
            {query.q || query.type ? (
              <Link href="/spices/shop" className="mt-6 inline-flex rounded-full bg-forest px-7 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-emerald">
                View all spices
              </Link>
            ) : null}
          </div>
        )}

        {result.pages > 1 ? (
          <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
            {result.page > 1 ? (
              <Link href={catalogueHref({ ...query, page: result.page - 1 })} rel="prev" aria-label="Previous page" className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-forest transition-colors hover:border-gold">
                <ChevronLeft aria-hidden className="h-4 w-4" />
              </Link>
            ) : null}
            {Array.from({ length: result.pages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={catalogueHref({ ...query, page })}
                aria-label={`Page ${page}`}
                aria-current={page === result.page ? "page" : undefined}
                className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-medium tabular-nums transition-colors ${
                  page === result.page ? "bg-forest text-ivory" : "border border-line bg-white text-forest hover:border-gold"
                }`}
              >
                {page}
              </Link>
            ))}
            {result.page < result.pages ? (
              <Link href={catalogueHref({ ...query, page: result.page + 1 })} rel="next" aria-label="Next page" className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-forest transition-colors hover:border-gold">
                <ChevronRight aria-hidden className="h-4 w-4" />
              </Link>
            ) : null}
          </nav>
        ) : null}
      </div>
    </div>
  );
}

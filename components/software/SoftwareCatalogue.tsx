"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, RefreshCw, SlidersHorizontal, X } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { softwareSorts, type SoftwareFilters } from "@/lib/software/filters";
import { cn } from "@/lib/utils";
import { useCatalogue } from "./CatalogueProvider";
import { SoftwareCard } from "./SoftwareCard";

const control =
  "h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink placeholder:text-muted/60 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15";

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">{label}</span>
      {children}
    </label>
  );
}

function CardSkeleton() {
  return (
    <div aria-hidden className="overflow-hidden rounded-[1.5rem] border border-line bg-white">
      <div className="aspect-[16/10] animate-pulse bg-ivory-dark" />
      <div className="space-y-3 p-6">
        <div className="h-3 w-24 animate-pulse rounded bg-ivory-dark" />
        <div className="h-7 w-3/4 animate-pulse rounded bg-ivory-dark" />
        <div className="h-3 w-full animate-pulse rounded bg-ivory-dark" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-ivory-dark" />
      </div>
    </div>
  );
}

export function SoftwareCatalogue() {
  const { filters, items, facets, status, activeCount, setFilters, clearFilters, retry } = useCatalogue();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const total = facets?.total ?? 0;
  const noProducts = status === "ready" && total === 0;
  const pick = <K extends keyof SoftwareFilters>(key: K) => (e: React.ChangeEvent<HTMLSelectElement>) => setFilters({ [key]: e.target.value || undefined } as Partial<SoftwareFilters>);
  const price = (key: "min" | "max") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = e.target.value === "" ? undefined : Number(e.target.value);
    setFilters({ [key]: n !== undefined && Number.isFinite(n) && n >= 0 ? n : undefined } as Partial<SoftwareFilters>);
  };

  const chips: { key: keyof SoftwareFilters; label: string }[] = [
    filters.category && { key: "category" as const, label: facets?.categories.find((c) => c.value === filters.category)?.short ?? filters.category },
    filters.market && { key: "market" as const, label: facets?.markets.find((c) => c.value === filters.market)?.label ?? filters.market },
    filters.platform && { key: "platform" as const, label: facets?.platforms.find((c) => c.value === filters.platform)?.label ?? filters.platform },
    filters.licence && { key: "licence" as const, label: facets?.licenceTypes.find((c) => c.value === filters.licence)?.label ?? filters.licence },
    filters.min !== undefined && { key: "min" as const, label: `Min ${filters.min}` },
    filters.max !== undefined && { key: "max" as const, label: `Max ${filters.max}` },
  ].filter(Boolean) as { key: keyof SoftwareFilters; label: string }[];

  return (
    <section id="catalogue" aria-label="Software collection" className="surface-white relative scroll-mt-20 py-28 sm:py-36">
      <div className="container-lux">
        <SectionHeading eyebrow="Software Collection" title={["Explore Our", "Software Collection"]} intro="Filter by category, market, platform or licence, and sort by price or newest." />

        {noProducts ? null : (
          <div className="mt-12">
            <div className="flex items-center justify-between gap-4 lg:hidden">
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-controls="catalogue-filters"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-forest/25 bg-white px-5 text-sm font-semibold text-forest"
              >
                <SlidersHorizontal aria-hidden className="h-4 w-4" />
                Filters{activeCount ? ` (${activeCount})` : ""}
              </button>
              <div className="w-44">
                <select aria-label="Sort by" className={control} value={filters.sort} onChange={(e) => setFilters({ sort: e.target.value as SoftwareFilters["sort"] })}>
                  {softwareSorts.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div id="catalogue-filters" className={cn("mt-4 rounded-[1.25rem] border border-line bg-white p-5 lg:mt-0 lg:block", open ? "block" : "hidden")}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(4,1fr)_6.5rem_6.5rem_11rem]">
                <FilterField label="Category">
                  <select aria-label="Category" className={control} value={filters.category ?? ""} onChange={pick("category")}>
                    <option value="">All categories</option>
                    {facets?.categories.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </FilterField>
                <FilterField label="Market">
                  <select aria-label="Trading market" className={control} value={filters.market ?? ""} onChange={pick("market")}>
                    <option value="">All markets</option>
                    {facets?.markets.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </FilterField>
                <FilterField label="Platform">
                  <select aria-label="Supported platform" className={control} value={filters.platform ?? ""} onChange={pick("platform")}>
                    <option value="">All platforms</option>
                    {facets?.platforms.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </FilterField>
                <FilterField label="Licence">
                  <select aria-label="Licence type" className={control} value={filters.licence ?? ""} onChange={pick("licence")}>
                    <option value="">Any licence</option>
                    {facets?.licenceTypes.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </FilterField>
                {facets?.priceRange ? (
                  <>
                    <FilterField label="Min price">
                      <input type="number" min={0} inputMode="decimal" className={control} placeholder={String(Math.floor(facets.priceRange.min))} value={filters.min ?? ""} onChange={price("min")} />
                    </FilterField>
                    <FilterField label="Max price">
                      <input type="number" min={0} inputMode="decimal" className={control} placeholder={String(Math.ceil(facets.priceRange.max))} value={filters.max ?? ""} onChange={price("max")} />
                    </FilterField>
                  </>
                ) : null}
                <div className="hidden lg:block">
                  <FilterField label="Sort by">
                    <select aria-label="Sort by" className={control} value={filters.sort} onChange={(e) => setFilters({ sort: e.target.value as SoftwareFilters["sort"] })}>
                      {softwareSorts.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </FilterField>
                </div>
              </div>
            </div>

            <div className="mt-5 flex min-h-8 flex-wrap items-center gap-2">
              <p role="status" aria-live="polite" className="mr-2 text-sm text-muted">
                {status === "loading" ? "Updating results…" : status === "error" ? "" : `${items.length} of ${total} ${total === 1 ? "product" : "products"}`}
              </p>
              {chips.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setFilters({ [c.key]: undefined } as Partial<SoftwareFilters>)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-champagne/25 px-3 py-1 text-xs font-medium text-forest hover:bg-champagne/50"
                >
                  {c.label}
                  <X aria-hidden className="h-3 w-3" />
                  <span className="sr-only">Remove filter</span>
                </button>
              ))}
              {activeCount > 1 ? (
                <button type="button" onClick={clearFilters} className="text-xs font-semibold text-gold-deep underline underline-offset-2">
                  Clear all
                </button>
              ) : null}
            </div>
          </div>
        )}

        <div className="mt-8" aria-busy={status === "loading"}>
          {status === "error" ? (
            <div role="alert" className="flex flex-col items-start gap-4 rounded-[1.5rem] border border-red-800/20 bg-red-50 p-8 text-red-900 sm:flex-row sm:items-center">
              <AlertCircle aria-hidden className="h-6 w-6 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">We could not load the software collection.</p>
                <p className="mt-1 text-sm">Please check your connection and try again.</p>
              </div>
              <button type="button" onClick={retry} className="inline-flex items-center gap-2 rounded-full bg-red-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-950">
                <RefreshCw aria-hidden className="h-4 w-4" /> Try again
              </button>
            </div>
          ) : noProducts ? (
            <div className="rounded-[1.5rem] border border-dashed border-gold/50 bg-white px-8 py-16 text-center">
              <p className="font-serif text-3xl text-forest">The software collection is being prepared.</p>
              <p className="mx-auto mt-3 max-w-xl text-muted">No products are published yet. Request a demo or send us a message and we will tell you what is coming.</p>
              <a href="#demo" className="mt-8 inline-flex rounded-full bg-forest px-7 py-3.5 text-sm font-semibold text-ivory hover:bg-emerald">
                Request a Demo
              </a>
            </div>
          ) : status === "loading" && items.length === 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-line bg-white px-8 py-16 text-center">
              <p className="font-serif text-3xl text-forest">No software matches these filters.</p>
              <p className="mt-3 text-muted">Try removing a filter or widening the price range.</p>
              <button type="button" onClick={clearFilters} className="mt-8 inline-flex rounded-full border border-forest/25 px-6 py-3 text-sm font-semibold text-forest hover:border-gold hover:text-gold-deep">
                Clear filters
              </button>
            </div>
          ) : (
            <ul className={cn("grid gap-6 transition-opacity duration-300 md:grid-cols-2 xl:grid-cols-3", status === "loading" && "opacity-50")}>
              <AnimatePresence mode="popLayout" initial={false}>
                {items.map((p) => (
                  <motion.li
                    key={p.id}
                    layout={!reduce}
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <SoftwareCard product={p} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

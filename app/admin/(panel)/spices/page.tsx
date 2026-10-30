import type { Metadata } from "next";
import {
  ExternalLink,
  Leaf,
  Package,
  Plus,
  Tags,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import { ButtonLink } from "@/components/admin/Button";
import { EmptyState } from "@/components/admin/EmptyState";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { SpicesTable, type SpiceRow } from "@/components/admin/catalogue/SpicesTable";
import { readListQuery } from "@/lib/admin/query";
import { listRecords, resources } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import { SpiceCategory } from "@/models/SpiceCategory";
import { SpiceProduct } from "@/models/SpiceProduct";
import { toOptions } from "@/lib/admin/constants";

export const metadata: Metadata = { title: "Spices Catalogue" };

export default async function SpicesAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  await connectToDatabase();

  const [categoryDocs, { query, params }, totalPublished, totalDrafts, totalAll] = await Promise.all([
    SpiceCategory.find().sort({ order: 1, name: 1 }).lean(),
    readListQuery(await searchParams),
    SpiceProduct.countDocuments({ status: "published" }),
    SpiceProduct.countDocuments({ status: "draft" }),
    SpiceProduct.countDocuments({}),
  ]);

  const categoryMap = new Map(categoryDocs.map((c) => [String(c._id), c.name]));
  const categoryOptions = categoryDocs.map((c) => ({
    value: String(c._id),
    label: c.name,
  }));

  const result = await listRecords<SpiceRow>(resources.spices, query);
  const isFiltered = Boolean(query.q || query.status || query.filter);

  return (
    <div className="space-y-6">
      {/* 1. Header with Title & Action Buttons */}
      <PageHeader
        title="Spices Catalogue"
        description="Manage wholesale whole spices, pricing, origins, categories, and live store visibility."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <ButtonLink
              href="/admin/categories"
              variant="secondary"
              icon={<Tags aria-hidden className="h-4 w-4 text-forest" />}
            >
              Categories ({categoryDocs.length})
            </ButtonLink>
            <ButtonLink
              href="/spices"
              variant="secondary"
              icon={<ExternalLink aria-hidden className="h-4 w-4 text-muted" />}
              className="hidden sm:inline-flex"
            >
              Live Shop
            </ButtonLink>
            <ButtonLink
              href="/admin/spices/new"
              variant="primary"
              icon={<Plus aria-hidden className="h-4 w-4" />}
            >
              Add Product
            </ButtonLink>
          </div>
        }
      />

      {/* 2. Quick Metrics / KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        {/* Card 1: Total Products */}
        <div className="rounded-2xl border border-line bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-medium uppercase tracking-wider">Total Products</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest/8 text-forest">
              <Package className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold text-forest sm:text-3xl tabular-nums">
              {totalAll}
            </span>
            <span className="text-xs text-muted">items</span>
          </div>
        </div>

        {/* Card 2: Live / Published */}
        <div className="rounded-2xl border border-emerald/20 bg-emerald/5 p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald">
            <span className="text-xs font-medium uppercase tracking-wider">Live on Store</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald/15 text-emerald">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold text-emerald sm:text-3xl tabular-nums">
              {totalPublished}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" />
              Published
            </span>
          </div>
        </div>

        {/* Card 3: Drafts */}
        <div className="rounded-2xl border border-line bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-medium uppercase tracking-wider">Drafts</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <Clock3 className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold text-ink sm:text-3xl tabular-nums">
              {totalDrafts}
            </span>
            <span className="text-xs text-muted">unlisted</span>
          </div>
        </div>

        {/* Card 4: Categories */}
        <div className="rounded-2xl border border-line bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-medium uppercase tracking-wider">Categories</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/15 text-gold-dark">
              <Tags className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold text-forest sm:text-3xl tabular-nums">
              {categoryDocs.length}
            </span>
            <span className="text-xs text-muted">groups</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Toolbar */}
      <ListToolbar
        searchPlaceholder="Search products by name, slug or description..."
        statuses={toOptions(["published", "draft"])}
        filter={{ label: "Category", options: categoryOptions }}
      />

      {/* 4. Products Table View */}
      {result.items.length > 0 ? (
        <div className="space-y-4">
          <SpicesTable rows={result.items} categoryMap={categoryMap} />
          <Pagination
            basePath="/admin/spices"
            params={params}
            page={result.page}
            pages={result.pages}
            total={result.total}
          />
        </div>
      ) : (
        <EmptyState
          icon={Leaf}
          title={isFiltered ? "No matching spice products" : "No spice products in catalogue"}
          description={
            isFiltered
              ? "No products match the selected search or filters. Try clearing filters to see all products."
              : "Until a product is published, the spices page shows its built-in introductory catalogue. Add your first product to get started."
          }
          action={
            isFiltered ? null : (
              <ButtonLink
                href="/admin/spices/new"
                variant="primary"
                icon={<Plus aria-hidden className="h-4 w-4" />}
              >
                Add product
              </ButtonLink>
            )
          }
        />
      )}
    </div>
  );
}

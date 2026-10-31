import { productTypes, type ProductType } from "@/lib/admin/constants";
import type { PublicSpice } from "@/lib/cms";

export const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Name: A to Z" },
] as const;
export type SortOption = (typeof sortOptions)[number]["value"];

export type CatalogueQuery = { type: ProductType | null; q: string; sort: SortOption; page: number };

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

/** Reads store filters from the URL. Unknown values fall back to defaults rather than erroring. */
export function readCatalogueQuery(params: Record<string, string | string[] | undefined>): CatalogueQuery {
  const type = first(params.category);
  const sort = first(params.sort);
  const page = Number.parseInt(first(params.page), 10);
  return {
    type: (productTypes as readonly string[]).includes(type) ? (type as ProductType) : null,
    q: first(params.q).trim().slice(0, 100),
    sort: sortOptions.some((o) => o.value === sort) ? (sort as SortOption) : "featured",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/** Products without a price sort after priced ones, in either direction. */
const priceOf = (p: PublicSpice, fallback: number) => p.startingPrice ?? fallback;

/** Filters, sorts and pages the published catalogue. `page` is clamped to the pages that exist. */
export function queryCatalogue(products: PublicSpice[], query: CatalogueQuery, perPage: number) {
  const q = query.q.toLowerCase();
  const matches = products.filter((p) => {
    if (query.type && p.productType !== query.type) return false;
    if (!q) return true;
    return [p.name, p.shortDescription, p.productTypeLabel, ...p.variants.map((v) => v.importArea)].some((text) => text.toLowerCase().includes(q));
  });

  const sorted = [...matches];
  if (query.sort === "price-asc") sorted.sort((a, b) => priceOf(a, Infinity) - priceOf(b, Infinity));
  if (query.sort === "price-desc") sorted.sort((a, b) => priceOf(b, -Infinity) - priceOf(a, -Infinity));
  if (query.sort === "name-asc") sorted.sort((a, b) => a.name.localeCompare(b.name));
  if (query.sort === "featured") sorted.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.featuredOrder - b.featuredOrder);

  const total = sorted.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(query.page, pages);
  return { items: sorted.slice((page - 1) * perPage, page * perPage), total, page, pages };
}

/**
 * One category's homepage products, in the admin's display order. Expects published products only. A product whose
 * selected quality cannot be shown is left out rather than displayed with a different quality or price.
 */
export function pickFeatured(products: PublicSpice[], type: ProductType) {
  return products
    .filter((p) => p.isFeatured && p.productType === type && p.featuredVariant && p.availability !== "unavailable")
    .sort((a, b) => a.featuredOrder - b.featuredOrder || a.name.localeCompare(b.name));
}

/** Opens the product on the quality its featured card showed, so the price stays the same after the click. */
export const featuredProductHref = (p: PublicSpice) => `/spices/${p.slug}${p.featuredVariant ? `?quality=${p.featuredVariant.level}` : ""}`;

/** Builds a store URL, dropping values that are already the default. */
export function catalogueHref(query: Partial<CatalogueQuery>) {
  const params = new URLSearchParams();
  if (query.type) params.set("category", query.type);
  if (query.q) params.set("q", query.q);
  if (query.sort && query.sort !== "featured") params.set("sort", query.sort);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const qs = params.toString();
  return qs ? `/spices/shop?${qs}` : "/spices/shop";
}

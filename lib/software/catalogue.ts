import "server-only";
import { unstable_cache } from "next/cache";
import type { FilterQuery } from "mongoose";
import {
  availabilityOptions,
  labelFor,
  licenceTypes,
  softwareCategories,
  softwareCategoryLabel,
  softwarePlatforms,
  tradingMarkets,
} from "@/lib/admin/constants";
import { mediaUrl } from "@/lib/media";
import { connectToDatabase } from "@/lib/mongodb";
import { TradingSoftware } from "@/models/TradingSoftware";
import type { SoftwareFilters } from "./filters";
import type { PublicSoftware, SoftwareFacets, SoftwareListing } from "./types";

/**
 * Public read layer for trading software: published records only, public fields only.
 * Results are cached and refreshed by tag when an admin saves a product.
 */

// In development, refresh almost immediately so data written outside the admin (seed scripts) shows up.
const REVALIDATE = process.env.NODE_ENV === "production" ? 3600 : 1;
const TAG = "software";
const MAX_LISTED = 200;

/* eslint-disable @typescript-eslint/no-explicit-any -- maps loosely typed lean documents */
type Doc = Record<string, any>;

const img = (i?: { mediaId?: string; alt?: string } | null) => (i?.mediaId ? { url: mediaUrl(i.mediaId), alt: i.alt ?? "" } : null);
const labelled = (values: string[] | undefined, options: readonly { value: string; label: string }[]) =>
  (values ?? []).map((value) => ({ value, label: labelFor(value, options) }));

export function mapSoftware(d: Doc): PublicSoftware {
  const licences = (d.licenceOptions ?? [])
    .filter((l: Doc) => l.active !== false && Number(l.price) > 0)
    .sort((a: Doc, b: Doc) => a.price - b.price)
    .map((l: Doc) => ({
      id: String(l._id),
      name: l.name,
      type: l.licenceType,
      typeLabel: labelFor(l.licenceType, licenceTypes),
      price: Number(l.price),
      description: l.description ?? "",
    }));
  const availability = (d.availability as string) ?? "available";
  return {
    id: String(d._id),
    slug: d.slug,
    name: d.name,
    category: d.category,
    categoryLabel: softwareCategoryLabel(d.category),
    markets: labelled(d.markets, tradingMarkets),
    shortDescription: d.shortDescription,
    description: d.description ?? "",
    thumbnail: img(d.thumbnail),
    screenshots: (d.screenshots ?? []).map((s: Doc) => img(s)).filter(Boolean) as { url: string; alt: string }[],
    demoVideo: d.demoVideo ?? "",
    features: d.features ?? [],
    platforms: labelled(d.supportedPlatforms, softwarePlatforms),
    systemRequirements: d.systemRequirements ?? "",
    installationNotes: d.installationNotes ?? "",
    supportInfo: d.supportInfo ?? "",
    licenceTerms: d.licenceTerms ?? "",
    faqs: d.faqs ?? [],
    licences,
    currency: d.currency ?? "INR",
    startingPrice: licences.length ? licences[0].price : null,
    availability,
    availabilityLabel: labelFor(availability, availabilityOptions),
    canPurchase: licences.length > 0 && (availability === "available" || availability === "limited"),
    featured: Boolean(d.featured),
    featuredOrder: Number(d.featuredOrder ?? 0),
    createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : "",
  };
}

/** Only options that at least one published product actually uses, and categories that have products. */
function buildFacets(all: PublicSoftware[]): SoftwareFacets {
  const present = <T extends string>(pick: (p: PublicSoftware) => T[]) => new Set(all.flatMap(pick));
  const markets = present((p) => p.markets.map((m) => m.value));
  const platforms = present((p) => p.platforms.map((m) => m.value));
  const licenceKinds = present((p) => p.licences.map((l) => l.type));
  const prices = all.map((p) => p.startingPrice).filter((v): v is number => v !== null);
  return {
    total: all.length,
    categories: softwareCategories
      .map((c) => ({ value: c.value, label: c.label, short: c.short, description: c.description, count: all.filter((p) => p.category === c.value).length }))
      .filter((c) => c.count > 0),
    markets: tradingMarkets.filter((m) => markets.has(m.value)).map(({ value, label }) => ({ value, label })),
    platforms: softwarePlatforms.filter((m) => platforms.has(m.value)).map(({ value, label }) => ({ value, label })),
    licenceTypes: licenceTypes.filter((m) => licenceKinds.has(m.value)).map(({ value, label }) => ({ value, label })),
    priceRange: prices.length ? { min: Math.min(...prices), max: Math.max(...prices), currency: all.find((p) => p.startingPrice !== null)?.currency ?? "INR" } : null,
  };
}

const sortItems = (items: PublicSoftware[], sort: SoftwareFilters["sort"]) => {
  const byPrice = (dir: 1 | -1) => (a: PublicSoftware, b: PublicSoftware) => {
    // Products without a price always sit at the end, whichever way the list is sorted.
    if (a.startingPrice === null) return b.startingPrice === null ? 0 : 1;
    if (b.startingPrice === null) return -1;
    return (a.startingPrice - b.startingPrice) * dir;
  };
  if (sort === "price-asc") return items.sort(byPrice(1));
  if (sort === "price-desc") return items.sort(byPrice(-1));
  if (sort === "latest") return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return items; // "featured": the query already returns featured first
};

const readListing = unstable_cache(
  async (filters: SoftwareFilters): Promise<SoftwareListing> => {
    await connectToDatabase();
    const where: FilterQuery<Doc> = { status: "published" };
    if (filters.category) where.category = filters.category;
    if (filters.market) where.markets = filters.market;
    if (filters.platform) where.supportedPlatforms = filters.platform;
    if (filters.licence) where.licenceOptions = { $elemMatch: { licenceType: filters.licence, active: true } };
    if (filters.min !== undefined || filters.max !== undefined) {
      where.startingPrice = {
        ...(filters.min !== undefined ? { $gte: filters.min } : {}),
        ...(filters.max !== undefined ? { $lte: filters.max } : {}),
      };
    }

    const [docs, everything] = await Promise.all([
      TradingSoftware.find(where).sort({ featured: -1, featuredOrder: 1, order: 1, createdAt: -1 }).limit(MAX_LISTED).lean(),
      // Facets describe the whole published collection, so filter choices never disappear as you narrow the list.
      TradingSoftware.find({ status: "published" }).select("category markets supportedPlatforms licenceOptions currency availability").limit(500).lean(),
    ]);
    return {
      items: sortItems(docs.map((d) => mapSoftware(d as Doc)), filters.sort),
      facets: buildFacets(everything.map((d) => mapSoftware({ ...(d as Doc), name: "", slug: "", shortDescription: "" }))),
    };
  },
  ["public:software:listing"],
  { tags: [TAG], revalidate: REVALIDATE },
);

/** Filtered, sorted catalogue plus the facets used to build the filter controls. Throws if the database is unavailable. */
export const getSoftwareListing = (filters: SoftwareFilters) => readListing(filters);

/** Published, featured products in their configured order. Empty when nothing is featured or the database is down. */
export async function getFeaturedSoftware(): Promise<PublicSoftware[]> {
  try {
    const { items } = await readListing({ sort: "featured" });
    return items.filter((p) => p.featured);
  } catch (error) {
    if (process.env.MONGODB_URI) console.error("[software] featured unavailable", (error as Error).message);
    return [];
  }
}

export async function getSoftwareBySlug(slug: string): Promise<PublicSoftware | null> {
  try {
    await connectToDatabase();
    const doc = await TradingSoftware.findOne({ slug, status: "published" }).lean();
    return doc ? mapSoftware(doc as Doc) : null;
  } catch (error) {
    if (process.env.MONGODB_URI) console.error("[software] product unavailable", (error as Error).message);
    return null;
  }
}

/** Slugs and dates of every published product, for the sitemap. */
export async function getSoftwareSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  try {
    await connectToDatabase();
    const docs = await TradingSoftware.find({ status: "published" }).select("slug updatedAt").limit(500).lean();
    return docs.map((d) => ({ slug: d.slug, updatedAt: d.updatedAt as Date }));
  } catch {
    return [];
  }
}

/** Published products as {id, name} pairs, for the demo request form's product picker. */
export async function getSoftwareOptions(): Promise<{ id: string; name: string }[]> {
  try {
    const { items } = await readListing({ sort: "featured" });
    return items.map((p) => ({ id: p.id, name: p.name }));
  } catch {
    return [];
  }
}

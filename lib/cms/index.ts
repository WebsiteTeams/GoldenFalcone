import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";
import type { Metadata } from "next";
import { settingsSchema, siteContentSchema, type ContentPageKey, type Settings, type SiteContent as Content } from "@/lib/admin/schemas";
import { getCurrentAdmin } from "@/lib/auth/session";
import { divisions } from "@/lib/content";
import { mediaUrl } from "@/lib/media";
import { connectToDatabase } from "@/lib/mongodb";
import { site } from "@/lib/site";
import { DigitalService } from "@/models/DigitalService";
import { MentorshipProgram } from "@/models/MentorshipProgram";
import { PortfolioProject } from "@/models/PortfolioProject";
import { SiteContent } from "@/models/SiteContent";
import { SiteSettings } from "@/models/SiteSettings";
import { SpiceCategory } from "@/models/SpiceCategory";
import { SpiceProduct } from "@/models/SpiceProduct";
import { defaultContent, defaultSettings } from "./defaults";

/**
 * Public read layer. Every reader returns a safe fallback if MongoDB is unavailable,
 * so the public site always renders. Results are cached and refreshed by tag when admins save changes.
 */

const REVALIDATE = 3600;

async function safely<T>(scope: string, read: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await read();
  } catch (error) {
    if (process.env.MONGODB_URI) console.error(`[cms] ${scope} unavailable, using fallback`, (error as Error).message);
    return fallback;
  }
}

// ---------- Website content ----------

const readPublishedContent = unstable_cache(
  async () => {
    await connectToDatabase();
    const doc = await SiteContent.findOne({ key: "main" }).select("published").lean();
    const parsed = siteContentSchema.safeParse(doc?.published);
    return parsed.success ? parsed.data : null;
  },
  ["site-content:published"],
  { tags: ["site-content"], revalidate: REVALIDATE },
);

async function readDraftContent() {
  await connectToDatabase();
  const doc = await SiteContent.findOne({ key: "main" }).lean();
  const parsed = siteContentSchema.safeParse(doc?.draft ?? doc?.published);
  return parsed.success ? parsed.data : null;
}

/** Published website copy — or the draft, while a signed-in admin is previewing. */
export const getSiteContent = cache(async (): Promise<Content> => {
  const preview = (await draftMode()).isEnabled && (await safely("preview auth", getCurrentAdmin, null));
  const content = await safely("content", preview ? readDraftContent : readPublishedContent, null);
  return content ?? defaultContent;
});

export const isPreviewing = cache(async () => (await draftMode()).isEnabled);

/** Business divisions with their admin-managed descriptions. */
export const getDivisions = cache(async () => {
  const content = await getSiteContent();
  return divisions.map((d) => ({ ...d, description: content.divisions[d.key] || d.description }));
});

/** Page metadata with any SEO overrides from the admin panel applied over the page's own defaults. */
export async function pageMetadata(key: ContentPageKey, fallback: Metadata & { title: string; description: string }): Promise<Metadata> {
  const { seo } = await getSiteContent();
  const title = seo[key].title || fallback.title;
  const description = seo[key].description || fallback.description;
  return {
    ...fallback,
    title,
    description,
    openGraph: { ...fallback.openGraph, title: `${title} | ${site.name}`, description },
  };
}

// ---------- Settings ----------

export const readSettings = unstable_cache(
  async () => {
    await connectToDatabase();
    const doc = await SiteSettings.findOne({ key: "main" }).lean();
    const parsed = settingsSchema.safeParse(doc?.values);
    return parsed.success ? parsed.data : null;
  },
  ["site-settings"],
  { tags: ["site-settings"], revalidate: REVALIDATE },
);

export const getSettings = cache(async (): Promise<Settings> => (await safely("settings", readSettings, null)) ?? defaultSettings);

/** Settings shaped for public components. */
export const getSiteConfig = cache(async () => {
  const s = await getSettings();
  const clean = (v: string) => v || undefined;
  return {
    name: s.businessName,
    logo: s.logo ? mediaUrl(s.logo.mediaId) : site.logo,
    contact: {
      email: clean(s.contactEmail),
      phone: clean(s.contactPhone),
      address: clean(s.address),
      whatsappNumber: clean(s.whatsappNumber),
    },
    social: Object.entries(s.social).filter(([, url]) => url) as [keyof Settings["social"], string][],
    seo: s.seo,
  };
});
export type SiteConfig = Awaited<ReturnType<typeof getSiteConfig>>;

export function whatsappHref(number: string | undefined, message?: string) {
  const raw = number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919790586474";
  const digits = raw.replace(/\D/g, "");
  const num = digits.length === 10 ? `91${digits}` : (digits || "919790586474");
  return `https://wa.me/${num}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

// ---------- Catalogues (published records only, public fields only) ----------

type Img = { mediaId: string; alt?: string } | null | undefined;
const img = (i: Img) => (i?.mediaId ? { url: mediaUrl(i.mediaId), alt: i.alt ?? "" } : null);

const published = { status: "published" } as const;
const order = { order: 1, createdAt: -1 } as const;

// ---------- Categories ----------

export type PublicCategory = {
  id: string;
  slug: string;
  name: string;
  image: { url: string; alt: string };
  shortDescription: string;
  order: number;
};

export const getPublishedCategories = () =>
  safely(
    "categories",
    unstable_cache(
      async (): Promise<PublicCategory[]> => {
        await connectToDatabase();
        const docs = await SpiceCategory.find(published).sort(order).lean();
        return docs.map((d) => ({
          id: String(d._id),
          slug: d.slug,
          name: d.name,
          image: (d.image ? img(d.image) : null) || { url: "", alt: d.name },
          shortDescription: d.shortDescription,
          order: d.order ?? 0,
        }));
      },
      ["public:categories"],
      { tags: ["spices"], revalidate: REVALIDATE },
    ),
    [],
  );

// ---------- Spices ----------

export type PublicSpice = {
  id: string;
  slug: string;
  name: string;
  sku?: string;
  category: string;
  categoryId: string;
  categoryName: string;
  description: string;
  shortDescription: string;
  images: { url: string; alt: string }[];
  availability: string;
  packaging?: string;
  origin: string;
  highlights: string[];
  marketPrice: number;
  ourPrice: number;
  currency: string;
  unit: string;
  minimumOrderQuantity: number | null;
};

const mapSpice = (d: Record<string, unknown>, categoryName = ""): PublicSpice => ({
  id: String(d._id),
  slug: d.slug as string,
  name: d.name as string,
  sku: (d.sku as string) ?? "",
  category: String(d.category ?? ""),
  categoryId: String(d.category ?? ""),
  categoryName: categoryName || String(d.category ?? ""),
  description: (d.description as string) || (d.shortDescription as string) || "",
  shortDescription: (d.shortDescription as string) ?? "",
  images: ((d.images as Array<{ mediaId?: string; alt?: string }>) ?? [])
    .map((i) => img({ mediaId: i.mediaId!, alt: i.alt }))
    .filter(Boolean) as { url: string; alt: string }[],
  availability: (d.availability as string) ?? "available",
  packaging: (d.packaging as string) ?? "",
  origin: (d.origin as string) ?? "",
  highlights: (d.highlights as string[]) ?? [],
  marketPrice: Number(d.marketPrice ?? 0),
  ourPrice: Number(d.ourPrice ?? 0),
  currency: (d.currency as string) ?? "INR",
  unit: (d.unit as string) ?? "",
  minimumOrderQuantity: (d.minimumOrderQuantity as number | null) ?? null,
});

export const getPublishedSpices = (categoryFilter?: string) =>
  safely(
    "spices",
    unstable_cache(
      async (): Promise<PublicSpice[]> => {
        await connectToDatabase();
        const [docs, categoryDocs] = await Promise.all([
          SpiceProduct.find(published).sort(order).limit(100).lean(),
          SpiceCategory.find().lean(),
        ]);

        const catMap = new Map(categoryDocs.map((c) => [String(c._id), c.name]));
        for (const c of categoryDocs) {
          catMap.set(c.slug, c.name);
        }

        const items = docs.map((d) => {
          const catId = String((d as Record<string, unknown>).category ?? "");
          const catName = catMap.get(catId) || catId;
          return mapSpice(d as Record<string, unknown>, catName);
        });

        if (categoryFilter && categoryFilter !== "all") {
          return items.filter(
            (item) =>
              item.categoryId === categoryFilter ||
              item.category === categoryFilter ||
              item.categoryName.toLowerCase() === categoryFilter.toLowerCase(),
          );
        }

        return items;
      },
      ["public:spices"],
      { tags: ["spices"], revalidate: REVALIDATE },
    ),
    [],
  );

/** Single product by slug — used on the detail page. Returns null if not published or not found. */
export const getSpiceBySlug = (slug: string) =>
  safely(
    "spice:slug",
    async (): Promise<PublicSpice | null> => {
      await connectToDatabase();
      const doc = await SpiceProduct.findOne({ slug, status: "published" }).lean();
      if (!doc) return null;

      let categoryName = String(doc.category ?? "");
      if (doc.category) {
        const cat = await SpiceCategory.findById(doc.category).lean();
        if (cat) categoryName = cat.name;
      }

      return mapSpice(doc as Record<string, unknown>, categoryName);
    },
    null,
  );

/** Single product by id — used for server-side cart validation. Returns null if not published. */
export const getSpiceById = (id: string) =>
  safely(
    "spice:id",
    async (): Promise<PublicSpice | null> => {
      await connectToDatabase();
      const doc = await SpiceProduct.findOne({ _id: id, status: "published" }).lean();
      if (!doc) return null;

      let categoryName = String(doc.category ?? "");
      if (doc.category) {
        const cat = await SpiceCategory.findById(doc.category).lean();
        if (cat) categoryName = cat.name;
      }

      return mapSpice(doc as Record<string, unknown>, categoryName);
    },
    null,
  );

export type PublicProgram = {
  id: string;
  slug: string;
  title: string;
  description: string;
  topics: string[];
  format: string;
  duration: string;
  availability: string;
  ctaLabel: string;
};

export const getPublishedPrograms = () =>
  safely(
    "mentorship",
    unstable_cache(
      async (): Promise<PublicProgram[]> => {
        await connectToDatabase();
        const docs = await MentorshipProgram.find(published).sort(order).limit(50).lean();
        return docs.map((d) => ({
          id: String(d._id),
          slug: d.slug,
          title: d.title,
          description: d.description,
          topics: d.topics ?? [],
          format: d.format ?? "",
          duration: d.duration ?? "",
          availability: d.availability ?? "",
          ctaLabel: d.ctaLabel ?? "",
        }));
      },
      ["public:mentorship"],
      { tags: ["mentorship"], revalidate: REVALIDATE },
    ),
    [],
  );

export type PublicDigitalService = {
  id: string;
  title: string;
  category: string;
  description: string;
  image: { url: string; alt: string } | null;
  startingPrice: string;
  features: string[];
};

export type PublicPortfolioProject = {
  id: string;
  title: string;
  category: string;
  description: string;
  image: { url: string; alt: string } | null;
  projectUrl: string;
  isConcept: boolean;
};

export const getPublishedDigital = () =>
  safely(
    "digital",
    unstable_cache(
      async () => {
        await connectToDatabase();
        const [services, projects] = await Promise.all([
          DigitalService.find(published).sort(order).limit(50).lean(),
          PortfolioProject.find(published).sort(order).limit(50).lean(),
        ]);
        return {
          services: services.map(
            (d): PublicDigitalService => ({
              id: String(d._id),
              title: d.title,
              category: d.category ?? "",
              description: d.description,
              image: img(d.image as Img),
              startingPrice: d.startingPrice ?? "",
              features: d.features ?? [],
            }),
          ),
          projects: projects.map(
            (d): PublicPortfolioProject => ({
              id: String(d._id),
              title: d.title,
              category: d.category ?? "",
              description: d.description ?? "",
              image: img(d.image as Img),
              projectUrl: d.projectUrl ?? "",
              isConcept: d.isConcept ?? true,
            }),
          ),
        };
      },
      ["public:digital"],
      { tags: ["digital"], revalidate: REVALIDATE },
    ),
    { services: [], projects: [] },
  );

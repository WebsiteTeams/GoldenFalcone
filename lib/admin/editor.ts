import "server-only";
import type { AnyZodObject } from "zod";
import type { PublicPortfolioProject, PublicProgram, PublicSpice } from "@/lib/cms";
import { getSettings, mapSpice } from "@/lib/cms";
import { mediaUrl } from "@/lib/media";
import { normalizeVariants, spiceProductSchema } from "./schemas";

/* eslint-disable @typescript-eslint/no-explicit-any -- maps loosely typed lean documents */
type Doc = Record<string, any>;

/** Only the fields an editor may change, taken from a stored record (drops _id, timestamps, etc.). */
export function editorValues<S extends AnyZodObject>(schema: S, doc: Doc) {
  return Object.fromEntries(Object.keys(schema.shape).map((k) => [k, doc[k] ?? undefined]));
}

/** Initial visibility for new catalogue items, from Settings → Publishing. */
export async function newItemStatus() {
  const { publishing } = await getSettings();
  return publishing.newItemsAsDraft ? ("draft" as const) : ("published" as const);
}

const img = (i?: { mediaId?: string; alt?: string } | null) => (i?.mediaId ? { url: mediaUrl(i.mediaId), alt: i.alt ?? "" } : null);

/** Editor values for a product, with exactly one row per quality level and no stored ids. */
export function spiceEditorValues(doc: Doc) {
  return {
    ...editorValues(spiceProductSchema, doc),
    category: doc.category ? String(doc.category) : "",
    productType: doc.productType ?? "",
    highlights: doc.highlights ?? [],
    isFeatured: Boolean(doc.isFeatured),
    featuredOrder: doc.featuredOrder ?? 0,
    featuredLevel: (doc.variants ?? []).find((v: Doc) => String(v._id) === String(doc.featuredVariantId))?.level ?? "",
    variants: normalizeVariants(doc.variants),
  };
}

// Preview mappers — the same shapes the public site renders.
export const previewSpice = (d: Doc): PublicSpice => mapSpice(d, d.category ?? "");

export const previewProgram = (d: Doc): PublicProgram => ({
  id: d._id,
  slug: d.slug,
  title: d.title,
  description: d.description,
  topics: d.topics ?? [],
  format: d.format ?? "",
  duration: d.duration ?? "",
  availability: d.availability ?? "",
  ctaLabel: d.ctaLabel ?? "",
});

export const previewPortfolio = (d: Doc): PublicPortfolioProject => ({
  id: d._id,
  title: d.title,
  category: d.category ?? "",
  description: d.description ?? "",
  image: img(d.image),
  projectUrl: d.projectUrl ?? "",
  isConcept: d.isConcept ?? true,
});

import "server-only";
import type { AnyZodObject } from "zod";
import type { PublicSpice } from "@/lib/cms";
import { getSettings, mapSpice } from "@/lib/cms";
import { normalizeVariants, spiceProductSchema, tradingSoftwareSchema } from "./schemas";

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

/** Editor values for a software product. Licences carry their stored id so orders keep pointing at them after a save. */
export function softwareEditorValues(doc: Doc) {
  return {
    ...editorValues(tradingSoftwareSchema, doc),
    thumbnail: doc.thumbnail ?? null,
    screenshots: doc.screenshots ?? [],
    markets: doc.markets ?? [],
    supportedPlatforms: doc.supportedPlatforms ?? [],
    features: doc.features ?? [],
    faqs: doc.faqs ?? [],
    licenceOptions: (doc.licenceOptions ?? []).map((l: Doc) => ({
      id: String(l._id),
      name: l.name,
      licenceType: l.licenceType,
      price: l.price,
      description: l.description ?? "",
      active: l.active !== false,
    })),
  };
}

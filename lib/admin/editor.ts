import "server-only";
import type { AnyZodObject } from "zod";
import type { PublicDigitalService, PublicPortfolioProject, PublicProgram, PublicSpice } from "@/lib/cms";
import { getSettings } from "@/lib/cms";
import { mediaUrl } from "@/lib/media";

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

// Preview mappers — the same shapes the public site renders.
export const previewSpice = (d: Doc): PublicSpice => ({
  id: d._id,
  slug: d.slug,
  name: d.name,
  sku: d.sku ?? "",
  category: d.category ?? "",
  categoryId: d.category ?? "",
  categoryName: d.category ?? "",
  description: d.description || d.shortDescription || "",
  shortDescription: d.shortDescription ?? "",
  images: (d.images ?? []).map(img).filter(Boolean),
  availability: d.availability ?? "available",
  packaging: d.packaging ?? "",
  origin: d.origin ?? "",
  highlights: d.highlights ?? [],
  marketPrice: Number(d.marketPrice ?? 0),
  ourPrice: Number(d.ourPrice ?? 0),
  currency: d.currency ?? "INR",
  unit: d.unit ?? "",
  minimumOrderQuantity: d.minimumOrderQuantity ?? null,
});

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

export const previewDigitalService = (d: Doc): PublicDigitalService => ({
  id: d._id,
  title: d.title,
  category: d.category ?? "",
  description: d.description,
  image: img(d.image),
  startingPrice: d.startingPrice ?? "",
  features: d.features ?? [],
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

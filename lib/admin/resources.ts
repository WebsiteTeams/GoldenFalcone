import "server-only";
import { Types, type FilterQuery, type Model } from "mongoose";
import type { AnyZodObject } from "zod";
import { salonRoles } from "@/lib/content";
import { connectToDatabase } from "@/lib/mongodb";
import { serviceTypes } from "@/lib/validations";
import { CandidateApplication } from "@/models/CandidateApplication";
import { Enquiry } from "@/models/Enquiry";
import { SpiceCategory } from "@/models/SpiceCategory";
import { SpiceOrder } from "@/models/SpiceOrder";
import { SpiceProduct } from "@/models/SpiceProduct";
import { TradingSoftware } from "@/models/TradingSoftware";
import { TradingSoftwareEnquiry } from "@/models/TradingSoftwareEnquiry";
import { TradingSoftwareOrder } from "@/models/TradingSoftwareOrder";
import { StaffingRequest } from "@/models/StaffingRequest";
import { escapeRegex, toPlain } from "./api";
import {
  candidateStatuses,
  enquiryStatuses,
  deliveryStatuses,
  orderStatuses,
  orderStatusValues,
  PAGE_SIZE,
  orderSources,
  publishStatuses,
  softwareCategoryValues,
  staffingStatuses,
} from "./constants";
import {
  candidateUpdateSchema,
  enquiryUpdateSchema,
  orderUpdateSchema,
  spiceCategorySchema,
  spiceFeaturedErrors,
  softwareEnquiryUpdateSchema,
  softwareOrderUpdateSchema,
  softwarePublishErrors,
  spiceProductSchema,
  spicePublishErrors,
  staffingUpdateSchema,
  tradingSoftwareSchema,
  type ListQuery,
} from "./schemas";

/* eslint-disable @typescript-eslint/no-explicit-any -- resources share one generic shape across different models */
type AnyDoc = Record<string, any>;

type BaseResource = {
  key: string;
  /** Singular label used in messages and the activity log. */
  entity: string;
  model: Model<any>;
  statuses: readonly string[];
  searchFields: string[];
  filter?: { field: string; values: readonly string[] };
  label: (doc: AnyDoc) => string;
  /** Fields never sent to the browser, even to admins. */
  hidden?: string;
  /** Server-side adjustments to validated data before it is saved. `before` is the stored record, or null on create. */
  prepare?: (data: AnyDoc, before: AnyDoc | null) => void;
};

export type InboxResource = BaseResource & { kind: "inbox"; updateSchema: AnyZodObject };

export type CatalogueResource = BaseResource & {
  kind: "catalogue";
  schema: AnyZodObject;
  slugSource: string;
  /** Public pages and cache tag refreshed after every change. Dynamic routes use their pattern, e.g. /spices/[slug]. */
  revalidate: { tag: string; paths: string[] };
  mediaIds: (doc: AnyDoc) => string[];
  /** Slugs that would collide with a fixed route. */
  reservedSlugs?: string[];
  /** Field errors that block a record from being published. */
  publishErrors?: (merged: AnyDoc) => Record<string, string> | null;
  /** Field errors that block any save, whatever the record's status. */
  saveErrors?: (merged: AnyDoc) => Record<string, string> | null;
};

export type Resource = InboxResource | CatalogueResource;

/**
 * Variant ids are assigned here, never taken from the browser, and stay the same for each quality level across
 * edits, so carts and past orders keep pointing at the right variant.
 */
function prepareSpice(data: AnyDoc, before: AnyDoc | null) {
  if ("category" in data && !data.category) data.category = null;

  if (data.variants) {
    const existingIds = new Map<string, unknown>((before?.variants ?? []).map((v: AnyDoc) => [v.level, v._id]));
    data.variants = data.variants.map((v: AnyDoc) => ({ ...v, _id: existingIds.get(v.level) ?? new Types.ObjectId() }));
  }

  // Runs after ids are assigned, so a brand-new product can feature one of its own variants.
  if ("featuredLevel" in data) {
    const level = data.featuredLevel;
    delete data.featuredLevel;
    if (level !== undefined) {
      data.featuredVariantId = (data.variants ?? before?.variants ?? []).find((v: AnyDoc) => v.level === level)?._id ?? null;
    }
  }

  if (!data.variants) return;

  const lowest = data.variants
    .filter((v: AnyDoc) => v.active && v.sellingPrice > 0)
    .sort((a: AnyDoc, b: AnyDoc) => a.sellingPrice - b.sellingPrice)[0];
  data.ourPrice = lowest?.sellingPrice ?? 0;
  data.marketPrice = lowest?.marketPrice ?? 0;
}

/**
 * Licence ids are assigned here, never taken from the browser. A licence keeps its id across edits (the editor sends
 * back the id it was given), so past orders keep pointing at the right one. An id that is not on this product is ignored.
 */
function prepareSoftware(data: AnyDoc, before: AnyDoc | null) {
  if (!data.licenceOptions) return;
  const known = new Set<string>((before?.licenceOptions ?? []).map((l: AnyDoc) => String(l._id)));
  data.licenceOptions = data.licenceOptions.map(({ id, ...l }: AnyDoc) => ({ ...l, _id: id && known.has(String(id)) ? id : new Types.ObjectId() }));
  const lowest = data.licenceOptions
    .filter((l: AnyDoc) => l.active && l.price > 0)
    .sort((a: AnyDoc, b: AnyDoc) => a.price - b.price)[0];
  data.startingPrice = lowest?.price ?? null;
}

/** Stamps the delivery time when an order is first marked delivered, and clears it if that is undone. */
function prepareSoftwareOrder(data: AnyDoc, before: AnyDoc | null) {
  if (!data.deliveryStatus || data.deliveryStatus === before?.deliveryStatus) return;
  data.deliveredAt = data.deliveryStatus === "delivered" ? new Date() : null;
}

export const resources = {
  enquiries: {
    kind: "inbox",
    key: "enquiries",
    entity: "enquiry",
    model: Enquiry,
    statuses: enquiryStatuses,
    searchFields: ["name", "email", "phone", "company"],
    filter: { field: "serviceType", values: serviceTypes },
    label: (d) => `${d.name} <${d.email}>`,
    updateSchema: enquiryUpdateSchema,
  },
  staffing: {
    kind: "inbox",
    key: "staffing",
    entity: "staffing request",
    model: StaffingRequest,
    statuses: staffingStatuses,
    searchFields: ["salonName", "contactName", "location", "phone", "email", "referenceNumber", "professionalCategory"],
    filter: { field: "professionalCategory", values: salonRoles },
    label: (d) => d.salonName,
    updateSchema: staffingUpdateSchema,
  },
  candidates: {
    kind: "inbox",
    key: "candidates",
    entity: "candidate application",
    model: CandidateApplication,
    statuses: candidateStatuses,
    searchFields: [
      "fullName",
      "email",
      "phone",
      "location",
      "preferredWorkLocation",
      "referenceNumber",
      "additionalSkills",
      "customSkills",
    ],
    filter: { field: "professionalCategory", values: salonRoles },
    label: (d) => d.fullName,
    hidden: "-cv.storageKey -profilePhoto.storageKey -certificates -trainingCertificates -portfolioImages",
    updateSchema: candidateUpdateSchema,
  },
  orders: {
    kind: "inbox",
    key: "orders",
    entity: "spice order",
    model: SpiceOrder,
    statuses: orderStatuses,
    searchFields: ["orderNumber", "customer.name", "customer.phone", "customer.email", "items.name"],
    filter: { field: "source", values: orderSources },
    label: (d) => `${d.orderNumber} — ${d.customer?.name}`,
    updateSchema: orderUpdateSchema,
  },
  categories: {
    kind: "catalogue",
    key: "categories",
    entity: "spice category",
    model: SpiceCategory,
    statuses: publishStatuses,
    searchFields: ["name", "slug", "shortDescription"],
    label: (d) => d.name,
    schema: spiceCategorySchema,
    slugSource: "name",
    revalidate: { tag: "spices", paths: ["/spices"] },
    mediaIds: (d) => (d.image?.mediaId ? [d.image.mediaId] : []),
  },
  spices: {
    kind: "catalogue",
    key: "spices",
    entity: "spice product",
    model: SpiceProduct,
    statuses: publishStatuses,
    searchFields: ["name", "slug", "shortDescription", "description"],
    label: (d) => d.name,
    schema: spiceProductSchema,
    slugSource: "name",
    revalidate: { tag: "spices", paths: ["/spices", "/spices/[slug]", "/api/spices", "/sitemap.xml"] },
    mediaIds: (d) => [
      ...(d.images ?? []).map((i: AnyDoc) => i.mediaId),
      ...(d.variants ?? []).flatMap((v: AnyDoc) => (v.labReport?.fileId ? [v.labReport.fileId] : [])),
    ],
    reservedSlugs: ["shop", "featured"],
    prepare: prepareSpice,
    publishErrors: (merged) => (merged.status === "published" ? spicePublishErrors(merged) : null),
    saveErrors: spiceFeaturedErrors,
  },
  software: {
    kind: "catalogue",
    key: "software",
    entity: "trading software",
    model: TradingSoftware,
    statuses: publishStatuses,
    searchFields: ["name", "slug", "shortDescription", "description"],
    filter: { field: "category", values: softwareCategoryValues },
    label: (d) => d.name,
    schema: tradingSoftwareSchema,
    slugSource: "name",
    revalidate: { tag: "software", paths: ["/trading-software", "/trading-software/[slug]", "/api/software", "/sitemap.xml"] },
    mediaIds: (d) => [d.thumbnail?.mediaId, ...(d.screenshots ?? []).map((i: AnyDoc) => i.mediaId)].filter(Boolean),
    prepare: prepareSoftware,
    publishErrors: (merged) => (merged.status === "published" ? softwarePublishErrors(merged) : null),
  },
  softwareOrders: {
    kind: "inbox",
    key: "softwareOrders",
    entity: "software order",
    model: TradingSoftwareOrder,
    statuses: orderStatuses,
    searchFields: ["orderNumber", "customer.name", "customer.email", "customer.phone", "customer.company", "items.name"],
    filter: { field: "deliveryStatus", values: deliveryStatuses },
    label: (d) => `${d.orderNumber} — ${d.customer?.name}`,
    updateSchema: softwareOrderUpdateSchema,
    prepare: prepareSoftwareOrder,
  },
  softwareEnquiries: {
    kind: "inbox",
    key: "softwareEnquiries",
    entity: "demo request",
    model: TradingSoftwareEnquiry,
    statuses: enquiryStatuses,
    searchFields: ["name", "email", "phone", "company", "softwareName"],
    label: (d) => `${d.name} <${d.email}>`,
    updateSchema: softwareEnquiryUpdateSchema,
  },
} satisfies Record<string, Resource>;

export type ResourceKey = keyof typeof resources;

export type ListResult<T = AnyDoc> = { items: T[]; total: number; page: number; pages: number };

/** Builds a bounded, validated query from list parameters. Unknown filter values are ignored. */
export function buildFilter(res: Resource, query: ListQuery) {
  const where: FilterQuery<AnyDoc> = {};
  if (query.q) {
    const pattern = new RegExp(escapeRegex(query.q), "i");
    where.$or = res.searchFields.map((field) => ({ [field]: pattern }));
  }
  if (query.status && res.statuses.includes(query.status)) {
    where.status = res.key === "orders" ? { $in: orderStatusValues(query.status) } : query.status;
  }
  if (query.filter) {
    if (res.key === "orders" && query.filter === "website") {
      // Orders saved before sources were recorded all came through website checkout.
      where.source = { $ne: "whatsapp" };
    } else if (res.filter?.values.includes(query.filter)) {
      where[res.filter.field] = query.filter;
    } else if (res.key === "spices") {
      where.category = query.filter;
    } else if (res.key === "softwareEnquiries" && /^[a-f0-9]{24}$/i.test(query.filter)) {
      where.software = query.filter;
    }
  }
  if (query.location && (res.key === "staffing" || res.key === "candidates")) {
    const pattern = new RegExp(escapeRegex(query.location), "i");
    where.$and = [
      ...((where.$and as AnyDoc[]) ?? []),
      { $or: [{ location: pattern }, { preferredWorkLocation: pattern }] },
    ];
  }
  if (query.employment && res.key === "staffing") where.employmentType = query.employment;
  if (query.experience && res.key === "candidates") where.experience = query.experience;
  if (query.availability && res.key === "candidates") {
    where.availability = new RegExp(escapeRegex(query.availability), "i");
  }
  if (query.skill && res.key === "candidates") {
    const pattern = new RegExp(escapeRegex(query.skill), "i");
    where.$and = [...((where.$and as AnyDoc[]) ?? []), { $or: [{ additionalSkills: pattern }, { customSkills: pattern }] }];
  }
  if (query.from || query.to) {
    where.createdAt = {
      ...(query.from ? { $gte: new Date(`${query.from}T00:00:00.000Z`) } : {}),
      ...(query.to ? { $lte: new Date(`${query.to}T23:59:59.999Z`) } : {}),
    };
  }
  return where;
}

export async function listRecords<T = AnyDoc>(res: Resource, query: ListQuery): Promise<ListResult<T>> {
  await connectToDatabase();
  const where = buildFilter(res, query);
  const direction = query.sort === "oldest" ? 1 : -1;
  const sort: Record<string, 1 | -1> = res.kind === "catalogue" ? { order: 1, createdAt: direction } : { createdAt: direction };

  const total = await res.model.countDocuments(where);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(query.page, pages);
  const items = await res.model
    .find(where)
    .select(res.hidden ?? "")
    .sort(sort)
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean();
  return { items: toPlain<T[]>(items), total, page, pages };
}

/** Full record for the admin detail view, including private notes (inbox records only). */
export async function getRecord<T = AnyDoc>(res: Resource, id: string): Promise<T | null> {
  await connectToDatabase();
  const select = [res.kind === "inbox" ? "+internalNotes" : "", res.hidden ?? ""].filter(Boolean).join(" ");
  const doc = await res.model.findById(id).select(select).lean();
  return doc ? toPlain<T>(doc) : null;
}

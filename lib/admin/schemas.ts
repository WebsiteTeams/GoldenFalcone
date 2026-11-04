import { z } from "zod";
import { sanitize, experienceOptions } from "@/lib/validations";
import { employmentTypes } from "@/lib/content";
import {
  candidateStatuses,
  communicationChannels,
  communicationParties,
  connectionStatuses,
  availabilityValues,
  contactMethods,
  DEFAULT_PRODUCTS_PER_PAGE,
  deliveryMethodValues,
  deliveryStatuses,
  enquiryStatuses,
  licenceTypeValues,
  paymentStatuses,
  softwareCategoryValues,
  softwarePlatformValues,
  SUPPORTED_CURRENCIES,
  tradingMarketValues,
  interviewStatuses,
  LAB_REPORT_MAX_BYTES,
  LAB_REPORT_TYPES,
  MAX_ORDER_KG,
  MIN_ORDER_KG,
  orderSources,
  orderStatuses,
  productTypes,
  publishStatuses,
  qualityLabels,
  qualityLevels,
  staffingStatuses,
} from "./constants";

/**
 * Admin validation schemas — shared by admin forms (client) and admin route handlers (server).
 * Zod strips unknown keys, so only the fields listed here can ever be written (no mass assignment).
 */

const optionalDate = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.coerce.date({ invalid_type_error: "Enter a valid date" }).optional(),
);

const str = (label: string, min: number, max: number) =>
  z
    .string({ required_error: `${label} is required` })
    .transform(sanitize)
    .pipe(
      z
        .string()
        .min(min, min <= 1 ? `${label} is required` : `${label} must be at least ${min} characters`)
        .max(max, `${label} must be ${max} characters or fewer`),
    );

const optional = (max: number) =>
  z
    .string()
    .max(max, `Must be ${max} characters or fewer`)
    .transform(sanitize)
    .optional()
    .default("");

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .max(80)
  .regex(/^([a-z0-9]+(?:-[a-z0-9]+)*)?$/, "Use lowercase letters, numbers and single hyphens")
  .optional()
  .default("");

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, "Invalid id");

const mediaId = z.string().trim().min(1, "Image ID or URL is required").max(1000);
const image = z.object({ mediaId, alt: optional(160) });

const list = (max: number, itemMax: number) =>
  z
    .array(z.string().transform(sanitize).pipe(z.string().max(itemMax)))
    .max(max)
    .transform((items) => items.filter(Boolean))
    .default([]);

const url = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^https:\/\/[^\s]+$/i.test(v), "Use a full https:// link")
  .optional()
  .default("");

const seo = z
  .object({ title: optional(70), description: optional(170) })
  .default({ title: "", description: "" });

const order = z.coerce.number().int().min(0).max(9999).default(0);
const status = z.enum(publishStatuses).default("draft");

export const toSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

// ---------- Auth ----------

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, "Email is required").email("Enter a valid email address").max(160),
  password: z.string().min(1, "Password is required").max(200),
  remember: z.boolean().optional().default(false),
});

/** bcrypt only uses the first 72 bytes, so longer passwords are rejected rather than silently truncated. */
export const passwordRule = z
  .string()
  .min(12, "Use at least 12 characters")
  .refine((v) => new TextEncoder().encode(v).length <= 72, "Password is too long (72 bytes max)");

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password").max(200),
    newPassword: passwordRule,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

export const profileSchema = z.object({ name: str("Name", 2, 80) });

// ---------- Inbox records ----------

export const noteSchema = z.object({ body: str("Note", 1, 2000) });

export const enquiryUpdateSchema = z.object({ status: z.enum(enquiryStatuses) });
export const staffingUpdateSchema = z.object({ status: z.enum(staffingStatuses) });
export const candidateUpdateSchema = z.object({ status: z.enum(candidateStatuses) });

// ---------- Candidate ↔ salon connections ----------

export const connectionUpsertSchema = z.object({
  candidateId: objectId,
  staffingRequestId: objectId,
  connectionStatus: z.enum(connectionStatuses).optional(),
  matchNotes: optional(3000),
  adminNotes: optional(3000),
  shortlistedAt: optionalDate,
  sharedWithSalonAt: optionalDate,
  salonFeedback: optional(3000),
  interviewDate: optionalDate,
  interviewStatus: z.enum(interviewStatuses).optional(),
  candidateResponse: optional(1000),
  finalOutcome: optional(2000),
});

export const communicationSchema = z.object({
  action: z.literal("log-contact"),
  candidateId: objectId,
  staffingRequestId: objectId,
  channel: z.enum(communicationChannels),
  party: z.enum(communicationParties),
  contactedAt: optionalDate,
  outcome: optional(1000),
  followUpAt: optionalDate,
  notes: optional(2000),
});
export type CommunicationInput = z.input<typeof communicationSchema>;

// ---------- Categories ----------

export const spiceCategorySchema = z.object({
  name: str("Category name", 2, 100),
  slug,
  image: image,
  shortDescription: str("Short description", 5, 500),
  status,
  order,
});
export type SpiceCategoryInput = z.input<typeof spiceCategorySchema>;

// ---------- Catalogue ----------

const pricePerKg = (label: string) =>
  z.coerce
    .number({ required_error: `${label} is required`, invalid_type_error: `${label} must be a number` })
    .min(0, `${label} must be 0 or greater`)
    .max(10000000, `${label} is too large`);

const labReport = z.object({
  fileId: objectId,
  fileName: z.string().trim().min(1).max(200),
  contentType: z.enum(LAB_REPORT_TYPES),
  size: z.coerce.number().int().min(0).max(LAB_REPORT_MAX_BYTES),
});
export type LabReportValue = z.output<typeof labReport>;

const qualityVariant = z.object({
  level: z.enum(qualityLevels),
  qualityPercent: z.coerce
    .number({ invalid_type_error: "Quality percentage must be a number" })
    .min(0, "Quality percentage must be between 0 and 100")
    .max(100, "Quality percentage must be between 0 and 100"),
  marketPrice: pricePerKg("Market price"),
  sellingPrice: pricePerKg("Selling price"),
  importArea: optional(200),
  specifications: optional(1000),
  labReport: labReport.nullable().default(null),
  active: z.boolean().default(true),
});

const featuredOrder = z.coerce
  .number({ invalid_type_error: "Display order must be a number" })
  .int("Display order must be a whole number")
  .min(0, "Display order must be 0 or greater")
  .max(9999, "Display order must be 9999 or lower")
  .default(0);

/** Quick changes from the Featured Products page. These run against saved variants, so they use real variant ids. */
export const featuredSettingsSchema = z.object({
  isFeatured: z.boolean(),
  featuredOrder: featuredOrder.optional(),
  featuredVariantId: objectId.nullable().optional(),
});

type FeaturedCandidate = {
  isFeatured?: boolean | null;
  productType?: string | null;
  featuredVariantId?: unknown;
  variants?: Array<{ _id?: unknown; active?: boolean | null; sellingPrice?: unknown }> | null;
};

/** A featured product must point at one of its own active, priced variants. Nothing falls back to another variant. */
export function spiceFeaturedErrors(product: FeaturedCandidate): Record<string, string> | null {
  if (!product.isFeatured) return null;
  const errors: Record<string, string> = {};
  if (!product.productType) errors.productType = "Select Powder or Solid to feature this product";

  const selected = product.featuredVariantId ? product.variants?.find((v) => String(v._id) === String(product.featuredVariantId)) : undefined;
  if (!selected) errors.featuredLevel = "Select the quality to show on the homepage";
  else if (selected.active === false) errors.featuredLevel = "The selected quality is inactive. Activate it or choose another";
  else if (!(Number(selected.sellingPrice) > 0)) errors.featuredLevel = "The selected quality needs a selling price";
  return Object.keys(errors).length ? errors : null;
}

export const spiceProductSchema = z.object({
  name: str("Product name", 2, 100),
  slug,
  productType: z.enum(productTypes, { errorMap: () => ({ message: "Select Powder or Solid" }) }),
  category: z.string().trim().max(60).nullable().optional().default(""),
  images: z.array(image).max(4, "Up to 4 images").default([]),
  shortDescription: str("Short description", 5, 500),
  highlights: list(12, 160),
  isFeatured: z.boolean().default(false),
  featuredOrder,
  // A new product has no variant ids yet, so the editor names a level. The server stores the matching featuredVariantId.
  featuredLevel: z.preprocess((v) => (v === "" ? null : v), z.enum(qualityLevels).nullable().optional()),
  variants: z
    .array(qualityVariant)
    .length(qualityLevels.length, "Provide all three quality levels")
    .refine((v) => new Set(v.map((x) => x.level)).size === v.length, "Each quality level can only appear once"),
  description: z.string().optional().default(""),
  status,
  order,
  seo,
});

/** Three editor rows in High → Medium → Low order, filled from any saved variants. */
export function normalizeVariants(saved: Array<Record<string, unknown>> | null | undefined) {
  return qualityLevels.map((level) => {
    const v = saved?.find((x) => x.level === level);
    return {
      level,
      qualityPercent: (v?.qualityPercent as number) ?? 0,
      marketPrice: (v?.marketPrice as number) ?? 0,
      sellingPrice: (v?.sellingPrice as number) ?? 0,
      importArea: (v?.importArea as string) ?? "",
      specifications: (v?.specifications as string) ?? "",
      labReport: (v?.labReport as LabReportValue | null) ?? null,
      active: (v?.active as boolean) ?? true,
    };
  });
}

type PublishCandidate = {
  productType?: string | null;
  images?: unknown[] | null;
  variants?: Array<z.input<typeof qualityVariant>> | null;
};

/**
 * What must be true before a product goes live. Drafts may be incomplete, so this runs on the merged record
 * whenever the result is published, including one-click status changes. An inactive quality is not sold, so it may stay blank.
 */
export function spicePublishErrors(product: PublishCandidate): Record<string, string> | null {
  const errors: Record<string, string> = {};
  if (!product.productType) errors.productType = "Select Powder or Solid before publishing";
  if ((product.images?.length ?? 0) !== 4) errors.images = "Upload all four product images before publishing";

  const variants = product.variants ?? [];
  if (!variants.some((v) => v.active !== false)) errors.variants = "Activate at least one quality level before publishing";
  variants.forEach((v, i) => {
    if (v.active === false) return;
    const label = qualityLabels[v.level];
    if (!(Number(v.qualityPercent) > 0)) errors[`variants.${i}.qualityPercent`] = `Enter the ${label} percentage`;
    if (!(Number(v.marketPrice) > 0)) errors[`variants.${i}.marketPrice`] = `Enter the ${label} market price`;
    if (!(Number(v.sellingPrice) > 0)) errors[`variants.${i}.sellingPrice`] = `Enter the ${label} selling price`;
    if (!v.importArea?.trim()) errors[`variants.${i}.importArea`] = `Enter the ${label} import area`;
    if (!v.labReport) errors[`variants.${i}.labReport`] = `Upload the ${label} lab report`;
  });
  return Object.keys(errors).length ? errors : null;
}

// ---------- Order checkout (public, from browser) ----------

const customerSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  phone: z.string().trim().min(7, "WhatsApp number is required").max(30),
  email: z.string().trim().email("Enter a valid email").max(160).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().default(""),
  state: z.string().trim().max(80).optional().default(""),
  city: z.string().trim().max(80).optional().default(""),
  address: z.string().trim().max(500).optional().default(""),
  postalCode: z.string().trim().max(20).optional().default(""),
});

const checkoutItemSchema = z.object({
  productId: z.string().regex(/^[a-f0-9]{24}$/i, "Invalid product"),
  variantId: z.string().regex(/^[a-f0-9]{24}$/i, "Select a quality"),
  quantity: z
    .number({ invalid_type_error: "Enter a quantity in kilograms" })
    .int("Quantity must be whole kilograms")
    .min(MIN_ORDER_KG, `Minimum order is ${MIN_ORDER_KG} kg`)
    .max(MAX_ORDER_KG, `Maximum order is ${MAX_ORDER_KG} kg`),
  // The price the customer saw. Only used to detect a change: the charged price always comes from the database.
  expectedPrice: z.number().min(0).optional(),
});

export const cartValidationSchema = z.object({
  items: z.array(checkoutItemSchema).max(50),
});

export const checkoutSchema = z.object({
  customer: customerSchema,
  items: z.array(checkoutItemSchema).min(1, "Your cart is empty").max(50),
  notes: z.string().max(2000).optional().default(""),
  source: z.enum(orderSources).default("website"),
});
export type CheckoutInput = z.input<typeof checkoutSchema>;

// ---------- Order admin update ----------

export const orderUpdateSchema = z.object({
  status: z.enum(orderStatuses),
  internalNote: z.string().max(2000).optional(),
});

// ---------- Trading software ----------

const licenceOption = z.object({
  // Present for saved licences so orders keep pointing at the right one; the server assigns ids to new ones.
  id: objectId.optional(),
  name: str("Licence name", 2, 80),
  licenceType: z.enum(licenceTypeValues, { errorMap: () => ({ message: "Select a licence type" }) }),
  price: z.coerce
    .number({ required_error: "Price is required", invalid_type_error: "Price must be a number" })
    .min(0, "Price must be 0 or greater")
    .max(100000000, "Price is too large"),
  description: optional(300),
  active: z.boolean().default(true),
});
export type LicenceOptionInput = z.input<typeof licenceOption>;

const softwareFaq = z.object({ question: str("Question", 3, 200), answer: str("Answer", 3, 1500) });

export const tradingSoftwareSchema = z.object({
  name: str("Software name", 2, 100),
  slug,
  category: z.enum(softwareCategoryValues, { errorMap: () => ({ message: "Select a category" }) }),
  markets: z.array(z.enum(tradingMarketValues)).max(tradingMarketValues.length).default([]),
  shortDescription: str("Short description", 10, 400),
  description: optional(6000),
  thumbnail: image.nullable().default(null),
  screenshots: z.array(image).max(8, "Up to 8 screenshots").default([]),
  demoVideo: url,
  features: list(20, 160),
  supportedPlatforms: z.array(z.enum(softwarePlatformValues)).default([]),
  systemRequirements: optional(2000),
  installationNotes: optional(3000),
  supportInfo: optional(1500),
  licenceTerms: optional(3000),
  faqs: z.array(softwareFaq).max(12, "Up to 12 questions").default([]),
  licenceOptions: z.array(licenceOption).max(8, "Up to 8 licence options").default([]),
  currency: z.enum(SUPPORTED_CURRENCIES).default("INR"),
  availability: z.enum(availabilityValues).default("available"),
  featured: z.boolean().default(false),
  featuredOrder: z.coerce.number().int().min(0).max(9999).default(0),
  status,
  order,
  seo,
});
export type TradingSoftwareInput = z.input<typeof tradingSoftwareSchema>;

type SoftwarePublishCandidate = {
  thumbnail?: unknown;
  licenceOptions?: Array<{ active?: boolean; price?: unknown }> | null;
};

/** What must be true before a product goes live. Drafts may be incomplete. */
export function softwarePublishErrors(product: SoftwarePublishCandidate): Record<string, string> | null {
  const errors: Record<string, string> = {};
  if (!product.thumbnail) errors.thumbnail = "Upload a thumbnail before publishing";
  (product.licenceOptions ?? []).forEach((l, i) => {
    if (l.active !== false && !(Number(l.price) > 0)) errors[`licenceOptions.${i}.price`] = "Enter a price for every active licence, or switch it off";
  });
  return Object.keys(errors).length ? errors : null;
}

const optionalField = (max: number) => z.string().max(max, `Must be ${max} characters or fewer`).transform(sanitize).optional();

/** Admin updates to a software order. Every field is optional, so each panel saves only what it changed. */
export const softwareOrderUpdateSchema = z.object({
  status: z.enum(orderStatuses).optional(),
  paymentStatus: z.enum(paymentStatuses).optional(),
  deliveryMethod: z.enum(["", ...deliveryMethodValues]).optional(),
  deliveryStatus: z.enum(deliveryStatuses).optional(),
  licenceKey: optionalField(500),
  activationInstructions: optionalField(3000),
  downloadUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^https:\/\/[^\s]+$/i.test(v), "Use a full https:// link")
    .optional(),
});

export const softwareEnquiryUpdateSchema = z.object({ status: z.enum(enquiryStatuses) });

// ---------- Public software forms ----------

const publicPhone = z
  .string()
  .trim()
  .min(7, "Phone number is required")
  .max(20)
  .regex(/^\+?[0-9\s\-()]{7,20}$/, "Enter a valid phone number");
const publicEmail = z.string().trim().toLowerCase().min(1, "Email is required").email("Enter a valid email address").max(160);
const spam = {
  website: z.string().max(0, "Invalid submission").optional().or(z.literal("")),
  startedAt: z.number().int().positive(),
};

export const softwareDemoRequestSchema = z.object({
  name: str("Full name", 2, 100),
  email: publicEmail,
  phone: publicPhone,
  company: optional(120),
  software: objectId.optional().or(z.literal("")),
  tradingMarket: z.enum(["", ...tradingMarketValues]).optional().default(""),
  message: str("Message", 10, 3000),
  preferredContactMethod: z.enum(contactMethods, { errorMap: () => ({ message: "Select a contact method" }) }),
  consent: z.literal(true, { errorMap: () => ({ message: "Please accept the privacy notice to continue" }) }),
  ...spam,
});
export type SoftwareDemoRequestInput = z.input<typeof softwareDemoRequestSchema>;

export const softwarePurchaseSchema = z.object({
  productId: objectId,
  licenceId: objectId,
  // The price the customer saw. Only used to detect a change: the charged price always comes from the database.
  expectedPrice: z.number().min(0).optional(),
  customer: z.object({
    name: str("Full name", 2, 100),
    email: publicEmail,
    phone: publicPhone,
    company: optional(120),
    country: optional(80),
  }),
  notes: optional(2000),
  consent: z.literal(true, { errorMap: () => ({ message: "Please accept the terms to continue" }) }),
  ...spam,
});
export type SoftwarePurchaseInput = z.input<typeof softwarePurchaseSchema>;

// ---------- Website content ----------

export const contentPageKeys = ["home", "about", "spices", "mentorship", "staffing", "contact"] as const;
export type ContentPageKey = (typeof contentPageKeys)[number];

const seoEntry = z.object({ title: optional(70), description: optional(170) });

export const siteContentSchema = z.object({
  home: z.object({
    heroTitle: str("Hero heading", 3, 120),
    heroDescription: str("Hero description", 10, 400),
    heroPrimaryCta: str("Primary button", 2, 40),
    heroSecondaryCta: str("Secondary button", 2, 40),
    introTitle: str("Introduction heading", 3, 120),
    introLead: str("Introduction text", 10, 600),
    introBody: optional(800),
  }),
  values: z
    .array(z.object({ name: str("Value name", 2, 30), text: str("Value description", 5, 200) }))
    .min(3, "Keep at least 3 values")
    .max(7, "Up to 7 values"),
  divisions: z.object({
    spices: str("Spices description", 10, 240),
    mentorship: str("Mentorship description", 10, 240),
    digital: str("Digital description", 10, 240),
    staffing: str("Staffing description", 10, 240),
  }),
  cta: z.object({
    title: str("CTA heading", 3, 120),
    text: str("CTA text", 10, 400),
    buttonLabel: str("CTA button", 2, 40),
  }),
  footer: z.object({ tagline: str("Tagline", 3, 120), description: str("Footer description", 10, 400) }),
  seo: z.object(Object.fromEntries(contentPageKeys.map((k) => [k, seoEntry])) as Record<ContentPageKey, typeof seoEntry>),
});
export type SiteContentInput = z.input<typeof siteContentSchema>;
export type SiteContent = z.output<typeof siteContentSchema>;

// ---------- Settings ----------

const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .max(160)
  .refine((v) => v === "" || z.string().email().safeParse(v).success, "Enter a valid email address")
  .default("");

export const settingsSchema = z.object({
  businessName: str("Business name", 2, 80),
  logo: image.nullable().default(null),
  contactEmail: optionalEmail,
  contactPhone: z
    .string()
    .trim()
    .max(24)
    .refine((v) => v === "" || /^\+?[0-9\s\-()]{7,20}$/.test(v), "Enter a valid phone number")
    .default(""),
  whatsappNumber: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v === "" || (v.length >= 8 && v.length <= 15), "Use international format, digits only (e.g. 919876543210)")
    .default(""),
  address: optional(300),
  social: z
    .object({ instagram: url, facebook: url, linkedin: url, x: url, youtube: url })
    .default({}),
  seo: z.object({ defaultTitle: optional(70), defaultDescription: optional(170) }).default({}),
  notifications: z.object({ emailOnSubmission: z.boolean().default(false) }).default({}),
  publishing: z.object({ newItemsAsDraft: z.boolean().default(true) }).default({}),
  store: z
    .object({ productsPerPage: z.coerce.number().int("Use a whole number").min(1, "Show at least 1 product").max(48, "Show at most 48 products").default(DEFAULT_PRODUCTS_PER_PAGE) })
    .default({}),
  retentionMonths: z.coerce.number().int().min(1).max(120).default(24),
});
export type SettingsInput = z.input<typeof settingsSchema>;
export type Settings = z.output<typeof settingsSchema>;

// ---------- List queries ----------

const dateParam = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .catch(undefined);

export const listQuerySchema = z.object({
  q: z.string().trim().max(100).optional().catch(undefined),
  status: z.string().max(40).optional().catch(undefined),
  filter: z.string().max(40).optional().catch(undefined),
  location: z.string().trim().max(120).optional().catch(undefined),
  employment: z.enum(employmentTypes).optional().catch(undefined),
  experience: z.enum(experienceOptions).optional().catch(undefined),
  availability: z.string().trim().max(60).optional().catch(undefined),
  skill: z.string().trim().max(100).optional().catch(undefined),
  from: dateParam,
  to: dateParam,
  sort: z.enum(["newest", "oldest"]).catch("newest").default("newest"),
  page: z.coerce.number().int().min(1).max(10000).catch(1).default(1),
});
export type ListQuery = z.output<typeof listQuerySchema>;

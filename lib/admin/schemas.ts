import { z } from "zod";
import { sanitize } from "@/lib/validations";
import {
  availabilityValues,
  candidateStatuses,
  enquiryStatuses,
  orderStatuses,
  publishStatuses,
  SUPPORTED_CURRENCIES,
  spiceCategoryValues,
  staffingStatuses,
} from "./constants";

/**
 * Admin validation schemas — shared by admin forms (client) and admin route handlers (server).
 * Zod strips unknown keys, so only the fields listed here can ever be written (no mass assignment).
 */

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

export const spiceProductSchema = z.object({
  name: str("Product name", 2, 100),
  slug,
  category: z.string().trim().min(1, "Select a category"),
  images: z.array(image).max(4, "Up to 4 images").default([]),
  marketPrice: z.coerce
    .number({ required_error: "Market price is required", invalid_type_error: "Market price must be a number" })
    .min(0, "Market price must be 0 or greater"),
  ourPrice: z.coerce
    .number({ required_error: "Our price is required", invalid_type_error: "Our price must be a number" })
    .min(0, "Our price must be 0 or greater"),
  shortDescription: str("Short description", 5, 500),
  description: z.string().optional().default(""),
  status,
  order,
  seo,
});

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
  quantity: z.number().int().min(1).max(10000),
});

export const checkoutSchema = z.object({
  customer: customerSchema,
  items: z.array(checkoutItemSchema).min(1, "Your cart is empty").max(50),
  notes: z.string().max(2000).optional().default(""),
});
export type CheckoutInput = z.input<typeof checkoutSchema>;

// ---------- Order admin update ----------

export const orderUpdateSchema = z.object({
  status: z.enum(orderStatuses),
  internalNote: z.string().max(2000).optional(),
});

export const mentorshipProgramSchema = z.object({
  title: str("Programme title", 2, 120),
  slug,
  description: str("Description", 10, 2000),
  topics: list(12, 100),
  format: optional(120),
  duration: optional(80),
  availability: optional(120),
  ctaLabel: optional(40),
  status,
  order,
  seo,
});

export const digitalServiceSchema = z.object({
  title: str("Service title", 2, 100),
  slug,
  category: optional(60),
  description: str("Description", 10, 1000),
  image: image.nullable().default(null),
  startingPrice: optional(60),
  features: list(10, 100),
  status,
  order,
  seo,
});

export const portfolioProjectSchema = z.object({
  title: str("Project title", 2, 100),
  slug,
  category: optional(80),
  description: optional(600),
  image: image.nullable().default(null),
  projectUrl: url,
  isConcept: z.boolean().default(true),
  status,
  order,
});

// ---------- Website content ----------

export const contentPageKeys = ["home", "about", "spices", "mentorship", "digital", "staffing", "contact"] as const;
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
  from: dateParam,
  to: dateParam,
  sort: z.enum(["newest", "oldest"]).catch("newest").default("newest"),
  page: z.coerce.number().int().min(1).max(10000).catch(1).default(1),
});
export type ListQuery = z.output<typeof listQuerySchema>;

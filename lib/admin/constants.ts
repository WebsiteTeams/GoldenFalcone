/** Shared admin enums — imported by models, validation schemas and UI alike. */

export const orderStatuses = ["pending", "confirmed", "processing", "completed", "cancelled"] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export const orderStatusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  completed: "Completed",
  cancelled: "Cancelled",
};

/**
 * Statuses saved by the earlier order flow. Existing orders keep them in the database (no migration),
 * so they stay valid for the model but are shown and filtered as their current equivalent.
 */
const legacyOrderStatusMap = {
  "pending-whatsapp": "pending",
  "enquiry-received": "pending",
  shipped: "processing",
} as const satisfies Record<string, OrderStatus>;

export const allOrderStatusValues = [...orderStatuses, ...(Object.keys(legacyOrderStatusMap) as (keyof typeof legacyOrderStatusMap)[])];

export const normalizeOrderStatus = (status: string): OrderStatus =>
  (legacyOrderStatusMap as Record<string, OrderStatus>)[status] ?? (status as OrderStatus);

/** Stored values that count as the given status, including legacy ones. */
export const orderStatusValues = (status: string) => allOrderStatusValues.filter((value) => normalizeOrderStatus(value) === status);

export const orderSources = ["website", "whatsapp"] as const;
export type OrderSource = (typeof orderSources)[number];
export const orderSourceLabels: Record<OrderSource, string> = { website: "Website checkout", whatsapp: "WhatsApp order" };

// ---------- Quality-based spice catalogue ----------

export const productTypes = ["powder", "solid"] as const;
export type ProductType = (typeof productTypes)[number];
export const productTypeLabels: Record<ProductType, string> = { powder: "Powder", solid: "Solid / Whole" };

export const qualityLevels = ["high", "medium", "low"] as const;
export type QualityLevel = (typeof qualityLevels)[number];
export const qualityLabels: Record<QualityLevel, string> = { high: "High Quality", medium: "Medium Quality", low: "Low Quality" };

/** Whole kilograms only: decimal quantities have not been approved by the business. */
export const MIN_ORDER_KG = 1;
export const MAX_ORDER_KG = 10000;

export const LAB_REPORT_MAX_BYTES = 8 * 1024 * 1024;
export const LAB_REPORT_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;

export const DEFAULT_PRODUCTS_PER_PAGE = 4;

export const SUPPORTED_CURRENCIES = ["INR", "USD", "AED", "GBP", "EUR", "SGD"] as const;

export const adminRoles = ["admin", "editor"] as const;
export type AdminRole = (typeof adminRoles)[number];

export const enquiryStatuses = ["new", "contacted", "in-progress", "converted", "closed"] as const;

/** Digital Solutions project enquiry lifecycle */

export const staffingStatuses = [
  "new",
  "reviewing",
  "candidate-matching",
  "candidates-shortlisted",
  "shared-with-salon",
  "interview-scheduled",
  "filled",
  "closed",
] as const;

/** Candidate profile lifecycle. */
export const candidateStatuses = [
  "new",
  "reviewing",
  "shortlisted",
  "contacted",
  "interview",
  "selected",
  "not-selected",
  "inactive",
] as const;

/** The candidate-to-salon relationship, tracked separately from either record. */
export const connectionStatuses = [
  "suggested",
  "shortlisted",
  "shared-with-salon",
  "interview-scheduled",
  "interview-completed",
  "selected",
  "not-selected",
  "withdrawn",
] as const;

export const interviewStatuses = ["not-scheduled", "scheduled", "completed", "cancelled", "no-show"] as const;
export const communicationChannels = ["call", "whatsapp", "email", "meeting"] as const;
export const communicationParties = ["salon", "candidate"] as const;

/** Staffing statuses that still represent an open vacancy. */
export const openStaffingStatuses = ["new", "reviewing", "candidate-matching", "candidates-shortlisted", "shared-with-salon", "interview-scheduled"] as const;

export const publishStatuses = ["draft", "published"] as const;
export type PublishStatus = (typeof publishStatuses)[number];

export const spiceCategories = [
  { value: "cardamom", label: "Green Cardamom" },
  { value: "pepper", label: "Black Pepper" },
  { value: "cinnamon", label: "Cinnamon" },
  { value: "cloves", label: "Cloves" },
  { value: "ginger", label: "Dry Ginger" },
  { value: "other", label: "Other Spices" },
] as const;
export const spiceCategoryValues = spiceCategories.map((c) => c.value) as [string, ...string[]];

export const availabilityOptions = [
  { value: "available", label: "Available" },
  { value: "limited", label: "Limited availability" },
  { value: "on-request", label: "On request" },
  { value: "unavailable", label: "Currently unavailable" },
] as const;
export const availabilityValues = availabilityOptions.map((a) => a.value) as [string, ...string[]];

export const serviceTypeLabels: Record<string, string> = {
  spices: "Spices Export & Import",
  mentorship: "Trading Mentorship",
  staffing: "Salon Staffing",
  general: "General Enquiry",
};

export const labelFor = (value: string, options: readonly { value: string; label: string }[]) =>
  options.find((o) => o.value === value)?.label ?? value;

const statusLabels: Record<string, string> = {
  reviewing: "Under Review",
  "candidate-matching": "Candidate Matching",
  "candidates-shortlisted": "Candidates Shortlisted",
  "shared-with-salon": "Shared with Salon",
  "interview-scheduled": "Interview Scheduled",
  "interview-completed": "Interview Completed",
  "not-selected": "Not Selected",
  "not-scheduled": "Not Scheduled",
  "no-show": "No Show",
  filled: "Filled",
};

/** "in-progress" → "In Progress" */
export const statusLabel = (status: string) =>
  statusLabels[status] ??
  status
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export const toOptions = (values: readonly string[], format: (v: string) => string = statusLabel) =>
  values.map((v) => ({ value: v, label: format(v) }));

export const PAGE_SIZE = 20;
export const IMAGE_MAX_BYTES = 4 * 1024 * 1024;
export const digitalProjectTypes = [
  "corporate-website",
  "landing-page",
  "web-application",
  "booking-system",
  "custom-software",
  "maintenance-seo",
] as const;
export type DigitalProjectType = (typeof digitalProjectTypes)[number];
export const digitalIndustries = [
  "corporate",
  "e-commerce",
  "finance",
  "healthcare",
  "education",
  "technology",
  " hospitality",
  "retail",
] as const;
export type DigitalIndustry = (typeof digitalIndustries)[number];
export const digitalEnquiryStatuses = [
  "new",
  "contacted",
  "in-progress",
  "converted",
  "closed",
] as const;
export type DigitalEnquiryStatus = (typeof digitalEnquiryStatuses)[number];
export const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
  "image/x-icon",
  "image/vnd.microsoft.icon",
  "image/heic",
  "image/heif",
] as const;

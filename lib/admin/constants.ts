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
  software: "Trading Software",
  mentorship: "Trading (earlier enquiry)",
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
// ---------- Trading software catalogue ----------

export const softwareCategories = [
  { value: "stock-market", label: "Stock Market Software", short: "Stock Market", description: "Tools for equity and index analysis, screening and workflow." },
  { value: "forex", label: "Forex Software", short: "Forex", description: "Currency-market analysis and trade-management tools." },
  { value: "crypto", label: "Cryptocurrency Software", short: "Crypto", description: "Software for digital-asset markets and exchange workflows." },
  { value: "algorithmic", label: "Algorithmic Trading Software", short: "Algorithmic", description: "Automated and rules-based trading workflows." },
  { value: "indicators-strategies", label: "Trading Indicators & Strategies", short: "Indicators", description: "Charting indicators and strategy packages for supported platforms." },
  { value: "custom-tools", label: "Custom Trading Tools", short: "Custom Tools", description: "Purpose-built utilities for specific trading workflows." },
] as const;
export type SoftwareCategory = (typeof softwareCategories)[number]["value"];
export const softwareCategoryValues = softwareCategories.map((c) => c.value) as [SoftwareCategory, ...SoftwareCategory[]];
export const softwareCategoryLabel = (value: string) => softwareCategories.find((c) => c.value === value)?.label ?? value;

export const tradingMarkets = [
  { value: "stocks", label: "Stocks" },
  { value: "indices", label: "Indices" },
  { value: "futures-options", label: "Futures & Options" },
  { value: "forex", label: "Forex" },
  { value: "crypto", label: "Cryptocurrency" },
  { value: "commodities", label: "Commodities" },
] as const;
export const tradingMarketValues = tradingMarkets.map((m) => m.value) as [string, ...string[]];

export const softwarePlatforms = [
  { value: "windows", label: "Windows" },
  { value: "macos", label: "macOS" },
  { value: "linux", label: "Linux" },
  { value: "web", label: "Web browser" },
  { value: "android", label: "Android" },
  { value: "ios", label: "iOS" },
  { value: "metatrader-4", label: "MetaTrader 4" },
  { value: "metatrader-5", label: "MetaTrader 5" },
  { value: "tradingview", label: "TradingView" },
  { value: "other", label: "Other" },
] as const;
export const softwarePlatformValues = softwarePlatforms.map((p) => p.value) as [string, ...string[]];

export const licenceTypes = [
  { value: "lifetime", label: "Lifetime licence" },
  { value: "annual", label: "Annual licence" },
  { value: "monthly", label: "Monthly licence" },
  { value: "custom", label: "Custom / per agreement" },
] as const;
export const licenceTypeValues = licenceTypes.map((l) => l.value) as [string, ...string[]];

export const deliveryMethods = [
  { value: "licence-key", label: "Licence key" },
  { value: "activation-instructions", label: "Activation instructions" },
  { value: "download-link", label: "Private download link" },
  { value: "manual", label: "Manual delivery" },
] as const;
export const deliveryMethodValues = deliveryMethods.map((d) => d.value) as [string, ...string[]];

export const paymentStatuses = ["unpaid", "paid", "refunded"] as const;
export const deliveryStatuses = ["pending", "ready", "delivered"] as const;
export const contactMethods = ["Email", "Phone", "WhatsApp"] as const;

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

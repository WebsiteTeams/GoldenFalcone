/** Shared admin enums — imported by models, validation schemas and UI alike. */

export const orderStatuses = [
  "pending-whatsapp",
  "enquiry-received",
  "confirmed",
  "processing",
  "shipped",
  "completed",
  "cancelled",
] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export const orderStatusLabels: Record<string, string> = {
  "pending-whatsapp": "Pending WhatsApp Confirmation",
  "enquiry-received": "Enquiry Received",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const SUPPORTED_CURRENCIES = ["INR", "USD", "AED", "GBP", "EUR", "SGD"] as const;

export const adminRoles = ["admin", "editor"] as const;
export type AdminRole = (typeof adminRoles)[number];

export const enquiryStatuses = ["new", "contacted", "in-progress", "converted", "closed"] as const;
export const staffingStatuses = ["new", "reviewing", "shortlisted", "contacted", "filled", "closed"] as const;
export const candidateStatuses = ["new", "reviewing", "shortlisted", "contacted", "interview", "selected", "not-selected", "inactive"] as const;

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

export const digitalCategories = [
  "Websites",
  "Landing Pages",
  "Portfolios",
  "Web Applications",
  "Booking & Management",
  "Custom Software",
  "Maintenance & SEO",
] as const;

export const serviceTypeLabels: Record<string, string> = {
  spices: "Spices Export & Import",
  mentorship: "Trading Mentorship",
  digital: "Digital Solutions",
  staffing: "Salon Staffing",
  general: "General Enquiry",
};

export const labelFor = (value: string, options: readonly { value: string; label: string }[]) =>
  options.find((o) => o.value === value)?.label ?? value;

/** "in-progress" → "In Progress" */
export const statusLabel = (status: string) =>
  status
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export const toOptions = (values: readonly string[], format: (v: string) => string = statusLabel) =>
  values.map((v) => ({ value: v, label: format(v) }));

export const PAGE_SIZE = 20;
export const IMAGE_MAX_BYTES = 4 * 1024 * 1024;
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

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

/** Digital Solutions project enquiry lifecycle */
export const digitalEnquiryStatuses = [
  "new",
  "reviewing",
  "requirement-discussion",
  "proposal-preparation",
  "proposal-sent",
  "negotiation",
  "approved",
  "in-development",
  "completed",
  "on-hold",
  "not-proceeding",
  "rejected",
] as const;
export type DigitalEnquiryStatus = (typeof digitalEnquiryStatuses)[number];

export const digitalEnquiryStatusLabels: Record<DigitalEnquiryStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  "requirement-discussion": "Requirement Discussion",
  "proposal-preparation": "Proposal Preparation",
  "proposal-sent": "Proposal Sent",
  negotiation: "Negotiation",
  approved: "Approved",
  "in-development": "In Development",
  completed: "Completed",
  "on-hold": "On Hold",
  "not-proceeding": "Not Proceeding",
  rejected: "Rejected",
};

export const digitalProjectTypes = [
  "Website Development",
  "Mobile App Development",
  "Web Application Development",
  "Custom Software Development",
  "Other",
] as const;
export type DigitalProjectType = (typeof digitalProjectTypes)[number];

export const digitalIndustries = [
  "Retail",
  "Education",
  "Hospitality",
  "Healthcare",
  "Real Estate",
  "Beauty & Salon",
  "Manufacturing",
  "Trading",
  "Other",
] as const;
export type DigitalIndustry = (typeof digitalIndustries)[number];

export const digitalBudgetRanges = [
  "Under ₹50,000",
  "₹50,000 – ₹1,00,000",
  "₹1,00,000 – ₹2,50,000",
  "₹2,50,000 – ₹5,00,000",
  "₹5,00,000+",
  "Flexible / To be discussed",
] as const;

export const digitalTimelines = [
  "Immediate (Within 2–4 weeks)",
  "1–2 Months",
  "2–3 Months",
  "3–6 Months",
  "Flexible",
] as const;

export const digitalContactMethods = ["Any", "Email", "Phone", "WhatsApp"] as const;

/** Hiring requirement lifecycle. */
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

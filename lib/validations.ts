import { z } from "zod";
import { businessTypes, employmentTypes, experienceRequired, salonRoles } from "./content";

/**
 * Shared validation schemas — used by React Hook Form on the client
 * and re-checked by the API route handlers on the server.
 */

// Strip control characters and angle brackets, collapse whitespace.
export const sanitize = (value: string) =>
  value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[<>]/g, "")
    .trim();

const text = (label: string, min: number, max: number) =>
  z
    .string({ required_error: `${label} is required` })
    .transform(sanitize)
    .pipe(
      z
        .string()
        .min(min, min <= 1 ? `${label} is required` : `${label} must be at least ${min} characters`)
        .max(max, `${label} must be ${max} characters or fewer`),
    );

const optionalText = (max: number) =>
  z
    .string()
    .max(max, `Must be ${max} characters or fewer`)
    .transform(sanitize)
    .optional()
    .or(z.literal(""));

const email = z
  .string({ required_error: "Email is required" })
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .email("Enter a valid email address")
  .max(160);

const phone = z
  .string({ required_error: "Phone number is required" })
  .trim()
  .min(1, "Phone number is required")
  .regex(/^\+?[0-9\s\-()]{7,20}$/, "Enter a valid phone number");

/** Anti-spam fields included with every public form. */
export const spamFields = {
  website: z.string().max(0, "Invalid submission").optional().or(z.literal("")), // honeypot — must stay empty
  startedAt: z.number().int().positive(),
};

export const serviceTypes = ["spices", "mentorship", "digital", "staffing", "general"] as const;
export type ServiceType = (typeof serviceTypes)[number];

export const enquirySchema = z.object({
  name: text("Name", 2, 100),
  email,
  phone: phone.optional().or(z.literal("")),
  company: optionalText(120),
  country: optionalText(80),
  serviceType: z.enum(serviceTypes, { errorMap: () => ({ message: "Select a service" }) }),
  // Service-specific detail fields (all optional; shown per form variant)
  product: optionalText(80),
  quantity: optionalText(80),
  experienceLevel: optionalText(60),
  projectType: optionalText(80),
  budget: optionalText(60),
  timeline: optionalText(60),
  message: text("Message", 10, 3000),
  consent: z.literal(true, { errorMap: () => ({ message: "Please accept the privacy notice to continue" }) }),
  ...spamFields,
});
export type EnquiryInput = z.input<typeof enquirySchema>;

// ─── Staffing request (salon hiring) ───────────────────────────────────────

export const staffingRequestSchema = z.object({
  // Business info
  salonName: text("Salon / business name", 2, 120),
  contactName: text("Contact person name", 2, 100),
  phone,
  whatsapp: phone.optional().or(z.literal("")),
  email: email.optional().or(z.literal("")),
  location: text("Business location", 2, 120),
  businessType: z.enum(businessTypes, { errorMap: () => ({ message: "Select a business type" }) }),
  websiteOrSocial: optionalText(300),

  // Staffing requirement
  professionalCategory: z.enum(salonRoles, { errorMap: () => ({ message: "Select a job role" }) }),
  quantity: z.coerce
    .number({ invalid_type_error: "Enter the number of professionals" })
    .int("Enter a whole number")
    .min(1, "At least 1 professional")
    .max(100, "For more than 100, please mention it in the notes"),
  requiredSkills: optionalText(1000),
  experienceRequired: z
    .enum(experienceRequired, { errorMap: () => ({ message: "Select experience requirement" }) })
    .optional()
    .or(z.literal("")),
  employmentType: z
    .enum(employmentTypes, { errorMap: () => ({ message: "Select employment type" }) })
    .optional()
    .or(z.literal("")),
  salaryRange: optionalText(120),
  preferredJoiningDate: optionalText(80),
  jobDescription: optionalText(3000),

  consent: z.literal(true, { errorMap: () => ({ message: "Please accept the privacy notice to continue" }) }),
  ...spamFields,
});
export type StaffingRequestInput = z.input<typeof staffingRequestSchema>;

// ─── Candidate experience options ──────────────────────────────────────────

export const experienceOptions = ["Fresher", "Less than 1 year", "1–2 years", "3–5 years", "6–10 years", "More than 10 years"] as const;

// ─── Candidate registration ─────────────────────────────────────────────────

export const candidateApplicationSchema = z.object({
  // Personal
  fullName: text("Full name", 2, 100),
  email,
  phone,
  whatsapp: phone.optional().or(z.literal("")),
  location: text("Current location", 2, 120),
  preferredWorkLocation: optionalText(120),

  // Professional
  professionalCategory: z.enum(salonRoles, { errorMap: () => ({ message: "Select your professional category" }) }),
  additionalSkills: z.array(z.string().max(100)).max(30).default([]),
  customSkills: optionalText(500), // comma-separated custom skills entered by user
  experience: z.enum(experienceOptions, { errorMap: () => ({ message: "Select your experience" }) }),
  previousWorkplace: optionalText(200),
  previousJobRole: optionalText(120),
  about: optionalText(2000),
  employmentPreference: z
    .enum(employmentTypes, { errorMap: () => ({ message: "Select your employment preference" }) })
    .optional()
    .or(z.literal("")),
  expectedSalary: optionalText(120),
  availability: optionalText(120),

  consent: z.literal(true, { errorMap: () => ({ message: "Your consent is required to submit a profile" }) }),
  ...spamFields,
});
export type CandidateApplicationInput = z.input<typeof candidateApplicationSchema>;

// ─── File upload constraints ────────────────────────────────────────────────

export const CV_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const CV_ACCEPT = ".pdf,.doc,.docx";

export const CERT_MAX_BYTES = 5 * 1024 * 1024; // 5 MB per file
export const CERT_ACCEPT = ".pdf,.doc,.docx,.jpg,.jpeg,.png";
export const CERT_MAX_COUNT = 8; // max certificates

export const IMG_MAX_BYTES = 8 * 1024 * 1024; // 8 MB per image
export const IMG_ACCEPT = ".jpg,.jpeg,.png,.webp";
export const IMG_MAX_COUNT = 6; // max portfolio images


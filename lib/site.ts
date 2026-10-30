/**
 * Central site configuration.
 * Contact details are read from environment variables only — nothing is hardcoded,
 * and any UI that depends on a missing value is hidden rather than shown as a dead link.
 */
const clean = (value: string | undefined) => (value && value.trim() ? value.trim() : undefined);

const rawWhatsapp = clean(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER)?.replace(/\D/g, "") || "919790586474";
const whatsappNumber = rawWhatsapp.length === 10 ? `91${rawWhatsapp}` : rawWhatsapp;

export const site = {
  name: "Goldenfalcone",
  legalName: "GOLDENFALCONE",
  tagline: "Integrity, Loyalty, Respect, Strength, Legacy.",
  description:
    "Goldenfalcone is a diversified business brand spanning whole-spice export and import, trading mentorship, digital solutions and salon staffing.",
  url: (clean(process.env.NEXT_PUBLIC_SITE_URL) ?? "http://localhost:3000").replace(/\/$/, ""),
  logo: "/logo.png",
  values: ["Integrity", "Loyalty", "Respect", "Strength", "Legacy"],
  contact: {
    email: clean(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
    phone: clean(process.env.NEXT_PUBLIC_CONTACT_PHONE),
    address: clean(process.env.NEXT_PUBLIC_CONTACT_ADDRESS),
    whatsappNumber: whatsappNumber || undefined,
  },
  cvUploadsEnabled: process.env.NEXT_PUBLIC_CV_UPLOADS_ENABLED === "true",
} as const;

export function whatsappLink(message?: string) {
  if (!site.contact.whatsappNumber) return undefined;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${site.contact.whatsappNumber}${text}`;
}

export type NavItem = { label: string; href: string };

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

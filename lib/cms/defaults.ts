import type { Settings, SiteContent } from "@/lib/admin/schemas";
import { brandValues, divisions } from "@/lib/content";
import { site } from "@/lib/site";

/**
 * Built-in copy used until content is published from the admin panel, and whenever the database is unreachable.
 * Multi-line headings use "\n" to separate lines.
 */
export const defaultContent: SiteContent = {
  home: {
    heroTitle: "One Vision.\nFour Dimensions of Business.",
    heroDescription:
      "A diversified business group bringing together opportunities across spices, trading education, salon staffing, and digital solutions — driven by purpose, integrity, and a vision for growth.",
    heroPrimaryCta: "Explore Our Businesses",
    heroSecondaryCta: "Discover Goldenfalcone",
    introTitle: "A Diversified Brand,\nBuilt With Purpose.",
    introLead:
      "Goldenfalcone brings together distinct business ventures under one vision — creating opportunities, delivering meaningful services, and building long-term relationships through integrity and commitment.",
    introBody:
      "Each venture serves its own audience and brings its own expertise. What connects them is a shared way of working: listen carefully, deal honestly and build relationships that are meant to last.",
  },
  values: brandValues.map((v) => ({ name: v.name, text: v.text })),
  divisions: Object.fromEntries(divisions.map((d) => [d.key, d.description])) as SiteContent["divisions"],
  cta: {
    title: "Let's Build Something\nMeaningful Together.",
    text: "Have a business enquiry, partnership opportunity, or project in mind? Connect with Goldenfalcone and start a conversation.",
    buttonLabel: "Discuss Your Project",
  },
  footer: {
    tagline: site.tagline,
    description:
      "A diversified business brand bringing one set of values to four distinct divisions — spice trade, trading education, digital solutions and salon staffing.",
  },
  seo: {
    home: { title: "", description: "" },
    about: { title: "", description: "" },
    spices: { title: "", description: "" },
    mentorship: { title: "", description: "" },
    digital: { title: "", description: "" },
    staffing: { title: "", description: "" },
    contact: { title: "", description: "" },
  },
};

/** Initial settings come from environment variables, so an existing deployment keeps working unchanged. */
export const defaultSettings: Settings = {
  businessName: site.name,
  logo: null,
  contactEmail: site.contact.email ?? "",
  contactPhone: site.contact.phone ?? "",
  whatsappNumber: site.contact.whatsappNumber ?? "",
  address: site.contact.address ?? "",
  social: { instagram: "", facebook: "", linkedin: "", x: "", youtube: "" },
  seo: { defaultTitle: "", defaultDescription: "" },
  notifications: { emailOnSubmission: false },
  publishing: { newItemsAsDraft: true },
  retentionMonths: 24,
};

/** Splits a stored "\n"-separated heading into display lines. */
export const lines = (value: string) =>
  value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

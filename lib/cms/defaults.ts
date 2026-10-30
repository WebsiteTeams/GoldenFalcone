import type { Settings, SiteContent } from "@/lib/admin/schemas";
import { brandValues, divisions } from "@/lib/content";
import { site } from "@/lib/site";

/**
 * Built-in copy used until content is published from the admin panel, and whenever the database is unreachable.
 * Multi-line headings use "\n" to separate lines.
 */
export const defaultContent: SiteContent = {
  home: {
    heroTitle: "One Vision.\nFour Dimensions\nof Business.",
    heroDescription:
      "From global spice trading and trading education to digital innovation and professional staffing, Goldenfalcone connects businesses with opportunities for growth.",
    heroPrimaryCta: "Explore Our Businesses",
    heroSecondaryCta: "Let's Work Together",
    introTitle: "A diversified brand,\nbuilt with purpose.",
    introLead:
      "Goldenfalcone brings together four distinct businesses under one identity. Each division serves a different audience, yet all are guided by the same principles: honest dealings, lasting relationships and work done properly.",
    introBody:
      "Whether you are sourcing whole spices, beginning your market education, planning a new website or looking for salon talent, you will find a single point of contact who listens first and responds personally.",
  },
  values: brandValues.map((v) => ({ name: v.name, text: v.text })),
  divisions: Object.fromEntries(divisions.map((d) => [d.key, d.description])) as SiteContent["divisions"],
  cta: {
    title: "Let's build something\nof lasting value.",
    text: "Tell us what you are looking for — a spice requirement, a learning goal, a digital project or a staffing need — and we will respond personally.",
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

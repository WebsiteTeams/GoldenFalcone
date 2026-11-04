/** Public, browser-safe shapes for trading software. Nothing here carries admin-only or private fields. */

export type PublicLicence = {
  id: string;
  name: string;
  type: string;
  typeLabel: string;
  price: number;
  description: string;
};

export type PublicSoftware = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  markets: { value: string; label: string }[];
  shortDescription: string;
  description: string;
  thumbnail: { url: string; alt: string } | null;
  screenshots: { url: string; alt: string }[];
  demoVideo: string;
  features: string[];
  platforms: { value: string; label: string }[];
  systemRequirements: string;
  installationNotes: string;
  supportInfo: string;
  licenceTerms: string;
  faqs: { question: string; answer: string }[];
  /** Active licences with a price, cheapest first. */
  licences: PublicLicence[];
  currency: string;
  startingPrice: number | null;
  availability: string;
  availabilityLabel: string;
  /** True when a customer can place an order online: a priced active licence and a product that is on sale. */
  canPurchase: boolean;
  featured: boolean;
  featuredOrder: number;
  createdAt: string;
};

export type SoftwareFacets = {
  total: number;
  categories: { value: string; label: string; short: string; description: string; count: number }[];
  markets: { value: string; label: string }[];
  platforms: { value: string; label: string }[];
  licenceTypes: { value: string; label: string }[];
  priceRange: { min: number; max: number; currency: string } | null;
};

export type SoftwareListing = { items: PublicSoftware[]; facets: SoftwareFacets };

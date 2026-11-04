import { CatalogueProvider } from "@/components/software/CatalogueProvider";
import { CategoryNav } from "@/components/software/CategoryNav";
import { DemoSection } from "@/components/software/DemoSection";
import { FeaturedSoftware } from "@/components/software/FeaturedSoftware";
import { SoftwareCatalogue } from "@/components/software/SoftwareCatalogue";
import { SoftwareHero } from "@/components/software/SoftwareHero";
import { HowItWorks, WhyGoldenfalcone } from "@/components/software/WhyAndProcess";
import { pageMetadata } from "@/lib/cms";
import { getSoftwareListing } from "@/lib/software/catalogue";
import type { SoftwareListing } from "@/lib/software/types";

export const revalidate = 3600;

// The "mentorship" key is the page's stored SEO slot in the admin content editor; it now belongs to this page.
export const generateMetadata = () =>
  pageMetadata("mentorship", {
    title: "Trading Software",
    description:
      "Explore professional trading software from Goldenfalcone: market analysis tools, strategies and automated workflows. Request a demo or purchase a licence.",
    alternates: { canonical: "/trading-software" },
    openGraph: { title: "Trading Software | Goldenfalcone", url: "/trading-software" },
  });

export default async function TradingSoftwarePage() {
  let listing: SoftwareListing | null = null;
  try {
    listing = await getSoftwareListing({ sort: "featured" });
  } catch (error) {
    if (process.env.MONGODB_URI) console.error("[software] page listing unavailable", (error as Error).message);
  }
  const featured = listing?.items.filter((p) => p.featured) ?? [];
  const options = listing?.items.map((p) => ({ id: p.id, name: p.name })) ?? [];

  return (
    <CatalogueProvider initial={listing} initialError={!listing}>
      <SoftwareHero />
      <CategoryNav />
      <FeaturedSoftware products={featured} />
      <SoftwareCatalogue />
      <WhyGoldenfalcone />
      <HowItWorks />
      <DemoSection software={options} />
    </CatalogueProvider>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeIndianRupee, FileCheck2, Gauge, MapPin, MessageCircle, Scale, Tag } from "lucide-react";
import { RevealUp, StaggerContainer, StaggerItem } from "@/components/animations";
import { SpiceHero3D } from "@/components/spices/SpiceHero3D";
import { FeaturedProductCard } from "@/components/spices/FeaturedProductCard";
import { getPublishedSpices, getWhatsappNumber, pageMetadata, whatsappHref, type PublicSpice } from "@/lib/cms";
import { catalogueHref, pickFeatured } from "@/lib/spices/catalogue";
import type { ProductType } from "@/lib/admin/constants";

// Refreshed on demand when products change in the admin panel; hourly as a fallback.
export const revalidate = 3600;

export const generateMetadata = (): Promise<Metadata> =>
  pageMetadata("spices", {
    title: "Premium Spices by Quality Level | Goldenfalcone",
    description:
      "Shop spice powders and whole spices from Goldenfalcone by quality level, with the quality percentage, sourcing area, lab report and price per kilogram for each.",
    alternates: { canonical: "/spices" },
    openGraph: {
      title: "Premium Spices by Quality Level | Goldenfalcone",
      url: "/spices",
    },
  });

const WA_MESSAGE = "Hello Goldenfalcone, I would like to enquire about your spices.";

const qualityFacts = [
  { icon: Gauge, title: "Quality percentage", text: "Each of the three quality levels shows its own percentage, so you can compare them side by side." },
  { icon: MapPin, title: "Sourcing area", text: "See where the quality you are looking at is sourced from. It can differ from one level to the next." },
  { icon: FileCheck2, title: "Lab report", text: "Preview or download the report for the exact quality you select, not a general product certificate." },
  { icon: BadgeIndianRupee, title: "Clear pricing", text: "The market price and our selling price per kilogram are shown together for every quality." },
];

const trustIndicators = [
  { icon: FileCheck2, label: "A lab report for each quality" },
  { icon: Tag, label: "Market price shown beside ours" },
  { icon: Scale, label: "Order from 1 kg" },
  { icon: MessageCircle, label: "Order online or on WhatsApp" },
];

/** One category's featured products. Each category is independent and handles having no products on its own. */
function FeaturedSection({ type, title, intro, emptyText, products, className }: { type: ProductType; title: string; intro: string; emptyText: string; products: PublicSpice[]; className: string }) {
  return (
    <section aria-labelledby={`featured-${type}`} className={`py-20 sm:py-24 ${className}`}>
      <div className="container-lux">
        <RevealUp className="max-w-2xl">
          <p className="eyebrow text-gold-dark">Featured</p>
          <h2 id={`featured-${type}`} className="mt-4 text-4xl text-forest sm:text-5xl">{title}</h2>
          <p className="mt-3 text-muted">{intro}</p>
        </RevealUp>
        {products.length ? (
          <StaggerContainer className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((spice) => (
              <StaggerItem key={spice.id} className="h-full">
                <FeaturedProductCard spice={spice} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <p className="mt-10 rounded-[1.75rem] border border-dashed border-gold/40 px-6 py-12 text-center font-serif text-2xl text-forest/80">{emptyText}</p>
        )}
        <div className="mt-10 text-center">
          <Link
            href={catalogueHref({ type })}
            className="inline-flex items-center gap-2 rounded-full border border-forest/25 px-7 py-3 text-sm font-semibold text-forest transition-colors hover:border-gold hover:bg-champagne/25"
          >
            Explore More <span className="sr-only">{title}</span> <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default async function SpicesPage() {
  const [products, whatsappNumber] = await Promise.all([getPublishedSpices(), getWhatsappNumber()]);
  const powder = pickFeatured(products, "powder");
  const solid = pickFeatured(products, "solid");
  const waLink = whatsappHref(whatsappNumber, WA_MESSAGE);

  return (
    <div className="bg-ivory">
      <SpiceHero3D products={[...powder.slice(0, 1), ...solid.slice(0, 1)]} whatsappHref={waLink} />

      {/* Trust indicators: statements the store itself backs up on every product page. */}
      <section aria-label="What you get with every order" className="border-b border-line bg-white">
        <ul className="container-lux grid grid-cols-2 gap-x-6 gap-y-5 py-7 lg:grid-cols-4">
          {trustIndicators.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-sm font-medium text-forest">
              <Icon aria-hidden className="h-5 w-5 shrink-0 text-gold-dark" strokeWidth={1.5} />
              {label}
            </li>
          ))}
        </ul>
      </section>

      {/* Brand introduction */}
      <section className="py-20 sm:py-28">
        <RevealUp className="container-lux max-w-3xl text-center">
          <p className="eyebrow text-gold-dark">Our Approach</p>
          <h2 className="mt-4 text-4xl leading-tight text-forest sm:text-5xl">The same spice can mean very different things. We show you the difference.</h2>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Goldenfalcone offers spice powders and whole spices at more than one quality level, so you can buy what suits your
            kitchen or your business. Every level has its own figures, its own sourcing and its own lab report, all in one place.
          </p>
        </RevealUp>
      </section>

      <FeaturedSection
        type="powder"
        title="Featured Powder Products"
        intro="Ground spices selected by our team, shown at the quality we recommend."
        emptyText="New powders are on their way."
        products={powder}
        className="bg-ivory-dark"
      />
      <FeaturedSection
        type="solid"
        title="Featured Solid Products"
        intro="Whole spices selected by our team, shown at the quality we recommend."
        emptyText="New whole spices are on their way."
        products={solid}
        className="bg-ivory"
      />

      {/* Quality and sourcing highlights */}
      <section className="bg-ivory-dark py-20 sm:py-28">
        <div className="container-lux">
          <RevealUp className="max-w-2xl">
            <p className="eyebrow text-gold-dark">Quality &amp; Sourcing</p>
            <h2 className="mt-4 text-4xl text-forest sm:text-5xl">What you can check before you buy</h2>
          </RevealUp>
          <StaggerContainer className="mt-12 grid gap-px overflow-hidden rounded-[1.25rem] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {qualityFacts.map(({ icon: Icon, title, text }) => (
              <StaggerItem key={title} className="bg-white p-7">
                <Icon aria-hidden className="h-6 w-6 text-gold-dark" strokeWidth={1.5} />
                <h3 className="mt-5 text-2xl text-forest">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight, MessageCircle } from "lucide-react";
import { getPublishedSpices, getSpiceBySlug, getWhatsappNumber, whatsappHref, type PublicSpice } from "@/lib/cms";
import { ProductGallery } from "@/components/spices/ProductGallery";
import { QualityPurchasePanel } from "@/components/spices/QualityPurchasePanel";
import { SpiceProductCard } from "@/components/spices/SpiceProductCard";
import { site } from "@/lib/site";
import { catalogueHref } from "@/lib/spices/catalogue";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const spice = await getSpiceBySlug(slug);
  if (!spice) return { title: "Product Not Found | Goldenfalcone" };

  const title = `${spice.name}${spice.productTypeLabel ? ` | ${spice.productTypeLabel}` : ""} | Goldenfalcone`;
  return {
    title,
    description: spice.shortDescription,
    alternates: { canonical: `/spices/${spice.slug}` },
    openGraph: {
      title,
      description: spice.shortDescription,
      images: spice.images[0]?.url ? [{ url: spice.images[0].url }] : [],
    },
  };
}

const absolute = (url: string) => (url.startsWith("http") ? url : `${site.url}${url}`);

/** Product structured data from real catalogue values. Ratings are left out because the store does not collect reviews. */
function productJsonLd(spice: PublicSpice) {
  const prices = spice.variants.map((v) => v.sellingPrice);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: spice.name,
    description: spice.shortDescription,
    image: spice.images.map((i) => absolute(i.url)),
    brand: { "@type": "Brand", name: site.name },
    ...(spice.productTypeLabel ? { category: spice.productTypeLabel } : {}),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: spice.currency,
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: prices.length,
      availability: "https://schema.org/InStock",
      url: `${site.url}/spices/${spice.slug}`,
    },
  };
}

export default async function SpiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ quality?: string | string[] }>;
}) {
  const { slug } = await params;
  const { quality } = await searchParams;
  const [spice, whatsappNumber, allSpices] = await Promise.all([
    getSpiceBySlug(slug),
    getWhatsappNumber(),
    getPublishedSpices(),
  ]);

  if (!spice) notFound();

  const purchasable = spice.variants.length > 0 && spice.availability !== "unavailable";
  const enquiryHref = whatsappHref(whatsappNumber, `Hello Goldenfalcone, I would like to enquire about ${spice.name}.`);

  // Same category first, then anything else that can be bought.
  const related = allSpices
    .filter((s) => s.id !== spice.id && s.variants.length > 0)
    .sort((a, b) => Number(b.productType === spice.productType) - Number(a.productType === spice.productType))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-ivory relative pb-24">
      {/* Subtle grain texture for premium feel */}
      <div className="absolute inset-0 overflow-hidden grain-background" />

      {purchasable && spice.images.length ? (
        <script
          type="application/ld+json"
          // Escaped so a value containing "</script>" can end the block early.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(spice)).replace(/</g, "\\u003c") }}
        />
      ) : null}

      {/* Keeps the transparent site navigation readable, as on the other store pages. */}
      <div className="h-24 bg-forest-deep" />

      <div className="container-lux pt-8 max-w-4xl mx-auto">
        <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-xs text-muted">
          <Link href="/spices" className="py-1 transition-colors hover:text-forest">Spices</Link>
          <ChevronRight aria-hidden className="h-3.5 w-3.5 text-muted/50" />
          {spice.productType ? (
            <>
              <Link href={catalogueHref({ type: spice.productType })} className="py-1 transition-colors hover:text-forest">{spice.productTypeLabel}</Link>
              <ChevronRight aria-hidden className="h-3.5 w-3.5 text-muted/50" />
            </>
          ) : null}
          <span aria-current="page" className="max-w-[200px] truncate font-medium text-forest">{spice.name}</span>
        </nav>

        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Left column: gallery */}
          <div className="lg:sticky lg:top-28 lg:col-span-1">
            <ProductGallery images={spice.images} productName={spice.name} />
          </div>

          {/* Right column: details and ordering */}
          <div>
            {spice.productTypeLabel ? (
              <span className="inline-flex rounded-full bg-forest/10 px-3.5 py-1 text-xs font-semibold text-forest">{spice.productTypeLabel}</span>
            ) : null}
            <h1 className="mt-3 text-5xl sm:text-6xl font-serif leading-[1.1] text-forest">{spice.name}</h1>
            <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-muted">{spice.shortDescription}</p>

            {purchasable ? (
              <QualityPurchasePanel spice={spice} whatsappEnabled={Boolean(whatsappNumber)} initialLevel={typeof quality === "string" ? quality : undefined} />
            ) : (
              <div className="mt-8 rounded-[1.5rem] border border-line bg-white p-8">
                <h2 className="text-2xl text-forest mb-3">Not available to order online yet</h2>
                <p className="text-sm leading-relaxed text-muted">
                  Quality levels and pricing for this product are being updated.{enquiryHref ? " Message us and we will share the current details." : " Please check back soon."}
                </p>
                {enquiryHref ? (
                  <a href={enquiryHref} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest px-8 py-3.5 text-sm font-semibold text-ivory transition-colors hover:bg-emerald">
                    <MessageCircle aria-hidden className="h-4 w-4" /> Enquire on WhatsApp
                  </a>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="mt-24 border-t border-line pt-14">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 id="related-heading" className="text-4xl text-forest">You may also like</h2>
              <Link href="/spices/shop" className="inline-flex items-center gap-1.5 py-1 text-sm font-semibold text-forest transition-colors hover:text-gold-dark">
                View all spices <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <SpiceProductCard key={item.id} spice={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
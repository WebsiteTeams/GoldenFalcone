import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { getPublishedSpices, getSettings, getSpiceBySlug } from "@/lib/cms";
import { formatPrice, discountPercent } from "@/lib/cart/price";
import { ProductGallery } from "@/components/spices/ProductGallery";
import { ProductActions } from "@/components/spices/ProductActions";
import { SpiceCard } from "@/components/services/CatalogueItems";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const spice = await getSpiceBySlug(slug);
  if (!spice) return { title: "Product Not Found | Goldenfalcone" };

  return {
    title: `${spice.name} | Whole Spices | Goldenfalcone`,
    description:
      spice.shortDescription ||
      `Premium ${spice.name} whole spices export & supply from Goldenfalcone.`,
    alternates: { canonical: `/spices/${spice.slug}` },
    openGraph: {
      title: `${spice.name} | Goldenfalcone Whole Spices`,
      description: spice.shortDescription,
      images: spice.images[0]?.url ? [{ url: spice.images[0].url }] : [],
    },
  };
}

export default async function SpiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [spice, settings, allSpices] = await Promise.all([
    getSpiceBySlug(slug),
    getSettings(),
    getPublishedSpices(),
  ]);

  if (!spice) notFound();

  const whatsappNumber =
    process.env.GOLDENFALCONE_WHATSAPP_NUMBER || settings.whatsappNumber || "";

  const hasPrice = typeof spice.ourPrice === "number" && spice.ourPrice > 0;
  const hasMarketPrice =
    typeof spice.marketPrice === "number" && spice.marketPrice > 0;
  const discount =
    hasMarketPrice && hasPrice
      ? discountPercent(spice.marketPrice, spice.ourPrice)
      : 0;

  const related = allSpices
    .filter((s) => s.id !== spice.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-ivory pt-28 pb-24">
      <div className="container-lux">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-muted">
          <Link href="/" className="hover:text-forest transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted/50" />
          <Link href="/spices" className="hover:text-forest transition-colors">
            Whole Spices
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted/50" />
          <span className="font-medium text-forest truncate max-w-[200px]">{spice.name}</span>
        </nav>

        {/* Main Product Layout: 2 Columns */}
        <div className="grid gap-12 lg:grid-cols-12 items-start">
          {/* Left Column: Gallery (displays all four product images) */}
          <div className="lg:col-span-6 lg:sticky lg:top-28">
            <ProductGallery images={spice.images} productName={spice.name} />
          </div>

          {/* Right Column: Product Info & Purchase Actions */}
          <div className="lg:col-span-6 flex flex-col">
            {/* Category badge */}
            <div className="flex items-center gap-2.5 mb-3">
              <span className="inline-flex items-center rounded-full bg-forest/10 px-3.5 py-1 text-xs font-semibold text-forest">
                {spice.categoryName || "Whole Spices"}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-forest font-normal leading-tight">
              {spice.name}
            </h1>

            {/* Pricing Section */}
            <div className="mt-6 flex flex-wrap items-baseline gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm">
              {hasPrice ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-3xl sm:text-4xl font-bold text-forest">
                      {formatPrice(spice.ourPrice, spice.currency)}
                    </span>
                  </div>

                  {hasMarketPrice && spice.marketPrice > spice.ourPrice && (
                    <div className="flex items-center gap-2">
                      <span className="text-base text-muted line-through">
                        {formatPrice(spice.marketPrice, spice.currency)}
                      </span>
                      {discount > 0 && (
                        <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-xs font-bold text-forest">
                          Save {discount}%
                        </span>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col">
                  <span className="font-serif text-xl font-medium text-forest">
                    Price available on enquiry
                  </span>
                  <span className="text-xs text-muted mt-0.5">
                    Contact us for wholesale pricing, export terms, and bulk volume rates.
                  </span>
                </div>
              )}
            </div>

            {/* Short description */}
            <div className="mt-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                Description
              </h2>
              <p className="text-base text-ink leading-relaxed whitespace-pre-line">
                {spice.shortDescription || spice.description}
              </p>
            </div>

            {/* Divider */}
            <div className="my-8 h-px bg-line" />

            {/* Interactive Cart and WhatsApp actions */}
            <ProductActions spice={spice} whatsappNumber={whatsappNumber} />

            {/* Quality and Supply Assurance */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-line bg-white/60 p-4">
                <div className="flex items-center gap-2 text-gold-dark mb-1">
                  <Truck className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Logistics & Supply
                  </span>
                </div>
                <p className="text-xs text-ink">
                  Worldwide export & domestic dispatch with bulk order options.
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-white/60 p-4">
                <div className="flex items-center gap-2 text-gold-dark mb-1">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Quality Guarantee
                  </span>
                </div>
                <p className="text-xs text-ink">
                  Graded, sorted, and moisture-controlled authentic whole spices.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-28 border-t border-line pt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="eyebrow text-gold-dark">Catalogue</p>
                <h2 className="font-serif text-3xl text-forest">Explore Other Spices</h2>
              </div>
              <Link
                href="/spices"
                className="text-sm font-semibold text-forest hover:text-gold-dark transition-colors inline-flex items-center gap-1.5"
              >
                View all spices <ArrowLeft className="h-4 w-4 rotate-180" />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <SpiceCard key={item.id} spice={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronRight } from "lucide-react";
import { RevealUp } from "@/components/animations";
import { DemoSection } from "@/components/software/DemoSection";
import { ProductGallery } from "@/components/software/ProductGallery";
import { PurchasePanel } from "@/components/software/PurchasePanel";
import { Accordion } from "@/components/ui/Accordion";
import { getSoftwareBySlug, getSoftwareOptions } from "@/lib/software/catalogue";
import { site } from "@/lib/site";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getSoftwareBySlug(slug);
  if (!product) return { title: "Software not found", robots: { index: false } };
  const title = product.name;
  const description = product.shortDescription;
  const url = `/trading-software/${product.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url,
      type: "website",
      ...(product.thumbnail ? { images: [{ url: product.thumbnail.url, alt: product.thumbnail.alt || product.name }] } : {}),
    },
  };
}

function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 border-t border-line py-5 sm:grid-cols-[11rem_1fr] sm:gap-8">
      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-deep">{label}</dt>
      <dd className="whitespace-pre-line text-sm leading-relaxed text-ink/85">{children}</dd>
    </div>
  );
}

export default async function SoftwareDetailPage({ params }: Props) {
  const { slug } = await params;
  const [product, options] = await Promise.all([getSoftwareBySlug(slug), getSoftwareOptions()]);
  if (!product) notFound();

  const images = [...(product.thumbnail ? [product.thumbnail] : []), ...product.screenshots];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    description: product.shortDescription,
    applicationCategory: "FinanceApplication",
    ...(product.platforms.length ? { operatingSystem: product.platforms.map((p) => p.label).join(", ") } : {}),
    ...(product.thumbnail ? { image: product.thumbnail.url } : {}),
    ...(product.startingPrice !== null
      ? { offers: { "@type": "Offer", price: product.startingPrice, priceCurrency: product.currency, availability: product.canPurchase ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" } }
      : {}),
  };
  const faqLd = product.faqs.length
    ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: product.faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) }
    : null;
  const hasSpecs = product.platforms.length || product.markets.length || product.systemRequirements || product.installationNotes || product.supportInfo || product.licenceTerms;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {faqLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} /> : null}

      <section className="bg-ivory pb-20 pt-32 sm:pt-40">
        <div className="container-lux">
          <nav aria-label="Breadcrumb" className="mb-10 flex flex-wrap items-center gap-1.5 text-sm text-muted">
            <Link href="/trading-software" className="hover:text-forest">
              Trading Software
            </Link>
            <ChevronRight aria-hidden className="h-3.5 w-3.5" />
            <span aria-current="page" className="text-forest">
              {product.name}
            </span>
          </nav>
          <div className="grid items-start gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7 lg:sticky lg:top-28">
              <ProductGallery name={product.name} images={images} demoVideo={product.demoVideo} />
            </div>
            <div className="lg:col-span-5">
              <PurchasePanel product={product} />
            </div>
          </div>
        </div>
      </section>

      {product.description || product.features.length ? (
        <section aria-label="Overview" className="bg-white py-20 sm:py-24">
          <div className="container-lux grid gap-14 lg:grid-cols-12">
            {product.description ? (
              <RevealUp className="lg:col-span-7">
                <h2 className="text-3xl text-forest sm:text-4xl">Overview</h2>
                <p className="mt-5 whitespace-pre-line leading-relaxed text-ink/80">{product.description}</p>
              </RevealUp>
            ) : null}
            {product.features.length ? (
              <RevealUp className={product.description ? "lg:col-span-5" : "lg:col-span-12"} delay={0.1}>
                <h2 className="text-3xl text-forest sm:text-4xl">Key features</h2>
                <ul className="mt-5 space-y-3">
                  {product.features.map((f) => (
                    <li key={f} className="flex gap-3 text-sm leading-relaxed text-ink/85">
                      <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" strokeWidth={2.2} />
                      {f}
                    </li>
                  ))}
                </ul>
              </RevealUp>
            ) : null}
          </div>
        </section>
      ) : null}

      {hasSpecs ? (
        <section aria-label="Specifications" className="bg-ivory py-20 sm:py-24">
          <div className="container-lux max-w-4xl">
            <h2 className="text-3xl text-forest sm:text-4xl">Specifications & requirements</h2>
            <dl className="mt-8 border-b border-line">
              {product.platforms.length ? <Spec label="Supported platforms">{product.platforms.map((p) => p.label).join(", ")}</Spec> : null}
              {product.markets.length ? <Spec label="Trading markets">{product.markets.map((p) => p.label).join(", ")}</Spec> : null}
              {product.systemRequirements ? <Spec label="Technical requirements">{product.systemRequirements}</Spec> : null}
              {product.installationNotes ? <Spec label="Installation & setup">{product.installationNotes}</Spec> : null}
              {product.licenceTerms ? <Spec label="Licence & usage">{product.licenceTerms}</Spec> : null}
              {product.supportInfo ? <Spec label="Support">{product.supportInfo}</Spec> : null}
            </dl>
          </div>
        </section>
      ) : null}

      {product.faqs.length ? (
        <section aria-label="Frequently asked questions" className="bg-white py-20 sm:py-24">
          <div className="container-lux grid gap-14 lg:grid-cols-12">
            <h2 className="text-3xl text-forest sm:text-4xl lg:col-span-4">Questions, answered.</h2>
            <div className="lg:col-span-8">
              <Accordion items={product.faqs.map((f) => ({ q: f.question, a: f.answer }))} />
            </div>
          </div>
        </section>
      ) : null}

      <DemoSection software={options} defaultSoftwareId={product.id} productName={product.name} />

      <p className="container-lux pb-16 text-xs leading-relaxed text-muted">
        Goldenfalcone sells software. We do not provide trading signals, investment advice or managed accounts, and nothing on this page promises trading results.
        Trading in financial markets carries a risk of loss.
      </p>
    </>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Leaf, MapPinned, Package } from "lucide-react";
import { RevealUp, StaggerContainer, StaggerItem } from "@/components/animations";
import { availabilityOptions, labelFor } from "@/lib/admin/constants";
import type { PublicSpice } from "@/lib/cms";
import type { Spice } from "@/lib/content";
import { SpiceIllustration } from "./SpiceIllustration";

/**
 * Public renderings of admin-managed catalogue items. Used on the live pages and in the admin preview,
 * so what an editor previews is exactly what visitors will see.
 */

const illustrated = new Set(["cardamom", "pepper", "cinnamon", "cloves", "ginger"]);

export function SpiceVisual({ spice, size = "lg" }: { spice: PublicSpice; size?: "sm" | "lg" }) {
  const image = spice.images[0];
  if (image) {
    return (
      <div className={`relative overflow-hidden rounded-full ${size === "lg" ? "mx-auto aspect-square max-w-xs" : "h-24 w-24"}`}>
        <Image src={image.url} alt={image.alt || spice.name} fill sizes={size === "lg" ? "320px" : "96px"} className="object-cover" />
      </div>
    );
  }
  const art = illustrated.has(spice.category) ? (
    <SpiceIllustration slug={spice.category as Spice["slug"]} className="h-1/2 w-1/2 text-gold" />
  ) : (
    <Leaf aria-hidden className="h-1/3 w-1/3 text-gold" strokeWidth={1} />
  );
  return size === "lg" ? (
    <div className="relative mx-auto flex aspect-square max-w-xs items-center justify-center rounded-full bg-forest">
      <div aria-hidden className="absolute inset-3 rounded-full border border-gold/25" />
      {art}
    </div>
  ) : (
    <div className="flex h-24 w-24 items-center justify-center">{art}</div>
  );
}

import { formatPrice, discountPercent } from "@/lib/cart/price";

/** Catalogue card for the dark "Whole spices we work with" grid. */
export function SpiceCard({ spice }: { spice: PublicSpice }) {
  const hasPrice = typeof spice.ourPrice === "number" && spice.ourPrice > 0;
  const hasMarketPrice = typeof spice.marketPrice === "number" && spice.marketPrice > 0;
  const discount = hasMarketPrice && hasPrice ? discountPercent(spice.marketPrice!, spice.ourPrice!) : 0;

  return (
    <Link
      href={`/spices/${spice.slug}`}
      className="group flex h-full flex-col rounded-[2rem] border border-ivory/10 bg-emerald/40 p-10 transition-[background-color,border-color,transform] duration-500 hover:-translate-y-1.5 hover:border-gold/50 hover:bg-emerald/50 shadow-sm md:shadow-md motion-reduce:!transform-none motion-reduce:!shadow-[0_18px_30px_rgba(6,47,37,0.14)]"
    >
      <div className="flex items-start justify-between gap-3">
        <SpiceVisual spice={spice} size="sm" />
        <span className="rounded-full bg-forest/60 border border-gold/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-champagne">
          {spice.categoryName || "Whole Spices"}
        </span>
      </div>

      <h3 className="mt-8 text-2xl sm:text-3xl font-serif text-ivory group-hover:text-gold transition-colors">
        {spice.name}
      </h3>

      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-ivory/70">
        {spice.shortDescription || spice.description}
      </p>

      {/* Pricing row */}
      <div className="mt-8 pt-6 border-t border-ivory/10 flex items-center justify-between flex-wrap gap-2">
        {hasPrice ? (
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-serif font-bold text-ivory">
                {formatPrice(spice.ourPrice!, spice.currency)}
              </span>
              {spice.unit && <span className="text-xs text-ivory/60">/ {spice.unit}</span>}
            </div>
            {hasMarketPrice && spice.marketPrice! > spice.ourPrice! && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-ivory/50 line-through">
                  {formatPrice(spice.marketPrice!, spice.currency)}
                </span>
                {discount > 0 && (
                  <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs font-bold text-forest">
                    Save {discount}%
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs font-medium text-champagne/80">Price on enquiry</span>
        )}

        <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-3 py-1.5 text-xs font-semibold text-gold group-hover:bg-gold group-hover:text-forest transition-colors">
          View Product <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}

/** Full product entry in the "Product details" section. */
export function SpiceArticle({ spice, index, interactive = true }: { spice: PublicSpice; index: number; interactive?: boolean }) {
  const flip = index % 2 === 1;
  const hasPrice = typeof spice.ourPrice === "number" && spice.ourPrice > 0;
  const hasMarketPrice = typeof spice.marketPrice === "number" && spice.marketPrice > 0;
  const discount = hasMarketPrice && hasPrice ? discountPercent(spice.marketPrice!, spice.ourPrice!) : 0;

  const facts = [
    spice.origin && { icon: MapPinned, label: "Origin & sourcing", value: spice.origin },
    spice.packaging && { icon: Package, label: "Packaging", value: spice.packaging },
    spice.unit && { icon: Package, label: "Unit of sale", value: spice.unit },
    spice.sku && { icon: Package, label: "Product SKU", value: spice.sku },
  ].filter(Boolean) as { icon: typeof MapPinned; label: string; value: string }[];

  return (
    <article id={spice.slug} className="grid scroll-mt-24 items-center gap-10 py-20 first:pt-0 last:pb-0 md:grid-cols-12">
      <RevealUp className={`md:col-span-4 ${flip ? "md:order-2 md:col-start-9" : ""}`}>
        <SpiceVisual spice={spice} />
      </RevealUp>
      <div className={`md:col-span-7 ${flip ? "md:order-1" : "md:col-start-6"}`}>
        <RevealUp distance={14}>
          <p className="eyebrow text-gold-dark">
            {String(index + 1).padStart(2, "0")} · {labelFor(spice.availability, availabilityOptions)}
          </p>
        </RevealUp>
        <RevealUp delay={0.05}>
          <h3 className="mt-4 text-4xl text-forest sm:text-5xl font-serif">{spice.name}</h3>
          
          {hasPrice && (
            <div className="mt-3 flex items-baseline gap-3">
              <span className="font-serif text-2xl font-bold text-forest">
                {formatPrice(spice.ourPrice!, spice.currency)}
              </span>
              {spice.unit && <span className="text-sm text-muted">/ {spice.unit}</span>}
              {hasMarketPrice && spice.marketPrice! > spice.ourPrice! && (
                <>
                  <span className="text-sm text-muted line-through">
                    {formatPrice(spice.marketPrice!, spice.currency)}
                  </span>
                  {discount > 0 && (
                    <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs font-bold text-forest">
                      Save {discount}%
                    </span>
                  )}
                </>
              )}
            </div>
          )}

          <p className="mt-5 max-w-xl whitespace-pre-line leading-relaxed text-muted">
            {spice.shortDescription || spice.description}
          </p>
        </RevealUp>
        {facts.length ? (
          <RevealUp delay={0.08}>
            <dl className="mt-6 grid max-w-xl gap-4 sm:grid-cols-2">
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-3">
                  <Icon aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
                  <div>
                    <dt className="text-xs uppercase tracking-[0.12em] text-muted">{label}</dt>
                    <dd className="mt-0.5 text-sm text-ink">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </RevealUp>
        ) : null}
        {spice.highlights.length ? (
          <StaggerContainer className="mt-7 flex flex-wrap gap-3" delay={0.1}>
            {spice.highlights.map((n) => (
              <StaggerItem key={n} className="rounded-full border-line bg-white px-4 py-2 text-sm text-ink">
                {n}
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : null}
        {spice.images.length > 1 ? (
          <div className="mt-7 flex gap-3">
            {spice.images.slice(0, 4).map((img, i) => (
              <div key={img.url} className="relative h-24 w-24 overflow-hidden rounded-2xl border border-line">
                <Image src={img.url} alt={img.alt || `${spice.name} ${i + 1}`} fill sizes="80px" className="object-cover" />
              </div>
            ))}
          </div>
        ) : null}
        {interactive ? (
          <RevealUp delay={0.15} className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href={`/spices/${spice.slug}`}
              className="inline-flex items-center gap-2 rounded-full bg-forest px-8 py-3.5 text-sm font-semibold text-ivory hover:bg-gold hover:text-forest transition-colors"
            >
              Order & Details <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="#bulk-enquiry" className="text-sm font-semibold text-forest underline hover:text-gold-dark transition-colors">
              Request Bulk Quote
            </Link>
          </RevealUp>
        ) : null}
      </div>
    </article>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Package } from "lucide-react";
import { formatPrice } from "@/lib/cart/price";
import type { PublicSpice } from "@/lib/cms";

/** Store product card, used on the spices homepage, the listing and "related products". All values come from the product. */
export function SpiceProductCard({ spice }: { spice: PublicSpice }) {
  const image = spice.images[0];
  const href = `/spices/${spice.slug}`;

  return (
    <article className="group relative flex h-full flex-col [perspective:1000px]">
      <div className="flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-line bg-white shadow-[0_1px_2px_rgba(6,47,37,0.05)] transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease-lux)] group-hover:[transform:rotateX(2deg)_translateY(-6px)] group-hover:border-gold/50 group-hover:shadow-[0_28px_48px_-24px_rgba(6,47,37,0.35)] group-focus-within:border-gold/50 motion-reduce:!transform-none">
        <div className="relative aspect-square overflow-hidden bg-ivory-dark">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt || spice.name}
              fill
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
              className="object-cover transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-105 motion-reduce:!transform-none"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package aria-hidden className="h-12 w-12 text-gold/40" strokeWidth={1.2} />
            </div>
          )}
          {spice.productTypeLabel ? (
            <span className="absolute left-3 top-3 rounded-full bg-forest/85 px-3 py-1 text-[11px] font-medium tracking-wide text-ivory backdrop-blur-sm">
              {spice.productTypeLabel}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-2xl leading-tight text-forest">
            {/* The stretched link makes the whole card clickable with one tab stop. */}
            <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
              {spice.name}
            </Link>
          </h3>

          {spice.variants.length ? (
            <ul aria-label="Available quality levels" className="mt-3 flex flex-wrap gap-1.5">
              {spice.variants.map((v) => (
                <li key={v.id} className="rounded-full border border-gold/40 bg-champagne/25 px-2.5 py-0.5 text-[11px] font-medium text-forest">
                  {v.label.replace(" Quality", "")}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-auto flex items-end justify-between gap-3 pt-5">
            {spice.startingPrice !== null ? (
              <p className="min-w-0">
                <span className="block text-[11px] uppercase tracking-[0.14em] text-muted">Starting at</span>
                <span className="font-serif text-2xl font-semibold tabular-nums text-forest">{formatPrice(spice.startingPrice, spice.currency)}</span>
                <span className="text-xs text-muted"> / kg</span>
              </p>
            ) : (
              <p className="text-sm text-muted">Price on enquiry</p>
            )}
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-forest transition-colors group-hover:text-gold-dark">
              View Details <ArrowUpRight aria-hidden className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

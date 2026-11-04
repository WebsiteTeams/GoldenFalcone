import Image from "next/image";
import Link from "next/link";
import { Package, ShoppingCart } from "lucide-react";
import { formatPrice, discountPercent } from "@/lib/cart/price";
import type { PublicSpice } from "@/lib/cms";
import { featuredProductHref } from "@/lib/spices/catalogue";
import { notchMask } from "@/components/spices/SpiceProductCard";

/** Homepage featured card — same design as the product listing card. The badge and price are the featured quality, and the link opens the product on that quality. */
export function FeaturedProductCard({ spice }: { spice: PublicSpice }) {
  const variant = spice.featuredVariant;
  if (!variant) return null;
  const image = spice.images[0];
  const blurb = spice.shortDescription || spice.description;
  const hasMarketPrice = variant.marketPrice > variant.sellingPrice && variant.marketPrice > 0;
  const discount = hasMarketPrice ? discountPercent(variant.marketPrice, variant.sellingPrice) : 0;

  return (
    <article className="group relative h-full">
      <div className="relative h-full drop-shadow-[0_18px_30px_rgba(6,47,37,0.14)] transition-[filter,transform] duration-500 ease-[var(--ease-lux)] group-hover:-translate-y-1.5 group-hover:drop-shadow-[0_28px_40px_rgba(6,47,37,0.22)] motion-reduce:!transform-none">
        <div className="flex h-full flex-col rounded-[2rem] bg-white p-2.5" style={notchMask}>
          <div className="relative aspect-[5/4] overflow-hidden rounded-[1.6rem] bg-gradient-to-b from-forest-deep to-emerald">
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
                <Package aria-hidden className="h-12 w-12 text-gold/50" strokeWidth={1.2} />
              </div>
            )}
            <span className="absolute left-3 top-3 rounded-full bg-gold px-3.5 py-1.5 text-xs font-semibold tracking-wide text-forest shadow-sm">
              {variant.label} · {variant.qualityPercent}%
            </span>
          </div>

          <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
            <h3 className="text-[1.65rem] leading-tight text-forest">
              {/* The stretched link makes the whole card clickable with one tab stop. */}
              <Link href={featuredProductHref(spice)} className="after:absolute after:inset-0 focus-visible:outline-none">
                {spice.name}
              </Link>
            </h3>
            {blurb ? <p className="mt-2 line-clamp-2 max-w-[85%] text-sm leading-relaxed text-muted">{blurb}</p> : null}

            <div className="mt-auto pt-5">
              <p>
                <span className="font-serif text-2xl font-semibold tabular-nums text-forest">{formatPrice(variant.sellingPrice, spice.currency)}</span>
                <span className="text-xs text-muted"> / kg</span>
                <br />
                {hasMarketPrice && (
                  <>
                    <span className="ml-2 text-xs text-muted line-through">{formatPrice(variant.marketPrice, spice.currency)}</span>
                    {discount > 0 && (
                      <span className="ml-1.5 rounded-full bg-gold/20 px-2 py-0.5 text-xs font-bold text-forest">Save {discount}%</span>
                    )}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
        {/* sits in the notch; the stretched title link already covers the card, so this is decorative */}
        <span
          aria-hidden
          className="absolute bottom-[0.6rem] right-[0.6rem] flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-[1.5rem] bg-white text-forest shadow-[0_6px_16px_-6px_rgba(6,47,37,0.3)] transition-colors duration-300 group-hover:bg-forest group-hover:text-gold"
        >
          <ShoppingCart className="h-6 w-6" strokeWidth={1.5} />
        </span>
      </div>
    </article>
  );
}

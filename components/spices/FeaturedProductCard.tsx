import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Package } from "lucide-react";
import { formatPrice } from "@/lib/cart/price";
import type { PublicSpice } from "@/lib/cms";
import { featuredProductHref } from "@/lib/spices/catalogue";

/** Homepage card. Quality and price come only from the variant the admin selected for this product. */
export function FeaturedProductCard({ spice }: { spice: PublicSpice }) {
  const variant = spice.featuredVariant;
  if (!variant) return null;
  const image = spice.images[0];

  return (
    <article className="group relative h-full [perspective:1200px]">
      <div className="flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_1px_0_rgba(212,164,55,0.35),0_24px_44px_-28px_rgba(6,47,37,0.4)] ring-1 ring-gold/20 transition-[transform,box-shadow] duration-500 ease-[var(--ease-lux)] group-hover:[transform:rotateX(3deg)_translateY(-8px)] group-hover:shadow-[0_1px_0_rgba(212,164,55,0.6),0_44px_64px_-30px_rgba(6,47,37,0.55)] group-focus-within:ring-gold/60 motion-reduce:!transform-none">
        <div className="relative aspect-[4/5] overflow-hidden bg-ivory-dark">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt || spice.name}
              fill
              sizes="(min-width: 1024px) 24vw, (min-width: 640px) 46vw, 92vw"
              className="object-cover transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-105 motion-reduce:!transform-none"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package aria-hidden className="h-12 w-12 text-gold/40" strokeWidth={1.2} />
            </div>
          )}
          <p className="absolute bottom-3 left-3 rounded-full bg-forest/85 px-3.5 py-1.5 text-xs font-medium text-champagne backdrop-blur-sm">
            {variant.label} · {variant.qualityPercent}%
          </p>
        </div>

        <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
          <h3 className="text-[1.7rem] leading-tight text-forest">
            {/* The stretched link makes the whole card clickable with one tab stop. */}
            <Link href={featuredProductHref(spice)} className="after:absolute after:inset-0 focus-visible:outline-none">
              {spice.name}
            </Link>
          </h3>
          <p className="mt-2">
            <span className="font-serif text-2xl font-semibold tabular-nums text-forest">{formatPrice(variant.sellingPrice, spice.currency)}</span>
            <span className="text-sm text-muted"> per kg</span>
          </p>
          <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-gold-dark transition-colors group-hover:text-forest">
            View Product <ArrowUpRight aria-hidden className="h-4 w-4" />
          </span>
        </div>
      </div>
    </article>
  );
}

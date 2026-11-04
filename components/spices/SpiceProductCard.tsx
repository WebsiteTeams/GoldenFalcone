import Image from "next/image";
import Link from "next/link";
import { Package, ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/cart/price";
import type { PublicSpice } from "@/lib/cms";

/** Removes a rounded square from the card's bottom-right corner, leaving a notch for the cart button. */
export const notchMask = {
  WebkitMaskImage:
    "linear-gradient(#000,#000), url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 88 88'%3E%3Cpath d='M28 0H88V88H0V28A28 28 0 0 1 28 0Z'/%3E%3C/svg%3E\")",
  maskImage:
    "linear-gradient(#000,#000), url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 88 88'%3E%3Cpath d='M28 0H88V88H0V28A28 28 0 0 1 28 0Z'/%3E%3C/svg%3E\")",
  WebkitMaskSize: "100% 100%, 5.5rem 5.5rem",
  maskSize: "100% 100%, 5.5rem 5.5rem",
  WebkitMaskPosition: "0 0, 100% 100%",
  maskPosition: "0 0, 100% 100%",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskComposite: "xor",
  maskComposite: "exclude",
} as React.CSSProperties;

/** Store product card, used on the spices homepage, the listing and "related products". All values come from the product. */
export function SpiceProductCard({ spice }: { spice: PublicSpice }) {
  const image = spice.images[0];
  const href = `/spices/${spice.slug}`;
  const blurb = spice.shortDescription || spice.description;

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
            {spice.productTypeLabel ? (
              <span className="absolute left-3 top-3 rounded-full bg-gold px-3.5 py-1.5 text-xs font-semibold tracking-wide text-forest shadow-sm">
                {spice.productTypeLabel}
              </span>
            ) : null}
          </div>

          <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
            <h3 className="text-[1.65rem] leading-tight text-forest">
              {/* The stretched link makes the whole card clickable with one tab stop. */}
              <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
                {spice.name}
              </Link>
            </h3>
            {blurb ? <p className="mt-2 line-clamp-2 max-w-[85%] text-sm leading-relaxed text-muted">{blurb}</p> : null}

            <div className="mt-auto pt-5">
              {spice.startingPrice !== null ? (
                <p>
                  <span className="font-serif text-2xl font-semibold tabular-nums text-forest">{formatPrice(spice.startingPrice, spice.currency)}</span>
                  <span className="text-xs text-muted"> / kg</span>
                </p>
              ) : (
                <p className="text-sm text-muted">Price on enquiry</p>
              )}
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

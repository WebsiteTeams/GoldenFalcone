import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PublicSoftware } from "@/lib/software/types";
import { AvailabilityBadge, Chips, PriceLine, ProductVisual } from "./shared";

/** Catalogue card. The stretched title link makes the whole card one tab stop. */
export function SoftwareCard({ product }: { product: PublicSoftware }) {
  const href = `/trading-software/${product.slug}`;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-line bg-white transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease-lux)] hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-[0_28px_50px_-28px_rgba(6,47,37,0.45)] motion-reduce:!transform-none">
      <ProductVisual product={product} sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 92vw" className="aspect-[16/10]" />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow text-gold-deep">{product.categoryLabel}</p>
          {product.availability !== "available" ? <AvailabilityBadge product={product} /> : null}
        </div>
        <h3 className="mt-3 text-[1.7rem] leading-tight text-forest">
          <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{product.shortDescription}</p>
        <Chips items={product.platforms.map((p) => p.label)} className="mt-4" />
        <div className="mt-auto flex items-end justify-between gap-3 pt-6">
          <PriceLine product={product} />
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-forest transition-colors group-hover:text-gold-deep">
            Details <ArrowUpRight aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}

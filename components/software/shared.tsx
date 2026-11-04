import Image from "next/image";
import { Activity, Bitcoin, CircleDollarSign, Cpu, TrendingUp, Wrench, type LucideIcon } from "lucide-react";
import { formatPrice } from "@/lib/cart/price";
import type { PublicSoftware } from "@/lib/software/types";
import { cn } from "@/lib/utils";

export const categoryIcons: Record<string, LucideIcon> = {
  "stock-market": TrendingUp,
  forex: CircleDollarSign,
  crypto: Bitcoin,
  algorithmic: Cpu,
  "indicators-strategies": Activity,
  "custom-tools": Wrench,
};

/** Product thumbnail on a dark emerald stage. Falls back to the category icon when a product has no image. */
export function ProductVisual({ product, sizes, className, priority }: { product: PublicSoftware; sizes: string; className?: string; priority?: boolean }) {
  const Icon = categoryIcons[product.category] ?? Wrench;
  return (
    <div className={cn("relative overflow-hidden bg-gradient-to-br from-emerald via-forest to-forest-deep", className)}>
      {product.thumbnail ? (
        <Image
          src={product.thumbnail.url}
          alt={product.thumbnail.alt || `${product.name} interface`}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-[900ms] ease-[var(--ease-lux)] group-hover:scale-[1.04] motion-reduce:!transform-none"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Icon aria-hidden className="h-12 w-12 text-gold/60" strokeWidth={1.2} />
        </div>
      )}
    </div>
  );
}

export function PriceLine({ product, size = "md" }: { product: PublicSoftware; size?: "md" | "lg" }) {
  const big = size === "lg";
  if (product.startingPrice === null) {
    return <p className={cn("text-muted", big ? "text-base" : "text-sm")}>{product.availability === "unavailable" ? "Currently unavailable" : "Price on request"}</p>;
  }
  return (
    <p>
      {product.licences.length > 1 ? <span className="mr-1.5 text-xs uppercase tracking-wider text-muted">From</span> : null}
      <span className={cn("font-serif font-semibold tabular-nums text-forest", big ? "text-4xl" : "text-2xl")}>{formatPrice(product.startingPrice, product.currency)}</span>
    </p>
  );
}

const availabilityTone: Record<string, string> = {
  available: "bg-emerald/10 text-emerald ring-emerald/25",
  limited: "bg-amber-50 text-amber-800 ring-amber-700/20",
  "on-request": "bg-gold/15 text-gold-deep ring-gold/30",
  unavailable: "bg-ink/5 text-muted ring-ink/10",
};

export function AvailabilityBadge({ product, className }: { product: PublicSoftware; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ring-1 ring-inset", availabilityTone[product.availability] ?? availabilityTone.available, className)}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {product.availabilityLabel}
    </span>
  );
}

export function Chips({ items, max = 3, className }: { items: string[]; max?: number; className?: string }) {
  if (!items.length) return null;
  const shown = items.slice(0, max);
  const rest = items.length - shown.length;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {shown.map((item) => (
        <li key={item} className="rounded-full border border-line bg-ivory px-2.5 py-1 text-[0.7rem] font-medium text-ink/80">
          {item}
        </li>
      ))}
      {rest > 0 ? <li className="rounded-full px-1.5 py-1 text-[0.7rem] text-muted">+{rest}</li> : null}
    </ul>
  );
}

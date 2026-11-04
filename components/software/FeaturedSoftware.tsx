import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { RevealUp } from "@/components/animations";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { PublicSoftware } from "@/lib/software/types";
import { cn } from "@/lib/utils";
import { AvailabilityBadge, Chips, PriceLine, ProductVisual } from "./shared";

/** Editorial showcase of products the admin has marked as featured. Renders nothing when none are. */
export function FeaturedSoftware({ products }: { products: PublicSoftware[] }) {
  if (!products.length) return null;
  return (
    <section aria-label="Featured software" className="bg-forest py-24 text-ivory sm:py-32">
      <div className="container-lux">
        <SectionHeading
          tone="light"
          eyebrow="Featured Software"
          title={["Featured Trading", "Solutions"]}
          intro="Discover selected software solutions from the Goldenfalcone trading technology collection."
        />
        <div className="mt-16 space-y-10 sm:space-y-14">
          {products.slice(0, 4).map((p, i) => (
            <RevealUp key={p.id}>
              <article className="group relative grid overflow-hidden rounded-[1.75rem] border border-gold/20 bg-gradient-to-br from-emerald/50 to-forest-deep transition-colors duration-500 hover:border-gold/50 lg:grid-cols-12">
                <ProductVisual
                  product={p}
                  sizes="(min-width: 1024px) 50vw, 92vw"
                  className={cn("aspect-[16/10] lg:col-span-6 lg:aspect-auto lg:min-h-[22rem]", i % 2 === 1 && "lg:order-2")}
                />
                <div className="flex flex-col p-7 sm:p-10 lg:col-span-6">
                  <div className="flex items-center justify-between gap-4">
                    <p className="eyebrow text-gold">
                      <span className="mr-3 font-serif text-lg tracking-normal text-champagne/60">0{i + 1}</span>
                      {p.categoryLabel}
                    </p>
                    <AvailabilityBadge product={p} className="bg-white/10 text-champagne ring-champagne/25" />
                  </div>
                  <h3 className="mt-5 text-3xl leading-tight sm:text-4xl">
                    <Link href={`/trading-software/${p.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
                      {p.name}
                    </Link>
                  </h3>
                  <p className="mt-4 line-clamp-3 leading-relaxed text-ivory/70">{p.shortDescription}</p>
                  {p.features.length ? (
                    <ul className="mt-6 space-y-2.5">
                      {p.features.slice(0, 3).map((f) => (
                        <li key={f} className="flex gap-3 text-sm text-ivory/85">
                          <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={2} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <dl className="mt-6 grid grid-cols-2 gap-5 border-t border-white/10 pt-6 text-sm">
                    <div>
                      <dt className="text-[0.65rem] uppercase tracking-[0.18em] text-champagne/60">Platform</dt>
                      <dd className="mt-2">{p.platforms.length ? <Chips items={p.platforms.map((x) => x.label)} max={2} /> : <span className="text-ivory/50">Not specified</span>}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.65rem] uppercase tracking-[0.18em] text-champagne/60">Licence</dt>
                      <dd className="mt-2 text-ivory/85">{p.licences.length ? [...new Set(p.licences.map((l) => l.typeLabel))].join(", ") : "On request"}</dd>
                    </div>
                  </dl>
                  <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-8">
                    <div className="[&_*]:!text-ivory [&_span.text-xs]:!text-champagne/60">
                      <PriceLine product={p} />
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-forest transition-colors duration-300 group-hover:bg-champagne">
                      View Details <ArrowUpRight aria-hidden className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </article>
            </RevealUp>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Wrench } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import { useCatalogue } from "./CatalogueProvider";
import { categoryIcons } from "./shared";

/**
 * Category navigation built only from categories that have published products, with counts taken from the database.
 * Choosing one filters the catalogue below and scrolls to it.
 */
export function CategoryNav() {
  const { facets, filters, setFilters } = useCatalogue();
  const reduce = useReducedMotion();
  const categories = facets?.categories ?? [];
  if (!categories.length) return null;

  const choose = (value: string) => {
    setFilters({ category: filters.category === value ? undefined : (value as typeof filters.category) });
    document.getElementById("catalogue")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <section aria-label="Software categories" className="surface-white fade-from-forest relative py-28 sm:py-32">
      <div className="container-lux">
        <SectionHeading eyebrow="Software Categories" title={["Find software for", "the way you trade."]} intro="Browse by the kind of market or workflow a product is built for." />
        <ul className="mt-14 grid gap-px overflow-hidden rounded-[1.5rem] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => {
            const Icon = categoryIcons[c.value] ?? Wrench;
            const active = filters.category === c.value;
            return (
              <motion.li
                key={c.value}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white"
              >
                <button
                  type="button"
                  onClick={() => choose(c.value)}
                  aria-pressed={active}
                  className={cn(
                    "group flex h-full w-full flex-col items-start gap-5 p-8 text-left transition-colors duration-500 hover:bg-forest",
                    active && "bg-forest",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-12 w-12 items-center justify-center rounded-full border transition-colors duration-500 group-hover:border-gold group-hover:bg-gold group-hover:text-forest",
                      active ? "border-gold bg-gold text-forest" : "border-gold/40 bg-forest text-gold",
                    )}
                  >
                    <Icon aria-hidden className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <span>
                    <span className={cn("block font-serif text-2xl transition-colors duration-500 group-hover:text-ivory", active ? "text-ivory" : "text-forest")}>{c.label}</span>
                    <span className={cn("mt-2 block text-sm leading-relaxed transition-colors duration-500 group-hover:text-ivory/70", active ? "text-ivory/70" : "text-muted")}>{c.description}</span>
                  </span>
                  <span className={cn("mt-auto inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors duration-500 group-hover:text-gold", active ? "text-gold" : "text-gold-deep")}>
                    {c.count} {c.count === 1 ? "product" : "products"}
                    <ArrowUpRight aria-hidden className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

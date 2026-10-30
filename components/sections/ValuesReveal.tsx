"use client";

import { motion } from "framer-motion";
import { easeLux } from "@/components/animations/motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { brandValues, type BrandValue } from "@/lib/content";

type ValuesRevealProps = { eyebrow?: string; title?: string[]; intro?: string; values?: BrandValue[] };

/** Brand values revealed one by one as each row scrolls into view. */
export function ValuesReveal({
  eyebrow = "Our Values",
  title = ["Principles that guide", "every division."],
  intro = "The values at the heart of the Goldenfalcone emblem — and at the heart of how we work.",
  values = brandValues,
}: ValuesRevealProps) {
  return (
    <section className="grain relative overflow-hidden bg-forest py-24 text-ivory sm:py-32">
      <div aria-hidden className="absolute -left-40 top-1/3 h-[30rem] w-[30rem] rounded-full bg-emerald/60 blur-[120px]" />
      <div className="container-lux relative grid gap-16 lg:grid-cols-12">
        <div className="lg:sticky lg:top-32 lg:col-span-5 lg:self-start">
          <SectionHeading tone="light" eyebrow={eyebrow} title={title} intro={intro} />
        </div>
        <ol className="lg:col-span-6 lg:col-start-7">
          {values.map((value, i) => (
            <motion.li
              key={value.name}
              data-reveal
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.75, ease: easeLux }}
              className="group relative border-t border-ivory/15 py-9 last:border-b"
            >
              <motion.span
                aria-hidden
                className="absolute left-0 top-[-1px] h-px w-full origin-left bg-gold"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 1.1, ease: easeLux, delay: 0.15 }}
              />
              <div className="flex items-baseline gap-6 sm:gap-10">
                <span className="w-8 shrink-0 font-sans text-xs font-semibold tracking-[0.2em] text-gold">0{i + 1}</span>
                <div>
                  <h3 className="text-4xl text-ivory transition-colors duration-300 group-hover:text-champagne sm:text-5xl">{value.name}</h3>
                  <p className="mt-3 max-w-md leading-relaxed text-ivory/65">{value.text}</p>
                </div>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

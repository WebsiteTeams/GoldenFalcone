"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { easeLux, fadeUp } from "@/components/animations/motion";
import type { Division } from "@/lib/content";

/**
 * Division card. Hover (pointer devices) reveals the highlight list; on touch screens the list is always visible,
 * so nothing depends on hover. The whole card is a single link target.
 */
export function DivisionCard({ division, priority }: { division: Division; priority?: boolean }) {
  return (
    <motion.article data-reveal variants={fadeUp} className="group relative">
      <Link
        href={division.href}
        className="relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-line bg-white transition-[box-shadow,border-color,transform] duration-500 ease-[var(--ease-lux)] hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_40px_80px_-40px_rgba(6,47,37,0.45)]"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={division.image}
            alt={division.imageAlt}
            fill
            priority={priority}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-lux)] group-hover:scale-[1.05]"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-forest/70 via-forest/10 to-transparent" />
          <span className="absolute left-6 top-6 rounded-full border border-ivory/30 bg-forest/40 px-3 py-1 font-sans text-[0.7rem] font-semibold tracking-[0.2em] text-champagne backdrop-blur-sm">
            {division.number}
          </span>

          {/* Highlights: slide up on hover for pointer devices, always shown on touch */}
          <ul className="absolute inset-x-6 bottom-5 flex flex-wrap gap-2 transition-all duration-500 ease-[var(--ease-lux)] [@media(hover:hover)]:translate-y-3 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-visible:translate-y-0 [@media(hover:hover)]:group-focus-visible:opacity-100">
            {division.highlights.slice(0, 4).map((h) => (
              <li key={h} className="rounded-full bg-ivory/90 px-3 py-1 text-[0.72rem] font-medium text-forest">
                {h}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex flex-1 flex-col p-7 sm:p-9">
          <span
            aria-hidden
            className="absolute left-7 right-7 top-0 h-px origin-left scale-x-0 bg-gold transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-x-100 sm:left-9 sm:right-9"
          />
          <h3 className="text-[1.9rem] leading-tight text-forest">{division.title}</h3>
          <p className="mt-3 flex-1 leading-relaxed text-muted">{division.description}</p>
          <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-forest">
            <span className="link-underline">{division.cta}</span>
            <motion.span
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-forest/15 transition-colors duration-300 group-hover:border-gold group-hover:bg-gold"
              transition={{ duration: 0.25, ease: easeLux }}
            >
              <ArrowUpRight aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </motion.span>
          </span>
        </div>
      </Link>
    </motion.article>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { RevealUp } from "@/components/animations";
import { easeLux } from "@/components/animations/motion";
import { images } from "@/lib/content";
import { cn } from "@/lib/utils";

const businessDivisions = [
  {
    key: "spices",
    number: "01",
    title: "Imports & Exports",
    kicker: "Spice trade",
    description: "Discover authentic Indian spices and our dedicated spices shopping experience.",
    href: "/spices",
    cta: "Explore Imports & Exports",
    image: images.spicesMarket,
    imageAlt: "Bowls of assorted whole Indian spices at a market",
    highlights: ["Green Cardamom", "Black Pepper", "Cinnamon", "Cloves"],
  },
  {
    key: "mentorship",
    number: "02",
    title: "Trading Software",
    kicker: "Trading technology",
    description: "Explore professional trading software for market analysis, strategies and automated workflows.",
    href: "/trading-software",
    cta: "Explore Software",
    image: images.tradingCandles,
    imageAlt: "Candlestick price chart on a dark trading screen",
    highlights: ["Market Analysis", "Trading Strategies", "Automated Workflows"],
  },
  {
    key: "staffing",
    number: "03",
    title: "Salon Staffing",
    kicker: "Beauty recruitment",
    description: "Connecting salon businesses with skilled beauty professionals through dedicated staffing services.",
    href: "/salon-staffing",
    cta: "Explore Staffing",
    image: images.salonChairs,
    imageAlt: "Bright modern salon interior with styling chairs and mirrors",
    highlights: ["Hair Stylists", "Beauticians", "Makeup Artists", "Nail Technicians"],
  },
];

type Division = (typeof businessDivisions)[number];

const glass = "border border-white/20 bg-white/[0.08] backdrop-blur-2xl";
const count = businessDivisions.length;

/** Shortest signed distance from the active card, so the carousel wraps around. */
const offsetOf = (i: number, active: number) => {
  let d = i - active;
  if (d > count / 2) d -= count;
  if (d < -count / 2) d += count;
  return d;
};

function Card({ division, offset, onSelect }: { division: Division; offset: number; onSelect: () => void }) {
  const center = offset === 0;
  return (
    <motion.article
      initial={false}
      animate={{
        x: `${offset * 74}%`,
        scale: center ? 1 : 0.8,
        rotateY: offset * -22,
        opacity: center ? 1 : 0.7,
      }}
      transition={{ duration: 0.7, ease: easeLux }}
      style={{ zIndex: center ? 10 : 5, transformStyle: "preserve-3d" }}
      className={cn(
        "absolute inset-y-0 left-1/2 ml-[calc(var(--cw)/-2)] w-[var(--cw)] overflow-hidden rounded-[2rem] border bg-black shadow-[0_50px_90px_-30px_rgba(0,0,0,0.9)]",
        center ? "border-white/30 shadow-[0_50px_100px_-30px_rgba(212,164,55,0.35)]" : "border-white/15",
      )}
    >
      <Image src={division.image} alt={center ? division.imageAlt : ""} fill sizes="(min-width: 640px) 30vw, 80vw" className="object-cover" />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgba(3,6,5,0.9)_0%,rgba(3,6,5,0.15)_55%,rgba(3,6,5,0.2)_100%)]" />

      {center ? (
        <>
          <span className={`absolute left-1/2 top-14 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-ivory ${glass}`}>{division.kicker}</span>
          <div className="absolute inset-x-3 bottom-3 rounded-[1.5rem] border border-white/15 bg-black/40 p-4 backdrop-blur-xl sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-[1.5rem] leading-tight text-ivory">{division.title}</h3>
              {/* <span className="pt-2 text-xs tabular-nums text-ivory/60">
                {division.number} / {String(count).padStart(2, "0")}
              </span> */}
            </div>
            {/* <p className="mt-2 line-clamp-2 text-[0.8rem] leading-relaxed text-ivory/75">{division.description}</p> */}
            {/* <ul className="mt-3 flex flex-wrap gap-1.5">
              {division.highlights.slice(0, 3).map((h) => (
                <li key={h} className="rounded-full border border-gold/30 bg-black/30 px-3 py-1 text-[0.62rem] uppercase tracking-[0.14em] text-champagne">
                  {h}
                </li>
              ))}
            </ul> */}
            <Link
              href={division.href}
              className="group/cta mt-4 inline-flex w-full items-center justify-between rounded-full bg-gold-foil py-2 pl-6 pr-2 text-sm font-semibold text-black shadow-[0_14px_30px_-10px_rgba(212,164,55,0.6)] transition-all hover:brightness-110"
            >
              {division.cta}
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-gold transition-transform group-hover/cta:translate-x-0.5">
                <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </span>
            </Link>
          </div>
        </>
      ) : (
        <button type="button" onClick={onSelect} aria-label={`Show ${division.title}`} className="absolute inset-0 flex flex-col justify-end p-6 text-left">
          <span className="font-serif text-xl text-ivory">{division.title}</span>
          <span className="mt-1 text-[0.65rem] uppercase tracking-[0.16em] text-ivory/60">{division.kicker}</span>
        </button>
      )}
    </motion.article>
  );
}

export function Ventures() {
  const [active, setActive] = useState(0);
  const go = (d: number) => setActive((a) => (a + d + count) % count);
  const current = businessDivisions[active];

  return (
    <section id="businesses" aria-label="Our business ventures" className="surface-black fade-from-white fade-to-white grain relative flex min-h-[130svh] flex-col justify-center overflow-hidden py-14 sm:py-16">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      <div className="container-lux relative">
        <header className="mx-auto mb-6 max-w-2xl text-center sm:mb-8">
          <RevealUp distance={14}>
            <p className="eyebrow inline-flex items-center gap-4 text-gold">
              <span aria-hidden className="h-px w-12 bg-gradient-to-r from-transparent to-gold" />
              <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-gold" />
              Our Business Ventures
              <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-gold" />
              <span aria-hidden className="h-px w-12 bg-gradient-to-l from-transparent to-gold" />
            </p>
          </RevealUp>
          <RevealUp delay={0.1}>
            <h2 className="mt-4 text-[1.9rem] leading-[1.06] text-ivory sm:text-4xl xl:text-[2.8rem]">
              Three Dimensions.
              <span className="block italic gold-text"> One Vision.</span>
            </h2>
          </RevealUp>
          <RevealUp delay={0.15}>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ivory/65 [@media(max-height:820px)]:hidden">
              Discover the diverse business ventures of Goldenfalcone, each built around a shared commitment to purpose, quality, and growth.
            </p>
          </RevealUp>
        </header>

        <RevealUp delay={0.1}>
          <div
            role="group"
            aria-roledescription="carousel"
            aria-label="Business ventures"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") go(-1);
              if (e.key === "ArrowRight") go(1);
            }}
            style={{ "--h": "clamp(19rem, calc(100svh - 23rem), 34rem)", "--cw": "min(80vw, 30vw, calc(var(--h) / 1.25))" } as React.CSSProperties}
            className="relative mx-auto h-[var(--h)] max-w-5xl [perspective:1400px] focus-visible:outline-none"
          >
            <div aria-hidden className="absolute inset-x-[10%] bottom-0 top-[28%] rounded-[3rem] bg-[radial-gradient(ellipse_at_center,rgba(212,164,55,0.14),transparent_70%)]" />
            {businessDivisions.map((d, i) => (
              <Card key={d.key} division={d} offset={offsetOf(i, active)} onSelect={() => setActive(i)} />
            ))}
          </div>

          {/* glass control bar */}
          <div className={`mx-auto mt-5 flex max-w-xs items-center gap-3 rounded-full p-2 ${glass}`}>
            <button type="button" onClick={() => go(-1)} aria-label="Previous venture" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 text-ivory transition-colors hover:border-gold hover:text-gold">
              <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 3 5 8l5 5" />
              </svg>
            </button>
            <Image src={current.image} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-full border border-gold/40 object-cover" />
            <div className="min-w-0 flex-1" aria-live="polite">
              <p className="truncate text-sm font-medium text-ivory">{current.title}</p>
              <p className="truncate text-xs text-ivory/60">{current.kicker}</p>
            </div>
            <button type="button" onClick={() => go(1)} aria-label="Next venture" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 text-ivory transition-colors hover:border-gold hover:text-gold">
              <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 3 5 5-5 5" />
              </svg>
            </button>
          </div>
          <div className="mt-3 flex justify-center gap-2" aria-hidden>
            {businessDivisions.map((d, i) => (
              <span key={d.key} className={cn("h-1.5 rounded-full transition-all duration-500", i === active ? "w-6 bg-gold" : "w-1.5 bg-white/30")} />
            ))}
          </div>
        </RevealUp>
      </div>
    </section>
  );
}

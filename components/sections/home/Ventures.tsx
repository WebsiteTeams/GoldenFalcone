"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { RevealUp } from "@/components/animations";
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
    title: "Trading Mentorship",
    kicker: "Market education",
    description: "Build your understanding of financial markets through structured trading education and mentorship.",
    href: "/trading-mentorship",
    cta: "Explore Mentorship",
    image: images.tradingCandles,
    imageAlt: "Candlestick price chart on a dark trading screen",
    highlights: ["Market Basics", "Risk Education", "One-to-One Mentorship"],
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

function Panel({ division, active, onActivate }: { division: Division; active: boolean; onActivate: () => void }) {
  return (
    <article
      onMouseEnter={onActivate}
      onFocusCapture={onActivate}
      className={cn(
        "group relative isolate min-h-[27rem] overflow-hidden rounded-2xl border bg-black transition-[flex,border-color,box-shadow] duration-[800ms] ease-[var(--ease-lux)] lg:min-h-0 lg:rounded-3xl",
        active ? "border-gold/50 shadow-[0_40px_90px_-30px_rgba(212,164,55,0.35)] lg:flex-[3.4]" : "border-white/10 lg:flex-1",
      )}
    >
      <Image
        src={division.image}
        alt={division.imageAlt}
        fill
        sizes="(min-width: 1024px) 60vw, 100vw"
        className={cn("-z-20 object-cover transition-all duration-[1200ms] ease-[var(--ease-lux)]", active ? "scale-100 opacity-70 saturate-100" : "scale-110 opacity-40 saturate-50")}
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(2,12,9,0.95)_0%,rgba(2,12,9,0.55)_45%,rgba(2,12,9,0.2)_100%)]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(6,47,37,0.55),transparent_60%)]" />

      {/* numeral, always visible */}
      <span className={cn("absolute left-6 top-5 font-serif text-4xl leading-none transition-colors duration-500 sm:text-5xl", active ? "text-gold" : "text-ivory/50")}>{division.number}</span>

      {/* collapsed label (desktop) */}
      <span
        aria-hidden
        className={cn(
          "absolute bottom-8 left-1/2 hidden font-serif text-2xl tracking-wide text-ivory transition-opacity duration-500 [writing-mode:vertical-rl] lg:block",
          active ? "opacity-0" : "opacity-100 delay-300",
        )}
        style={{ transform: "translateX(-50%) rotate(180deg)" }}
      >
        {division.title}
      </span>

      {/* expanded content */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex flex-col p-6 transition-all duration-700 sm:p-9 lg:p-10",
          active ? "translate-y-0 opacity-100 delay-300" : "lg:pointer-events-none lg:translate-y-4 lg:opacity-0",
        )}
      >
        <p className="eyebrow flex items-center gap-3 text-gold">
          <span aria-hidden className="h-px w-8 bg-gold" />
          {division.kicker}
        </p>
        <h3 className="mt-4 text-[2rem] leading-[1.05] text-ivory sm:text-4xl xl:text-[2.8rem]">{division.title}</h3>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-ivory/75 sm:text-base">{division.description}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {division.highlights.map((h) => (
            <li key={h} className="rounded-full border border-white/20 bg-white/[0.06] px-3.5 py-1.5 text-[0.7rem] uppercase tracking-[0.14em] text-ivory/85 backdrop-blur-md">
              {h}
            </li>
          ))}
        </ul>
        <Link
          href={division.href}
          className="group/cta mt-7 inline-flex w-fit items-center gap-3 rounded-full bg-gold py-2.5 pl-6 pr-2.5 text-sm font-semibold text-forest transition-colors duration-300 hover:bg-champagne"
        >
          {division.cta}
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-gold transition-transform duration-300 group-hover/cta:translate-x-0.5">
            <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </span>
        </Link>
      </div>
    </article>
  );
}

export function Ventures() {
  const [active, setActive] = useState(0);

  return (
    <section id="businesses" aria-label="Our business ventures" className="grain relative overflow-hidden bg-[#031610] py-24 sm:py-32">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(11,107,80,0.45),transparent_70%),radial-gradient(ellipse_50%_40%_at_100%_100%,rgba(212,164,55,0.1),transparent_70%)]" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      <div className="container-lux relative">
        <header className="mb-14 grid items-end gap-8 sm:mb-20 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <RevealUp distance={14}>
              <p className="eyebrow flex items-center gap-4 text-gold">
                <span aria-hidden className="h-px w-12 bg-gold" />
                Our Business Ventures
              </p>
            </RevealUp>
            <RevealUp delay={0.1}>
              <h2 className="mt-6 text-[2.8rem] leading-[1.02] text-ivory sm:text-6xl xl:text-[4.6rem]">
                Three Dimensions.
                <span className="block italic text-gold"> One Vision.</span>
              </h2>
            </RevealUp>
          </div>
          <RevealUp delay={0.15} className="lg:col-span-4 lg:col-start-9">
            <p className="border-l border-gold/50 pl-6 leading-relaxed text-ivory/65 sm:text-lg">
              Discover the diverse business ventures of Goldenfalcone, each built around a shared commitment to purpose, quality, and growth.
            </p>
          </RevealUp>
        </header>

        <RevealUp delay={0.1}>
          <div className="flex flex-col gap-4 lg:h-[34rem] lg:flex-row lg:gap-5">
            {businessDivisions.map((d, i) => (
              <Panel key={d.key} division={d} active={active === i} onActivate={() => setActive(i)} />
            ))}
          </div>
        </RevealUp>
      </div>
    </section>
  );
}

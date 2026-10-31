"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, GraduationCap, Leaf, type LucideIcon, Scissors } from "lucide-react";
import { AnimatedButton, RevealUp, TextReveal } from "@/components/animations";
import { easeLux } from "@/components/animations/motion";
import { images } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Business division data shown in the carousel.
 * Using inline data so the homepage works independently of CMS state.
 */
const businessDivisions = [
  {
    key: "spices",
    icon: Leaf,
    title: "Whole Spices",
    description: "Discover authentic Indian spices and our dedicated spices shopping experience.",
    href: "/spices",
    cta: "Explore Spices",
    image: images.spicesMarket,
    imageAlt: "Bowls of assorted whole Indian spices at a market",
  },
  {
    key: "mentorship",
    icon: GraduationCap,
    title: "Trading Mentorship",
    description: "Build your understanding of financial markets through structured trading education and mentorship.",
    href: "/trading-mentorship",
    cta: "Explore Mentorship",
    image: images.tradingCandles,
    imageAlt: "Candlestick price chart on a dark trading screen",
  },
  {
    key: "staffing",
    icon: Scissors,
    title: "Salon Staffing",
    description: "Connecting salon businesses with skilled beauty professionals through dedicated staffing services.",
    href: "/salon-staffing",
    cta: "Explore Staffing",
    image: images.salonChairs,
    imageAlt: "Bright modern salon interior with styling chairs and mirrors",
  },
];

type Division = (typeof businessDivisions)[number];

const hexagon = "M44,6.5 Q50,3 56,6.5 L89,25.5 Q95,29 95,36 L95,74 Q95,81 89,84.5 L56,103.5 Q50,107 44,103.5 L11,84.5 Q5,81 5,74 L5,36 Q5,29 11,25.5 Z";

/** Tinted glass-style badge carrying the division icon. */
function HexBadge({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div aria-hidden className="absolute left-1/2 top-1/2 h-[110px] w-[100px] -translate-x-1/2 -translate-y-1/2">
      <svg viewBox="0 0 100 110" fill="none" className="absolute inset-0 h-full w-full text-ivory/45">
        <path d={hexagon} stroke="currentColor" className="fill-forest-deep/50" />
      </svg>
      <Icon className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 text-ivory" strokeWidth={1.25} />
    </div>
  );
}

/** Card – inset image with glass badge, title, description and CTA. Only the centred card can be tabbed into. */
function Card({ division, isActive }: { division: Division; isActive: boolean }) {
  return (
    <article
      inert={!isActive}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-3xl border bg-forest p-3 transition-[border-color,box-shadow,filter] duration-500 sm:p-4",
        isActive ? "border-ivory/25 shadow-[0_40px_70px_-25px_rgba(0,0,0,0.85)]" : "border-ivory/10 brightness-75",
      )}
    >
      <div className="relative h-52 shrink-0 overflow-hidden rounded-2xl border border-ivory/20 sm:h-60">
        <Image
          src={division.image}
          alt={division.imageAlt}
          fill
          sizes="(min-width: 1024px) 25rem, (min-width: 640px) 23rem, 80vw"
          className="object-cover transition-transform duration-700 ease-[var(--ease-lux)] motion-safe:group-hover:scale-[1.04]"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-forest-deep/90 via-forest-deep/35 to-forest-deep/10" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.28)_0%,transparent_28%,rgba(255,255,255,0.14)_36%,transparent_52%)]" />
        <HexBadge icon={division.icon} />
      </div>
      <div className="flex flex-1 flex-col items-start px-3 pb-3 pt-6 sm:px-4 sm:pb-4 sm:pt-7">
        <h3 className="text-[1.85rem] leading-[1.1] text-ivory sm:text-[2.2rem]">{division.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-ivory/75 sm:text-[0.95rem]">{division.description}</p>
        <div className="mt-auto pt-5">
          <AnimatedButton href={division.href} variant="outline-light" arrow={false}>
            {division.cta}
          </AnimatedButton>
        </div>
      </div>
    </article>
  );
}

/**
 * CardCarousel – the active card sits raised in the centre with its neighbours behind it.
 * The carousel loops; with more than three cards the rest wait out of view.
 */
function CardCarousel({ divisions }: { divisions: Division[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const count = divisions.length;

  const prev = () => setActiveIndex((i) => (i - 1 + count) % count);
  const next = () => setActiveIndex((i) => (i + 1) % count);
  const arrowClass =
    "inline-flex h-11 w-11 items-center justify-center rounded-full border border-champagne/40 text-ivory transition-colors duration-300 hover:border-gold hover:bg-gold hover:text-forest";

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="Our business ventures"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
      }}
    >
      <motion.div
        className="relative h-[32rem] touch-pan-y sm:h-[33rem]"
        onPanEnd={(_, info) => {
          if (Math.abs(info.offset.x) < 60 || Math.abs(info.offset.x) < Math.abs(info.offset.y)) return;
          if (info.offset.x < 0) next();
          else prev();
        }}
      >
        {divisions.map((division, i) => {
          // -1 left, 0 centre, 1 right, anything further is out of view.
          const offset = ((i - activeIndex + count + 1) % count) - 1;
          const isActive = offset === 0;
          const isSide = Math.abs(offset) === 1;

          return (
            <motion.div
              key={division.key}
              initial={false}
              animate={{
                x: `${-50 + offset * 78}%`,
                scale: isActive ? 1 : 0.86,
                opacity: isActive || isSide ? 1 : 0,
              }}
              transition={{ duration: 0.7, ease: easeLux }}
              style={{ zIndex: isActive ? 3 : isSide ? 2 : 1 }}
              className={cn("absolute left-1/2 top-0 h-full w-[min(80vw,21rem)] sm:w-[23rem] lg:w-[25rem]", !isActive && !isSide && "pointer-events-none")}
            >
              <Card division={division} isActive={isActive} />
              {isSide ? (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden
                  onClick={() => setActiveIndex(i)}
                  className="absolute inset-0 cursor-pointer rounded-3xl"
                />
              ) : null}
            </motion.div>
          );
        })}
      </motion.div>

      <div className="mt-8 flex items-center justify-center gap-4">
        <button type="button" onClick={prev} aria-label="Previous venture" className={arrowClass}>
          <ArrowLeft aria-hidden className="h-4 w-4" />
        </button>
        <div className="flex items-center">
          {divisions.map((division, i) => (
            <button
              key={division.key}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Show ${division.title}`}
              aria-current={i === activeIndex ? "true" : undefined}
              className="flex h-11 w-9 items-center justify-center"
            >
              <span aria-hidden className={cn("h-1 rounded-full transition-all duration-500", i === activeIndex ? "w-7 bg-gold" : "w-3 bg-ivory/35")} />
            </button>
          ))}
        </div>
        <button type="button" onClick={next} aria-label="Next venture" className={arrowClass}>
          <ArrowRight aria-hidden className="h-4 w-4" />
        </button>
      </div>

      <p aria-live="polite" className="sr-only">
        {`Showing ${activeIndex + 1} of ${count}: ${divisions[activeIndex].title}`}
      </p>
    </div>
  );
}

/** Header section – eyebrow, heading, description */
function VenturesHeader() {
  return (
    <header className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
      <RevealUp distance={14}>
        <p className="eyebrow flex items-center justify-center gap-3 text-champagne">
          <span aria-hidden className="h-px w-8 bg-current" />
          Our Business Ventures
          <span aria-hidden className="h-px w-8 bg-current" />
        </p>
      </RevealUp>
      <TextReveal
        lines={["Four Dimensions.", "One Vision."]}
        accentIndex={1}
        className="mt-6 text-[2.75rem] leading-[1.05] text-ivory xs:text-5xl sm:text-6xl lg:text-7xl"
      />
      <RevealUp delay={0.15}>
        <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-ivory/75 sm:text-lg">
          Discover the diverse business ventures of Goldenfalcone, each built around a shared commitment to purpose, quality, and growth.
        </p>
      </RevealUp>
    </header>
  );
}

/** Main Ventures section – combines header + carousel */
export function Ventures() {
  return (
    <section id="businesses" aria-label="Our business ventures" className="grain relative scroll-mt-20 overflow-hidden bg-forest-deep py-20 text-ivory sm:py-28">
      <div className="container-lux relative">
        <VenturesHeader />
        <RevealUp delay={0.1}>
          <CardCarousel divisions={businessDivisions} />
        </RevealUp>
      </div>
    </section>
  );
}

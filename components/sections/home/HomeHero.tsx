"use client";

import { useRef, useState } from "react";
import type { PointerEvent, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatedButton, TextReveal } from "@/components/animations";
import { easeLux } from "@/components/animations/motion";
import { images } from "@/lib/content";
import { HERO_OVERLAY } from "./HeroBackdrop";
import type { StationKey } from "./hero3d/Stations";

type HomeHeroProps = {
  title: string[];
  description: string;
  primaryCta: string;
  secondaryCta: string;
  logo: string;
  ventures: { key: string; number: string; title: string; href: string }[];
};

const isStation = (key: string): key is StationKey => key === "spices" || key === "mentorship" || key === "staffing";

const icons: Record<StationKey, ReactNode> = {
  spices: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 17h22c0 5-4.5 9-11 9S5 22 5 17Z" />
      <path d="M9 13c1-3 3-4 7-4s6 1 7 4" />
      <path d="M21 5l3 6M12 6l-1 5" />
    </svg>
  ),
  mentorship: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 5v22h22" />
      <path d="M11 22v-6M11 12v-2M17 22v-9M17 10V8M23 22v-4M23 15v-3" />
      <rect x="9.5" y="12" width="3" height="4" />
      <rect x="15.5" y="10" width="3" height="3" />
      <rect x="21.5" y="15" width="3" height="3" />
    </svg>
  ),
  staffing: (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="23" r="3.5" />
      <circle cx="9" cy="9" r="3.5" />
      <path d="M11.5 11.5 26 24M11.5 20.5 26 8" />
    </svg>
  ),
};

const thumbs: Record<StationKey, string> = {
  spices: images.spicesMarket,
  mentorship: images.tradingCandles,
  staffing: images.salonChairs,
};

const taglines: Record<StationKey, string> = {
  spices: "Authentic spices, sourced with care",
  mentorship: "Professional trading software",
  staffing: "Skilled beauty professionals",
};

const pillars = [
  { name: "Integrity", note: "Honest dealings", d: "M16 4 6 8v8c0 6 4 10 10 12 6-2 10-6 10-12V8L16 4Zm-3.5 12 2.5 2.5 5-5" },
  { name: "Loyalty", note: "Lasting relationships", d: "M11 15a4 4 0 1 1 5-3.8M21 15a4 4 0 1 0-5-3.8M7 26c0-4 4-6 9-6s9 2 9 6" },
  { name: "Respect", note: "For every client", d: "M16 6c-5 0-9 4-9 9v4l-2 3h22l-2-3v-4c0-5-4-9-9-9Zm-3 20a3 3 0 0 0 6 0" },
  { name: "Strength", note: "Steady delivery", d: "M18 3 7 18h8l-2 11 12-16h-8l1-10Z" },
];

const glass = "border border-white/15 bg-white/[0.07] backdrop-blur-xl";

export function HomeHero({ title, description, primaryCta, secondaryCta, logo, ventures }: HomeHeroProps) {
  const pointer = useRef({ x: 0, y: 0 });
  const [active, setActive] = useState<StationKey | null>(null);
  const routes = useRef(Object.fromEntries(ventures.map((v) => [v.key, v.href])) as Record<StationKey, string>).current;

  const stations = ventures.filter((v) => isStation(v.key)) as (HomeHeroProps["ventures"][number] & { key: StationKey })[];
  const shown = stations.find((v) => v.key === active) ?? stations[0];
  const shownIndex = Math.max(1, stations.findIndex((v) => v.key === shown?.key) + 1);

  const track = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    pointer.current = { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 };
  };

  return (
    <section
      onPointerMove={track}
      onPointerLeave={() => (pointer.current = { x: 0, y: 0 })}
      className="grain relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-black pt-28 text-ivory lg:pt-32"
    >
      {/* backdrop: the art keeps its subjects (laptop, salon) on the right, clear of the headline */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden bg-black">
        <Image src="/bgimg1.png" alt="" fill priority sizes="100vw" className="object-cover object-[78%_50%]" />
        {/* dark forest overlay, top to bottom */}
        <div className="absolute inset-0 opacity-60" style={{ background: HERO_OVERLAY }} />
        {/* left to right: deep forest green, black, gray, transparent */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#04281f_0%,rgba(0,0,0,0.88)_30%,rgba(75,85,99,0.5)_62%,transparent_100%)]" />
      </div>

      <div className="container-lux flex flex-1 flex-col lg:justify-center lg:pb-40">
        <div className="relative z-10 lg:max-w-[32rem] xl:max-w-[36rem]">
          <motion.p
            className={`inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-[0.62rem] font-semibold uppercase leading-none tracking-[0.18em] text-gold sm:text-[0.7rem] ${glass}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeLux, delay: 0.2 }}
          >
            <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5 shrink-0" fill="currentColor">
              <path d="M8 0l1.8 5.2L15 7l-5.2 1.8L8 14l-1.8-5.2L1 7l5.2-1.8L8 0Z" />
            </svg>
            Goldenfalcone · A Diversified Business Group
          </motion.p>

          <TextReveal
            as="h1"
            immediate
            delay={0.3}
            lines={title}
            accentFrom={1}
            accentClassName="italic text-champagne"
            className="mt-6 text-[3rem] leading-[1.02] xs:text-[3.4rem] sm:text-7xl lg:text-[3.6rem] xl:text-[3.6rem] 2xl:text-[4.2rem]"
          />

          <motion.p
            className="mt-4 max-w-md text-base leading-relaxed text-ivory/75 sm:text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeLux, delay: 0.75 }}
          >
            {description}
          </motion.p>

          <motion.div
            className="mt-7 flex flex-col gap-3 xs:flex-row xs:flex-wrap xs:items-center sm:gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeLux, delay: 0.9 }}
          >
            <AnimatedButton href="#businesses">{primaryCta}</AnimatedButton>
            <Link href="/about" className="group inline-flex items-center gap-3 self-start text-sm font-medium text-ivory transition-colors hover:text-champagne xs:self-auto">
              <span className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors group-hover:border-gold ${glass}`}>
                <svg viewBox="0 0 16 16" aria-hidden className="ml-0.5 h-3.5 w-3.5" fill="currentColor">
                  <path d="M3 1.5v13l11-6.5L3 1.5Z" />
                </svg>
              </span>
              {secondaryCta}
            </Link>
          </motion.div>

          <motion.ul
            className="mt-7 hidden grid-cols-4 gap-4 sm:grid [@media(max-height:900px)]:lg:hidden"
            aria-label="What we stand for"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeLux, delay: 1.05 }}
          >
            {pillars.map((p) => (
              <li key={p.name} className="flex flex-col items-start gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-gold/5 text-gold">
                  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-5 w-5">
                    <path d={p.d} />
                  </svg>
                </span>
                <span className="text-sm font-semibold leading-tight">{p.name}</span>
                <span className="-mt-1.5 text-xs leading-snug text-ivory/60">{p.note}</span>
              </li>
            ))}
          </motion.ul>
        </div>
      </div>

      
    </section>
  );
}

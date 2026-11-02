"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { AnimatedButton, RevealUp } from "@/components/animations";
import { easeLux } from "@/components/animations/motion";
import { images } from "@/lib/content";
import { cn } from "@/lib/utils";

const businessDivisions = [
  {
    key: "spices",
    number: "01",
    title: "Imports & Exports",
    short: "Imports & Exports",
    description: "Discover authentic Indian spices and our dedicated spices shopping experience.",
    href: "/spices",
    cta: "Explore Imports & Exports",
    image: images.spicesMarket,
    imageAlt: "Bowls of assorted whole Indian spices at a market",
  },
  {
    key: "mentorship",
    number: "02",
    title: "Trading Mentorship",
    short: "Mentorship",
    description: "Build your understanding of financial markets through structured trading education and mentorship.",
    href: "/trading-mentorship",
    cta: "Explore Mentorship",
    image: images.tradingCandles,
    imageAlt: "Candlestick price chart on a dark trading screen",
  },
  {
    key: "staffing",
    number: "03",
    title: "Salon Staffing",
    short: "Staffing",
    description: "Connecting salon businesses with skilled beauty professionals through dedicated staffing services.",
    href: "/salon-staffing",
    cta: "Explore Staffing",
    image: images.salonChairs,
    imageAlt: "Bright modern salon interior with styling chairs and mirrors",
  },

];

type Division = (typeof businessDivisions)[number];

const hexClip = "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)";

const tints: Record<string, string> = {
  spices: "from-[#7a5a1c] via-[#3d3a1c] to-[#0b1f19]",
  mentorship: "from-[#1f6b55] via-[#12392f] to-[#0b1f19]",
  staffing: "from-[#6b5a3a] via-[#2e3a2f] to-[#0b1f19]",
};

const icons: Record<string, React.ReactNode> = {
  spices: (
    <>
      <path d="M5 17h22c0 5-4.5 9-11 9S5 22 5 17Z" />
      <path d="M9 13c1-3 3-4 7-4s6 1 7 4" />
      <path d="M21 5l3 6M12 6l-1 5" />
    </>
  ),
  mentorship: (
    <>
      <path d="M5 5v22h22" />
      <path d="M11 22v-6M11 12v-2M17 22v-9M17 10V8M23 22v-4M23 15v-3" />
      <rect x="9.5" y="12" width="3" height="4" />
      <rect x="15.5" y="10" width="3" height="3" />
      <rect x="21.5" y="15" width="3" height="3" />
    </>
  ),
  staffing: (
    <>
      <circle cx="9" cy="23" r="3.5" />
      <circle cx="9" cy="9" r="3.5" />
      <path d="M11.5 11.5 26 24M11.5 20.5 26 8" />
    </>
  ),
};

function Card({ division, isActive }: { division: Division; isActive: boolean }) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-9, 9]), { stiffness: 120, damping: 16 });
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 16 });
  const sheenX = useTransform(px, [-0.5, 0.5], ["-20%", "120%"]);

  const track = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce || !isActive || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <motion.article
      inert={!isActive}
      onPointerMove={track}
      onPointerLeave={reset}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={cn(
        "group relative flex h-full flex-col rounded-[1.75rem] border bg-gradient-to-b from-[#10261f] to-[#081712] p-3 transition-[border-color,box-shadow] duration-500",
        isActive
          ? "border-gold/30 shadow-[0_50px_90px_-25px_rgba(0,0,0,0.75),0_0_60px_-20px_rgba(212,164,55,0.35)]"
          : "border-white/10 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.6)]",
      )}
    >
      {/* moving glass sheen */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.75rem]" style={{ opacity: isActive ? 1 : 0 }}>
        <motion.div
          className="absolute -top-1/2 h-[200%] w-24 rotate-[18deg] bg-gradient-to-r from-transparent via-white/[0.07] to-transparent"
          style={{ left: sheenX }}
        />
      </div>

      <div
        className={cn("relative h-52 shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br sm:h-60", tints[division.key])}
        style={{ transform: "translateZ(24px)" }}
      >
        <Image
          src={division.image}
          alt={division.imageAlt}
          fill
          sizes="(min-width: 640px) 25rem, 80vw"
          className="object-cover opacity-25 mix-blend-luminosity transition-transform duration-700 group-hover:scale-105"
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-70 [background:repeating-linear-gradient(115deg,transparent_0_26px,rgba(255,255,255,0.10)_26px_44px,transparent_44px_90px)] [mask-image:linear-gradient(to_bottom,#000,transparent_85%)]"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* floating hexagon badge, lifted off the card */}
      <div
        className="absolute left-1/2 top-[7.4rem] h-28 w-28 sm:top-[8.4rem] sm:h-32 sm:w-32"
        style={{ transform: "translate(-50%, -50%) translateZ(70px)" }}
      >
        <div className="relative h-full w-full drop-shadow-[0_18px_22px_rgba(0,0,0,0.55)]">
          <div className="absolute inset-0 bg-gradient-to-br from-gold/70 via-white/30 to-gold/30" style={{ clipPath: hexClip }} />
          <div className="absolute inset-[2px] bg-gradient-to-br from-[#2b4a3f]/90 to-[#0e211b]/90 backdrop-blur-md" style={{ clipPath: hexClip }} />
          <div className="absolute inset-[2px] bg-gradient-to-br from-white/25 via-transparent to-transparent" style={{ clipPath: hexClip }} />
          <svg viewBox="0 0 32 32" fill="none" stroke="#f4e9c8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="absolute inset-0 m-auto h-11 w-11 sm:h-12 sm:w-12">
            {icons[division.key]}
          </svg>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-6" style={{ transform: "translateZ(36px)" }}>
        <h3 className="mb-3 text-[1.7rem] leading-[1.15] text-ivory sm:text-[1.9rem]">{division.title}</h3>
        <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-ivory/65">{division.description}</p>
        <div className="mt-auto">
          <Link
            href={division.href}
            className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-ivory transition-colors duration-300 hover:border-gold hover:bg-gold hover:text-forest"
          >
            Learn more
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

function CardCarousel({ divisions }: { divisions: Division[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const count = divisions.length;

  const prev = () => setActiveIndex((i) => (i - 1 + count) % count);
  const next = () => setActiveIndex((i) => (i + 1) % count);

  return (
    <section className="pt-6">
      <div className="relative overflow-hidden py-8">
        <motion.div
          className="relative h-[31rem] touch-pan-y [perspective:1600px] sm:h-[32rem] sm:touch-pan-x"
          onPanEnd={(_, info) => {
            const swipeX = Math.abs(info.offset.x);
            const swipeY = Math.abs(info.offset.y);
            if (swipeX < 40 || swipeX < swipeY) return;
            if (info.offset.x < 0) next();
            else prev();
          }}
        >
          {divisions.map((division, i) => {
            const offset = ((i - activeIndex + count + 1) % count) - 1;
            const isActive = offset === 0;

            return (
              <motion.div
                key={division.key}
                initial={false}
                animate={{
                  x: `${offset * 90}%`,
                  scale: isActive ? 1 : 0.84,
                  rotateY: offset * -26,
                  z: isActive ? 0 : -140,
                  opacity: isActive ? 1 : 0.8,
                }}
                transition={{ duration: 0.7, ease: easeLux }}
                style={{ zIndex: isActive ? 3 : 2, transformStyle: "preserve-3d" }}
                className="absolute left-1/2 top-0 -ml-[min(40vw,12rem)] h-full w-[min(80vw,24rem)] sm:-ml-[11rem] sm:w-[22rem] lg:-ml-[12.5rem] lg:w-[25rem]"
              >
                <Card division={division} isActive={isActive} />
                {!isActive && (
                  <button
                    type="button"
                    aria-label={`Show ${division.title}`}
                    className="absolute inset-0 z-10 cursor-pointer rounded-[1.75rem]"
                    onClick={() => setActiveIndex(i)}
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>
        <div className="mt-6 flex items-center justify-center gap-2" role="tablist" aria-label="Choose a venture">
          {divisions.map((d, i) => (
            <button
              key={d.key}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={d.title}
              onClick={() => setActiveIndex(i)}
              className={cn("h-2 rounded-full transition-all duration-300", i === activeIndex ? "w-8 bg-gold" : "w-2 bg-ivory/30 hover:bg-ivory/60")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function VenturesHeader() {
  return (
    <header className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
      <RevealUp distance={14}>
        <p className="eyebrow flex items-center justify-center gap-3 text-emerald">
          <span aria-hidden className="h-px w-8 bg-current" />OUR BUSINESS VENTURES
          <span aria-hidden className="h-px w-8 bg-current" />
        </p>
      </RevealUp>
      <RevealUp delay={0.1} className="mt-4 text-center">
        <h2 className="text-[2.5rem] leading-[1.1] text-ivory sm:text-4xl">
          Three Dimensions.<span className="italic text-gold"> One Vision.</span>
        </h2>
      </RevealUp>
      <RevealUp delay={0.15}>
        <p className="mt-6 mx-auto max-w-2xl leading-relaxed text-ivory/60 sm:text-lg">
          Discover the diverse business ventures of Goldenfalcone, each built around a shared commitment to purpose, quality, and growth.
        </p>
      </RevealUp>
    </header>
  )
}

export function Ventures() {
  return (
    <section
      id="businesses"
      aria-label="Our business ventures"
      className="grain relative overflow-hidden bg-emerald py-20 sm:py-28"
    >
      <div className="container-lux relative">
        <VenturesHeader />
        <CardCarousel divisions={businessDivisions} />
      </div>
    </section>
  );
}
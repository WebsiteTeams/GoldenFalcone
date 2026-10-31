"use client";

import Image from "next/image";
import Link from "next/link";
import type { PointerEvent } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { AnimatedButton, TextReveal } from "@/components/animations";
import { easeLux } from "@/components/animations/motion";

type HomeHeroProps = {
  title: string[];
  description: string;
  primaryCta: string;
  secondaryCta: string;
  logo: string;
  ventures: { key: string; number: string; title: string; href: string }[];
};

const ticks = Array.from({ length: 72 }, (_, i) => i * 5);

/** Fixed positions (percent of the hero) so server and client markup match. */
const sparks = [
  [8, 22, 0],
  [15, 68, 2.4],
  [27, 14, 4.1],
  [38, 82, 1.2],
  [49, 30, 5.2],
  [58, 11, 3.1],
  [64, 74, 0.6],
  [71, 26, 2],
  [79, 88, 4.6],
  [86, 15, 1.6],
  [92, 58, 3.6],
  [96, 34, 5.8],
];

function EmblemGeometry() {
  return (
    <svg aria-hidden viewBox="0 0 600 600" className="absolute inset-0 h-full w-full text-gold" fill="none" stroke="currentColor">
      <g className="lux-spin [transform-box:view-box] origin-center">
        {ticks.map((deg) => (
          <line key={deg} x1="300" y1="6" x2="300" y2={deg % 30 === 0 ? 22 : 13} strokeOpacity={deg % 30 === 0 ? 0.75 : 0.28} transform={`rotate(${deg} 300 300)`} />
        ))}
      </g>
      <motion.circle
        cx="300"
        cy="300"
        r="272"
        strokeOpacity=".35"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.2, ease: easeLux, delay: 0.2 }}
      />
      <motion.circle
        cx="300"
        cy="300"
        r="236"
        strokeOpacity=".14"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.2, ease: easeLux, delay: 0.5 }}
      />
      {/* One point on the ring for each business dimension */}
      {[
        [300, 28],
        [572, 300],
        [300, 572],
        [28, 300],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" fill="currentColor" stroke="none" />
      ))}
    </svg>
  );
}

export function HomeHero({ title, description, primaryCta, secondaryCta, logo, ventures }: HomeHeroProps) {
  const reduce = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-7, 7]), { stiffness: 60, damping: 18 });
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [6, -6]), { stiffness: 60, damping: 18 });

  const tilt = (e: PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    pointerX.set((e.clientX - r.left) / r.width - 0.5);
    pointerY.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section onPointerMove={tilt} className="grain relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-forest pt-28 text-ivory lg:pt-32">
      <div aria-hidden className="lux-glow absolute -right-[12%] top-[-8%] -z-10 h-[75%] w-[70%] rounded-full bg-[radial-gradient(closest-side,rgba(11,107,80,0.95),transparent)]" />
      <div aria-hidden className="absolute bottom-[-25%] left-[-15%] -z-10 h-[60%] w-[50%] rounded-full bg-[radial-gradient(closest-side,rgba(212,164,55,0.1),transparent)]" />
      {sparks.map(([left, top, delay]) => (
        <span
          key={`${left}-${top}`}
          aria-hidden
          className="lux-spark absolute -z-10 h-1 w-1 rounded-full bg-gold opacity-40"
          style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${delay}s` }}
        />
      ))}

      <div className="container-lux grid flex-1 items-center gap-10 pb-12 lg:grid-cols-12 lg:gap-6 lg:pb-14">
        <div className="lg:col-span-7">
          <motion.p
            className="eyebrow flex items-center gap-3 text-[0.62rem] leading-relaxed text-gold sm:text-[0.7rem]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeLux, delay: 0.2 }}
          >
            <motion.span
              aria-hidden
              className="hidden h-px w-10 origin-left bg-gold sm:block"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, ease: easeLux, delay: 0.3 }}
            />
            Goldenfalcone · A Diversified Business Group
          </motion.p>

          <TextReveal
            as="h1"
            immediate
            delay={0.3}
            lines={title}
            accentIndex={title.length - 1}
            accentClassName="italic text-champagne"
            className="mt-6 text-[3.15rem] leading-[1] xs:text-[3.6rem] sm:text-7xl xl:text-[6.1rem]"
          />

          <motion.p
            className="mt-7 max-w-xl text-base leading-relaxed text-ivory/75 sm:text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeLux, delay: 0.75 }}
          >
            {description}
          </motion.p>

          <motion.div
            className="mt-9 flex flex-col gap-3 xs:flex-row xs:flex-wrap sm:gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeLux, delay: 0.9 }}
          >
            <AnimatedButton href="#businesses">{primaryCta}</AnimatedButton>
            <AnimatedButton href="/about" variant="outline-light" arrow={false}>
              {secondaryCta}
            </AnimatedButton>
          </motion.div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[21rem] [perspective:1400px] sm:max-w-md lg:col-span-5 lg:max-w-none">
          <EmblemGeometry />
          <motion.div
            className="absolute inset-[11%] [transform-style:preserve-3d]"
            style={reduce ? undefined : { rotateX, rotateY }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: easeLux, delay: 0.1 }}
          >
            <div aria-hidden className="absolute inset-[6%] rounded-full bg-gold/20 blur-3xl" />
            <Image
              src={logo}
              alt="Goldenfalcone emblem: a golden eagle encircling a tree"
              fill
              priority
              sizes="(min-width: 1024px) 34vw, 70vw"
              className="object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.45)]"
            />
          </motion.div>
        </div>
      </div>

      <nav aria-label="Our businesses" className="border-t border-gold/20">
        <ul className="container-lux grid grid-cols-2 gap-x-4 lg:grid-cols-4 lg:gap-x-6">
          {ventures.map((v) => (
            <li key={v.key}>
              <Link
                href={v.href}
                className="group flex h-full items-baseline gap-3 py-4 text-sm leading-snug text-ivory/85 transition-colors hover:text-champagne sm:py-5 sm:text-[0.95rem]"
              >
                <span className="eyebrow text-gold">{v.number}</span>
                <span className="link-underline">{v.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}

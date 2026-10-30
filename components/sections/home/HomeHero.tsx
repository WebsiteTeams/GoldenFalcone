"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { AnimatedButton, TextReveal } from "@/components/animations";
import { easeLux } from "@/components/animations/motion";

type HomeHeroProps = {
  eyebrow: string;
  title: string[];
  description: string;
  primaryCta: string;
  secondaryCta: string;
  logo: string;
};

export function HomeHero({ eyebrow, title, description, primaryCta, secondaryCta, logo }: HomeHeroProps) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const emblemY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const emblemScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const ringRotate = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      className="grain relative isolate flex min-h-[100svh] items-center overflow-hidden bg-forest pb-20 pt-32 text-ivory"
    >
      {/* Soft emerald light and fine gold lines */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_40%,rgba(6,75,56,0.9),transparent_60%)]" />
      <div aria-hidden className="absolute inset-0 -z-10">
        {[18, 50, 82].map((left, i) => (
          <motion.span
            key={left}
            className="absolute top-0 h-full w-px origin-top bg-gradient-to-b from-transparent via-gold/20 to-transparent"
            style={{ left: `${left}%` }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1.8, ease: easeLux, delay: 0.2 + i * 0.15 }}
          />
        ))}
        <motion.span
          className="absolute left-0 right-0 top-[62%] h-px origin-left bg-gradient-to-r from-transparent via-gold/25 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 2, ease: easeLux, delay: 0.5 }}
        />
      </div>

      <div className="container-lux grid items-center gap-14 lg:grid-cols-12">
        <motion.div className="lg:col-span-7" style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}>
          <motion.p
            className="eyebrow text-[0.62rem] text-gold sm:text-[0.7rem]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeLux, delay: 0.3 }}
          >
            {eyebrow}
          </motion.p>

          <TextReveal
            as="h1"
            immediate
            delay={0.45}
            lines={title}
            className="mt-7 text-[3.1rem] leading-[0.98] xs:text-6xl sm:text-7xl xl:text-[5.6rem]"
            accentIndex={title.length - 1}
          />

          <motion.p
            className="mt-8 max-w-xl text-base leading-relaxed text-ivory/70 sm:text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeLux, delay: 0.95 }}
          >
            {description}
          </motion.p>

          <motion.div
            className="mt-11 flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeLux, delay: 1.1 }}
          >
            <AnimatedButton href="#businesses">{primaryCta}</AnimatedButton>
            <AnimatedButton href="/contact" variant="outline-light" arrow={false}>
              {secondaryCta}
            </AnimatedButton>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative mx-auto aspect-square w-full max-w-[19rem] sm:max-w-sm lg:col-span-5 lg:max-w-none"
          style={reduce ? undefined : { y: emblemY, scale: emblemScale }}
        >
          {/* Rotating ring is decorative and pauses for reduced motion */}
          <motion.div
            aria-hidden
            className="absolute inset-0 rounded-full border border-gold/25"
            style={reduce ? undefined : { rotate: ringRotate }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: easeLux, delay: 0.2 }}
          >
            {["left-1/2 top-0", "right-0 top-1/2", "bottom-0 left-1/2", "left-0 top-1/2"].map((pos) => (
              <span key={pos} className={`absolute ${pos} h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold`} />
            ))}
          </motion.div>
          <motion.div
            aria-hidden
            className="absolute inset-[9%] rounded-full border border-champagne/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.5 }}
          />
          <motion.div
            className="absolute inset-[14%]"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.6, ease: easeLux, delay: 0.1 }}
          >
            <div aria-hidden className="absolute inset-[8%] rounded-full bg-gold/15 blur-3xl" />
            <Image src={logo} alt="Goldenfalcone eagle and tree emblem" fill priority sizes="(min-width: 1024px) 30vw, 70vw" className="relative object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.35)]" />
          </motion.div>
        </motion.div>
      </div>

      <motion.a
        href="#introduction"
        aria-label="Scroll to introduction"
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-[0.65rem] uppercase tracking-[0.3em] text-champagne/60 transition-colors hover:text-champagne sm:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
      >
        Scroll
        <ArrowDown aria-hidden className="h-4 w-4" />
      </motion.a>
    </section>
  );
}

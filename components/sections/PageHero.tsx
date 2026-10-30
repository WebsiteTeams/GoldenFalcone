"use client";

import Image from "next/image";
import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { TextReveal } from "@/components/animations";
import { easeLux } from "@/components/animations/motion";

type PageHeroProps = {
  eyebrow: string;
  title: string[];
  intro: string;
  image: string;
  imageAlt: string;
  actions?: ReactNode;
};

/** Shared interior-page hero: photography under a forest veil, with gentle parallax. */
export function PageHero({ eyebrow, title, intro, image, imageAlt, actions }: PageHeroProps) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0.4]);

  return (
    <section ref={ref} className="relative isolate flex min-h-[78svh] items-end overflow-hidden bg-forest pb-16 pt-36 text-ivory sm:pb-24">
      <motion.div className="absolute inset-0 -z-20" style={reduce ? undefined : { y }}>
        <motion.div
          className="absolute inset-0"
          initial={{ scale: reduce ? 1 : 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: easeLux }}
        >
          <Image src={image} alt={imageAlt} fill priority sizes="100vw" className="object-cover" />
        </motion.div>
      </motion.div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-forest via-forest/80 to-forest/45" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-forest/70 to-transparent" />

      <motion.div className="container-lux" style={reduce ? undefined : { opacity: fade }}>
        <motion.p
          className="eyebrow flex items-center gap-3 text-gold"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeLux, delay: 0.1 }}
        >
          <motion.span
            aria-hidden
            className="h-px w-10 origin-left bg-gold"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, ease: easeLux, delay: 0.2 }}
          />
          {eyebrow}
        </motion.p>
        <TextReveal
          as="h1"
          immediate
          delay={0.2}
          lines={title}
          className="mt-6 max-w-4xl text-5xl leading-[1.02] sm:text-6xl lg:text-7xl"
        />
        <motion.p
          className="mt-7 max-w-2xl text-base leading-relaxed text-ivory/75 sm:text-lg"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeLux, delay: 0.55 }}
        >
          {intro}
        </motion.p>
        {actions ? (
          <motion.div
            className="mt-10 flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeLux, delay: 0.7 }}
          >
            {actions}
          </motion.div>
        ) : null}
      </motion.div>
    </section>
  );
}

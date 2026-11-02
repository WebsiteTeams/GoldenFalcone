"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/** `position` keeps each photo's subject clear of the headline, which sits on the left. */
const slides = [
  { src: "/images/hero/Spices1.png", position: "60% 50%" },
  { src: "/images/hero/Trad.png", position: "85% 40%" },
  { src: "/images/hero/Saloon1.png", position: "55% 50%" },
  { src: "/images/hero/Spices2.png", position: "60% 50%" },
  { src: "/images/hero/Trad1.png", position: "80% 35%" },
  { src: "/images/hero/Saloon2.png", position: "85% 40%" },
];

export const HERO_OVERLAY =
  // "linear-gradient(180deg in oklch, oklch(29.92% 0.0400 170.16) 0.0%, oklch(30.82% 0.0434 169.80) 3.2%, oklch(31.93% 0.0485 169.40) 6.5%, oklch(33.25% 0.0546 168.93) 9.7%, oklch(34.77% 0.0610 168.36) 12.9%, oklch(36.49% 0.0671 167.66) 16.1%, oklch(38.38% 0.0723 166.81) 19.4%, oklch(40.46% 0.0759 165.78) 22.6%, oklch(42.71% 0.0773 164.54) 25.8%, oklch(45.26% 0.0765 163.08) 29.0%, oklch(48.09% 0.0740 161.43) 32.3%, oklch(51.13% 0.0704 159.61) 35.5%, oklch(54.30% 0.0660 157.65) 38.7%, oklch(57.53% 0.0613 155.58) 41.9%, oklch(60.74% 0.0567 153.42) 45.2%, oklch(63.86% 0.0526 151.20) 48.4%, oklch(66.86% 0.0495 148.98) 51.6%, oklch(70.01% 0.0465 146.89) 54.8%, oklch(73.26% 0.0435 144.85) 58.1%, oklch(76.51% 0.0407 142.73) 61.3%, oklch(79.65% 0.0379 140.41) 64.5%, oklch(82.57% 0.0353 137.76) 67.7%, oklch(85.17% 0.0330 134.67) 71.0%, oklch(87.33% 0.0308 131.02) 74.2%, oklch(89.00% 0.0289 126.48) 77.4%, oklch(90.22% 0.0272 120.75) 80.6%, oklch(91.10% 0.0257 114.24) 83.9%, oklch(91.70% 0.0244 107.41) 87.1%, oklch(92.10% 0.0232 100.69) 90.3%, oklch(92.38% 0.0222 94.52) 93.5%, oklch(92.63% 0.0214 89.35) 96.8%, oklch(92.91% 0.0207 85.62) 100.0%)";
  "background: linear-gradient(180deg in oklch, oklch(14.22% 0.0283 169.56) 0.0%, oklch(15.25% 0.0304 169.31) 3.2%, oklch(16.49% 0.0330 169.01) 6.5%, oklch(17.97% 0.0361 168.62) 9.7%, oklch(19.69% 0.0398 168.12) 12.9%, oklch(21.69% 0.0442 167.48) 16.1%, oklch(23.98% 0.0493 166.68) 19.4%, oklch(26.58% 0.0554 165.68) 22.6%, oklch(29.53% 0.0625 164.46) 25.8%, oklch(32.98% 0.0713 163.03) 29.0%, oklch(36.91% 0.0740 161.43) 32.3%, oklch(41.19% 0.0704 159.61) 35.5%, oklch(45.67% 0.0660 157.65) 38.7%, oklch(50.22% 0.0613 155.58) 41.9%, oklch(54.71% 0.0567 153.42) 45.2%, oklch(59.00% 0.0526 151.20) 48.4%, oklch(63.04% 0.0495 148.98) 51.6%, oklch(67.26% 0.0465 146.89) 54.8%, oklch(71.58% 0.0435 144.85) 58.1%, oklch(75.87% 0.0407 142.73) 61.3%, oklch(79.97% 0.0379 140.41) 64.5%, oklch(83.72% 0.0353 137.76) 67.7%, oklch(86.99% 0.0330 134.67) 71.0%, oklch(89.62% 0.0308 131.02) 74.2%, oklch(91.48% 0.0289 126.48) 77.4%, oklch(92.62% 0.0272 120.75) 80.6%, oklch(93.20% 0.0257 114.24) 83.9%, oklch(93.36% 0.0244 107.41) 87.1%, oklch(93.26% 0.0232 100.69) 90.3%, oklch(93.05% 0.0222 94.52) 93.5%, oklch(92.88% 0.0214 89.35) 96.8%, oklch(92.91% 0.0207 85.62) 100.0%)"
const INTERVAL = 6000;

/** Crossfading hero backdrop. Decorative, so it is hidden from assistive tech. */
export function HeroBackdrop() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    let timer: number | undefined;
    const start = () => {
      stop();
      timer = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL);
    };
    const stop = () => window.clearInterval(timer);
    const onVisibility = () => (document.hidden ? stop() : start());
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduce]);

  const slide = slides[index];

  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden bg-forest">
      <AnimatePresence initial={false}>
        <motion.div
          key={slide.src}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1 }}
            animate={{ scale: reduce ? 1 : 1.08 }}
            transition={{ duration: (INTERVAL + 1400) / 1000, ease: "linear" }}
          >
            <Image src={slide.src} alt="" fill priority={index === 0} sizes="90vw" className="object-cover" style={{ objectPosition: slide.position }} />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* brand overlay: deep forest green fading to warm stone, top to bottom */}
      <div aria-hidden className="absolute inset-0 opacity-75" style={{ background: HERO_OVERLAY }} />
      {/* keeps the headline legible over the lighter lower half of the overlay */}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,47,37,0.7)_0%,rgba(6,47,37,0.35)_45%,transparent_75%)]" />
    </div>
  );
}

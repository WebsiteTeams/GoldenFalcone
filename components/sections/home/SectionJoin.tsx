"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Sits on the seam between two sections: a gold thread with a faceted diamond, so the page reads as one
 * continuous piece instead of stacked blocks. The diamond turns and the thread widens as the seam crosses the screen.
 * Zero height; draws over both neighbours.
 */
export function SectionJoin({ tone = "light" }: { tone?: "light" | "dark" }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [45, 225]);
  const reach = useTransform(scrollYProgress, [0.15, 0.5, 0.85], [0.4, 1, 0.4]);
  const dark = tone === "dark";

  return (
    <div ref={ref} aria-hidden className="pointer-events-none relative z-20 h-0">
      <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center gap-4">
        <motion.span style={reduce ? undefined : { scaleX: reach }} className="h-px w-16 origin-right bg-gradient-to-r from-transparent to-gold sm:w-36" />
        <motion.span
          style={{ rotate: reduce ? 45 : rotate }}
          className={`relative flex h-7 w-7 items-center justify-center border border-gold ${dark ? "bg-[#050706]" : "bg-white"} shadow-[0_0_0_5px_rgba(212,164,55,0.14),0_10px_30px_-6px_rgba(212,164,55,0.55)]`}
        >
          <span className="h-2 w-2 bg-gold-foil" />
        </motion.span>
        <motion.span style={reduce ? undefined : { scaleX: reach }} className="h-px w-16 origin-left bg-gradient-to-l from-transparent to-gold sm:w-36" />
      </div>
    </div>
  );
}

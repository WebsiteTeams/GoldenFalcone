"use client";

import { motion } from "framer-motion";
import { easeLux } from "@/components/animations/motion";

/** Decorative, data-inspired line that draws itself once when scrolled into view. Not real market data. */
export function ChartLine({ className }: { className?: string }) {
  const path = "M0 150 L40 138 L80 144 L120 112 L160 120 L200 92 L240 100 L280 70 L320 82 L360 52 L400 60 L440 34 L480 42";
  return (
    <svg viewBox="0 0 480 180" className={className} aria-hidden fill="none">
      {[40, 80, 120, 160].map((y) => (
        <line key={y} x1="0" x2="480" y1={y} y2={y} stroke="currentColor" strokeOpacity=".08" />
      ))}
      <motion.path
        d={`${path} L480 180 L0 180 Z`}
        fill="url(#chart-fill)"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 1, ease: easeLux }}
      />
      <motion.path
        d={path}
        stroke="#D4A437"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2.2, ease: easeLux }}
      />
      <defs>
        <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D4A437" stopOpacity=".22" />
          <stop offset="1" stopColor="#D4A437" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

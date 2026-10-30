"use client";

import { motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { easeLux } from "./motion";

// The first page load renders instantly (no fade) so LCP is not delayed;
// subsequent client-side navigations fade in softly.
let hasNavigated = false;

export function PageTransition({ children }: { children: ReactNode }) {
  const [animateIn] = useState(() => {
    const value = hasNavigated;
    hasNavigated = true;
    return value;
  });

  return (
    <motion.div
      initial={animateIn ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeLux }}
    >
      {children}
    </motion.div>
  );
}

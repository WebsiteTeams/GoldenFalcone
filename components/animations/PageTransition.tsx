"use client";

import { motion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { easeLux } from "./motion";

// The first page load renders instantly (no fade) so LCP is not delayed;
// subsequent client-side navigations fade in softly.
//
// This flag must only change inside an effect. Mutating it during render made
// the server's previous render leak into the next one, so SSR could emit the
// "entering" styles while the client hydrated without them.
let hasNavigated = false;

const useSafeLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function PageTransition({ children }: { children: ReactNode }) {
  const [entering, setEntering] = useState(false);
  const mounted = useRef(false);

  useSafeLayoutEffect(() => {
    // Guard against React StrictMode re-running the effect on first mount,
    // which would otherwise fade in the very first page load.
    if (mounted.current) return;
    mounted.current = true;
    if (hasNavigated) setEntering(true);
    hasNavigated = true;
  }, []);

  return (
    <motion.div
      initial={false}
      animate={entering ? { opacity: [0, 1], y: [12, 0] } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeLux }}
    >
      {children}
    </motion.div>
  );
}

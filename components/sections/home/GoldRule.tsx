"use client";

import { motion } from "framer-motion";
import { easeLux, viewportOnce } from "@/components/animations/motion";
import { cn } from "@/lib/utils";

/** A fine gold line that draws itself as it scrolls into view. */
export function GoldRule({ className }: { className?: string }) {
  return (
    <motion.span
      aria-hidden
      className={cn("block h-px origin-left bg-gold", className)}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={viewportOnce}
      transition={{ duration: 1.4, ease: easeLux }}
    />
  );
}

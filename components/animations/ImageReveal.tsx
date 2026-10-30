"use client";

import Image, { type ImageProps } from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { easeLux, viewportOnce } from "./motion";

type ImageRevealProps = Omit<ImageProps, "fill"> & {
  /** Classes for the sizing wrapper — give it an aspect ratio or height to prevent layout shift. */
  wrapperClassName?: string;
  direction?: "up" | "left";
};

/** Masked image reveal with a gentle 1.06 → 1 settle. */
export function ImageReveal({ wrapperClassName, direction = "up", className, alt, ...image }: ImageRevealProps) {
  const reduce = useReducedMotion();
  const hiddenClip = direction === "up" ? "inset(100% 0% 0% 0%)" : "inset(0% 100% 0% 0%)";

  return (
    <motion.div
      data-reveal
      className={`relative overflow-hidden ${wrapperClassName ?? ""}`}
      initial={reduce ? false : { clipPath: hiddenClip }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={viewportOnce}
      transition={{ duration: 1.1, ease: easeLux }}
    >
      <motion.div
        className="absolute inset-0"
        initial={reduce ? false : { scale: 1.06 }}
        whileInView={{ scale: 1 }}
        viewport={viewportOnce}
        transition={{ duration: 1.4, ease: easeLux }}
      >
        <Image fill alt={alt} className={`object-cover ${className ?? ""}`} {...image} />
      </motion.div>
    </motion.div>
  );
}

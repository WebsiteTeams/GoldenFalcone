"use client";

import Image, { type ImageProps } from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { easeLux, viewportOnce } from "./motion";

type ImageRevealProps = Omit<ImageProps, "fill"> & {
  /** Classes for the sizing wrapper — give it an aspect ratio or height to prevent layout shift. */
  wrapperClassName?: string;
  direction?: "up" | "left";
};

/**
 * Masked image reveal with a gentle 1.06 → 1 settle.
 * The in-view trigger sits on the unclipped wrapper: a fully clipped element never registers as
 * intersecting, so observing the clipped layer itself would leave the image hidden forever.
 */
export function ImageReveal({ wrapperClassName, direction = "up", className, alt, ...image }: ImageRevealProps) {
  const reduce = useReducedMotion();
  const hiddenClip = direction === "up" ? "inset(100% 0% 0% 0%)" : "inset(0% 100% 0% 0%)";

  return (
    <motion.div className={`relative overflow-hidden ${wrapperClassName ?? ""}`} initial={reduce ? false : "hidden"} whileInView="visible" viewport={viewportOnce}>
      <motion.div
        data-reveal
        className="absolute inset-0"
        variants={{
          hidden: { clipPath: hiddenClip, scale: 1.06 },
          visible: { clipPath: "inset(0% 0% 0% 0%)", scale: 1 },
        }}
        transition={{ duration: 1.1, ease: easeLux }}
      >
        <Image fill alt={alt} className={`object-cover ${className ?? ""}`} {...image} />
      </motion.div>
    </motion.div>
  );
}

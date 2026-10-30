"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { revealTransition, viewportOnce } from "./motion";

type RevealUpProps = HTMLMotionProps<"div"> & { delay?: number; distance?: number };

export function RevealUp({ delay = 0, distance = 28, ...props }: RevealUpProps) {
  return (
    <motion.div
      data-reveal
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={revealTransition(delay)}
      {...props}
    />
  );
}

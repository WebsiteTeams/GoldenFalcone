"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { revealTransition, viewportOnce } from "./motion";

type FadeInProps = HTMLMotionProps<"div"> & { delay?: number };

export function FadeIn({ delay = 0, ...props }: FadeInProps) {
  return (
    <motion.div
      data-reveal
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={viewportOnce}
      transition={revealTransition(delay)}
      {...props}
    />
  );
}

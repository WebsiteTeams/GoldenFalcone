"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeUp, stagger, viewportOnce } from "./motion";

type StaggerContainerProps = HTMLMotionProps<"div"> & { gap?: number; delay?: number };

export function StaggerContainer({ gap = 0.09, delay = 0, ...props }: StaggerContainerProps) {
  return (
    <motion.div
      variants={stagger(gap, delay)}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      {...props}
    />
  );
}

export function StaggerList({ gap = 0.09, delay = 0, ...props }: HTMLMotionProps<"ul"> & { gap?: number; delay?: number }) {
  return (
    <motion.ul
      variants={stagger(gap, delay)}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      {...props}
    />
  );
}

export function StaggerItem(props: HTMLMotionProps<"div">) {
  return <motion.div data-reveal variants={fadeUp} {...props} />;
}

export function StaggerListItem(props: HTMLMotionProps<"li">) {
  return <motion.li data-reveal variants={fadeUp} {...props} />;
}

import type { Transition, Variants } from "framer-motion";

export const easeLux = [0.22, 1, 0.36, 1] as const;

export const duration = {
  hover: 0.24,
  ui: 0.3,
  reveal: 0.7,
} as const;

/** Reveal once, slightly before the element is fully in view. */
export const viewportOnce = { once: true, amount: 0.2, margin: "0px 0px -60px 0px" } as const;

export const revealTransition = (delay = 0): Transition => ({
  duration: duration.reveal,
  ease: easeLux,
  delay,
});

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: revealTransition() },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: revealTransition() },
};

export const stagger = (staggerChildren = 0.09, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren } },
});

"use client";

import { motion } from "framer-motion";
import { easeLux, viewportOnce } from "./motion";

type TextRevealProps = {
  /** Each entry renders on its own line and reveals in sequence. */
  lines: string[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  lineClassName?: string;
  delay?: number;
  /** Index of a line to set in italic champagne for editorial emphasis. */
  accentIndex?: number;
  accentClassName?: string;
  /** Animate on mount instead of when scrolled into view (use for heroes). */
  immediate?: boolean;
};

/**
 * Editorial headline reveal: each line slides up from behind a mask.
 * The words stay in the DOM as real text, so they remain readable by assistive tech and crawlers.
 */
export function TextReveal({ lines, as = "h2", className, lineClassName, delay = 0, immediate = false, accentIndex, accentClassName = "italic text-champagne" }: TextRevealProps) {
  const Tag = motion[as];
  const trigger = immediate ? { animate: "visible" } : { whileInView: "visible", viewport: viewportOnce };

  return (
    <Tag
      className={className}
      initial="hidden"
      {...trigger}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: delay } } }}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.1em]">
          <motion.span
            data-reveal
            className={`block ${i === accentIndex ? accentClassName : ""} ${lineClassName ?? ""}`}
            variants={{
              hidden: { y: "105%", opacity: 0 },
              visible: { y: "0%", opacity: 1, transition: { duration: 0.9, ease: easeLux } },
            }}
          >
            {line}
            {i < lines.length - 1 ? " " : null}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

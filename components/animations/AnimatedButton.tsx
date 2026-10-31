"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { duration, easeLux } from "./motion";

type Variant = "gold" | "forest" | "tech" | "outline-light" | "outline-dark";

const variants: Record<Variant, string> = {
  gold: "bg-gold text-forest hover:bg-champagne",
  forest: "bg-forest text-ivory hover:bg-emerald",
  tech: "bg-tech-blue text-white hover:bg-tech-blue-dark",
  "outline-light": "border border-champagne/50 text-ivory hover:border-gold hover:text-champagne",
  "outline-dark": "border border-forest/25 text-forest hover:border-gold hover:text-gold-dark",
};

type AnimatedButtonProps = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  arrow?: boolean;
  icon?: ReactNode;
  className?: string;
  external?: boolean;
};

const MotionLink = motion.create(Link);

export function AnimatedButton({ href, children, variant = "gold", arrow = true, icon, className, external }: AnimatedButtonProps) {
  const classes = cn(
    "group inline-flex items-center justify-center gap-3 rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide transition-colors duration-300",
    variants[variant],
    className,
  );
  const motionProps = {
    whileHover: { y: -2 },
    whileTap: { scale: 0.98 },
    transition: { duration: duration.hover, ease: easeLux },
  };
  const content = (
    <>
      {icon}
      <span>{children}</span>
      {arrow ? (
        <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
      ) : null}
    </>
  );

  if (external) {
    return (
      <motion.a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...motionProps}>
        {content}
      </motion.a>
    );
  }
  return (
    <MotionLink href={href} className={classes} {...motionProps}>
      {content}
    </MotionLink>
  );
}

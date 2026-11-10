"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/**
 * Inertial smooth scrolling for the public site: a soft, weighted glide instead of stepped wheel jumps.
 * Skipped for the admin panel and for visitors who ask for reduced motion.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const enabled = !pathname.startsWith("/admin");

  useEffect(() => {
    if (!enabled || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.9,
      smoothWheel: true,
      anchors: { offset: -88 },
    });
    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [enabled]);

  return null;
}

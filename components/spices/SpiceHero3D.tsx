"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowRight, FileCheck2, MessageCircle } from "lucide-react";
import { formatPrice } from "@/lib/cart/price";
import type { PublicSpice } from "@/lib/cms";

const spring = { stiffness: 70, damping: 18, mass: 0.6 };

/** A product floating in front of the platter, placed at its own depth in the 3D scene. */
function FloatingProduct({ spice, className, depth, delay }: { spice: PublicSpice; className: string; depth: number; delay: number }) {
  const reduced = useReducedMotion();
  const image = spice.images[0];
  if (!image || spice.startingPrice === null) return null;
  return (
    <div className={`absolute w-[9.5rem] sm:w-44 ${className}`} style={{ transform: `translateZ(${depth}px)` }}>
      <motion.div
        animate={reduced ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 6, delay, repeat: Infinity, ease: "easeInOut" }}
        className="overflow-hidden rounded-2xl border border-white/15 bg-forest-deep/70 shadow-[0_30px_50px_-20px_rgba(0,0,0,0.75)] backdrop-blur-md"
      >
        <div className="relative aspect-[4/3]">
          <Image src={image.url} alt="" fill sizes="176px" className="object-cover" />
        </div>
        <div className="px-3 py-2.5">
          <p className="truncate font-serif text-base leading-tight text-ivory">{spice.name}</p>
          <p className="text-[11px] text-champagne/90">From {formatPrice(spice.startingPrice, spice.currency)} / kg</p>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Hero with a real CSS 3D scene: layers sit at different depths and the stage tilts with the pointer.
 * It stays still for visitors who prefer reduced motion, and needs no 3D library or model files.
 */
export function SpiceHero3D({ products, whatsappHref }: { products: PublicSpice[]; whatsappHref?: string }) {
  const reduced = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-11, 11]), spring);
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [9, -9]), spring);

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduced || e.pointerType !== "mouse") return;
    const box = e.currentTarget.getBoundingClientRect();
    pointerX.set((e.clientX - box.left) / box.width - 0.5);
    pointerY.set((e.clientY - box.top) / box.height - 0.5);
  };
  const onPointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <section
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative overflow-hidden bg-forest-deep pb-20 pt-32 text-ivory sm:pb-28 sm:pt-40"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_75%_40%,rgba(6,75,56,0.9),transparent_70%)]" />

      <div className="container-lux relative grid items-center gap-14 lg:grid-cols-2 lg:gap-8">
        <div className="max-w-xl">
          <p className="eyebrow text-gold">Goldenfalcone Spices</p>
          <h1 className="mt-5 text-5xl leading-[1.05] text-ivory sm:text-6xl lg:text-7xl">
            Spices you choose by quality, not by guesswork.
          </h1>
          <p className="mt-6 text-base leading-relaxed text-ivory/75 sm:text-lg">
            Powders and whole spices in three quality levels. See the quality percentage, sourcing area, lab report and
            price per kilogram for each one before you order.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/spices/shop"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-8 py-3.5 text-sm font-semibold text-forest transition-colors hover:bg-champagne"
            >
              Shop Now <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-ivory/25 px-7 py-3.5 text-sm font-semibold text-ivory transition-colors hover:border-gold hover:text-gold"
              >
                <MessageCircle aria-hidden className="h-4 w-4" /> Ask on WhatsApp
              </a>
            ) : null}
          </div>
        </div>

        <div className="mx-auto w-full max-w-[34rem] [perspective:1400px]">
          <motion.div
            style={reduced ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative aspect-square w-full"
          >
            <div aria-hidden className="absolute inset-[2%] rounded-full border border-gold/25" style={{ transform: "translateZ(-70px)" }} />
            <div aria-hidden className="absolute inset-[9%] rounded-full border border-gold/40" style={{ transform: "translateZ(-30px)" }} />

            <div className="absolute inset-[14%] overflow-hidden rounded-full shadow-[0_50px_80px_-30px_rgba(0,0,0,0.85)] ring-1 ring-gold/40">
              <Image
                src="/images/spices/hero-platter.jpg"
                alt="A platter of whole and ground Indian spices"
                fill
                priority
                sizes="(min-width: 1024px) 400px, 72vw"
                className="object-cover"
              />
            </div>

            {products[0] ? <FloatingProduct spice={products[0]} className="-left-1 top-[6%] sm:left-0" depth={90} delay={0} /> : null}
            {products[1] ? <FloatingProduct spice={products[1]} className="-right-1 bottom-[8%] sm:right-0" depth={120} delay={1.4} /> : null}

            <div
              className="absolute bottom-[3%] left-[4%] flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 py-2 pl-2.5 pr-4 text-xs font-medium text-ivory shadow-lg backdrop-blur-md"
              style={{ transform: "translateZ(60px)" }}
            >
              <FileCheck2 aria-hidden className="h-4 w-4 text-gold" />
              Lab report for each quality
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

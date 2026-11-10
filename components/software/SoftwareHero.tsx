"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { AnimatedButton } from "@/components/animations";
import { easeLux } from "@/components/animations/motion";

/** Illustrative candles only: fixed values so the picture is stable and never reads as market data. */
const candles = [
  [52, 60, 66, 48], [60, 55, 64, 52], [55, 63, 68, 53], [63, 70, 74, 60], [70, 66, 73, 62], [66, 72, 77, 64],
  [72, 69, 75, 65], [69, 78, 82, 67], [78, 74, 80, 70], [74, 83, 87, 72], [83, 79, 86, 76], [79, 85, 90, 77],
  [85, 92, 96, 83], [92, 88, 95, 85], [88, 94, 99, 86], [94, 101, 105, 92], [101, 97, 104, 94], [97, 106, 110, 95],
  [106, 112, 116, 103], [112, 108, 115, 105], [108, 117, 121, 106], [117, 124, 128, 114],
] as const;

const W = 560;
const H = 250;
const lo = 40;
const hi = 134;
const y = (v: number) => H - ((v - lo) / (hi - lo)) * (H - 24) - 12;
const step = W / candles.length;

function Chart({ animate }: { animate: boolean }) {
  const line = candles.map(([, c], i) => `${i === 0 ? "M" : "L"}${(i * step + step / 2).toFixed(1)},${y(c).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label="Illustrative candlestick chart">
      {[0.2, 0.4, 0.6, 0.8].map((p) => (
        <line key={p} x1="0" x2={W} y1={H * p} y2={H * p} stroke="#E8D5A3" strokeOpacity="0.08" />
      ))}
      {candles.map(([o, c, h, l], i) => {
        const x = i * step + step / 2;
        const up = c >= o;
        const color = up ? "#D4A437" : "#7FB6A0";
        const last = i === candles.length - 1;
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={y(h)} y2={y(l)} stroke={color} strokeOpacity="0.75" />
            <motion.rect
              x={x - step * 0.3}
              width={step * 0.6}
              rx="1.5"
              fill={color}
              fillOpacity={up ? 0.95 : 0.55}
              y={y(Math.max(o, c))}
              height={Math.max(2, Math.abs(y(o) - y(c)))}
              animate={animate && last ? { height: [Math.abs(y(o) - y(c)), Math.abs(y(o) - y(c)) + 7, Math.abs(y(o) - y(c))] } : undefined}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </g>
        );
      })}
      <path d={line} fill="none" stroke="#E8D5A3" strokeOpacity="0.5" strokeWidth="1.2" strokeDasharray="3 4" />
    </svg>
  );
}

const bars = [38, 62, 48, 80, 55, 92, 70, 58];

/** The dashboard "screen": chart, ladder and panels, all abstract, none carrying a ticker or a figure. */
function Screen({ animate }: { animate: boolean }) {
  return (
    <div className="grid h-full grid-cols-[1fr_9rem] gap-3 p-3 sm:gap-4 sm:p-5">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-gold" />
          <span className="h-2 w-2 rounded-full bg-champagne/40" />
          <span className="h-2 w-2 rounded-full bg-champagne/20" />
          <span className="ml-3 h-2 w-24 rounded-full bg-champagne/15" />
          <span className="ml-auto h-2 w-10 rounded-full bg-gold/60" />
        </div>
        <div className="min-h-0 flex-1 rounded-lg border border-champagne/10 bg-forest-deep/70 p-2">
          <Chart animate={animate} />
        </div>
        <div className="grid grid-cols-8 items-end gap-1.5">
          {bars.map((b, i) => (
            <span key={i} className="rounded-sm bg-champagne/20" style={{ height: `${b * 0.32}px` }} />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="rounded-lg border border-champagne/10 bg-forest-deep/70 p-2.5">
          <div className="mb-2 h-1.5 w-12 rounded-full bg-gold/70" />
          {[80, 62, 48, 36, 24].map((w, i) => (
            <div key={i} className="mb-1.5 flex items-center gap-1.5">
              <span className="h-1.5 rounded-full bg-champagne/45" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
        <div className="flex-1 rounded-lg border border-champagne/10 bg-forest-deep/70 p-2.5">
          <div className="mb-2 h-1.5 w-10 rounded-full bg-champagne/35" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="mb-2 flex items-center justify-between gap-2">
              <span className="h-1.5 w-8 rounded-full bg-champagne/25" />
              <span className={`h-1.5 w-5 rounded-full ${i % 2 ? "bg-[#7FB6A0]/70" : "bg-gold/80"}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FloatingPanel({ className, z, children }: { className: string; z: number; children: React.ReactNode }) {
  return (
    <div
      className={`absolute rounded-xl border border-gold/30 bg-gradient-to-b from-emerald/90 to-forest p-3 shadow-[0_24px_50px_-18px_rgba(0,0,0,0.8)] ${className}`}
      style={{ transform: `translateZ(${z}px)` }}
    >
      {children}
    </div>
  );
}

/** Pointer-driven parallax on the monitor; no motion at all when the visitor prefers reduced motion. */
function Monitor() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 18 });
  const sy = useSpring(py, { stiffness: 60, damping: 18 });
  const rotateY = useTransform(sx, [-1, 1], [-20, -8]);
  const rotateX = useTransform(sy, [-1, 1], [10, 2]);

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      const box = ref.current?.getBoundingClientRect();
      if (!box) return;
      px.set(Math.max(-1, Math.min(1, ((e.clientX - box.left) / box.width - 0.5) * 2)));
      py.set(Math.max(-1, Math.min(1, ((e.clientY - box.top) / box.height - 0.5) * 2)));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, px, py]);

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[34rem] [perspective:1500px] lg:max-w-none">
      <motion.div
        className="relative [transform-style:preserve-3d]"
        style={reduce ? { rotateY: -14, rotateX: 6 } : { rotateY, rotateX }}
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, ease: easeLux, delay: 0.25 }}
      >
        {/* Monitor body */}
        <div className="relative rounded-[1.4rem] border border-gold/40 bg-gradient-to-br from-[#0b3b2e] via-forest to-forest-deep p-2.5 shadow-[0_50px_90px_-30px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(232,213,163,0.35)] sm:p-3">
          <div className="aspect-[16/10] overflow-hidden rounded-xl border border-black/50 bg-gradient-to-b from-[#052a21] to-[#031a14]">
            <Screen animate={!reduce} />
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-2.5 rounded-xl bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.09] sm:inset-3" />
        </div>
        {/* Stand */}
        <div aria-hidden className="mx-auto h-10 w-16 bg-gradient-to-b from-[#0b3b2e] to-forest-deep [clip-path:polygon(20%_0,80%_0,100%_100%,0_100%)]" />
        <div aria-hidden className="mx-auto -mt-px h-2 w-44 rounded-full bg-gradient-to-r from-forest-deep via-gold/50 to-forest-deep" />
        <div aria-hidden className="mx-auto mt-3 h-6 w-3/4 rounded-[50%] bg-black/40 blur-xl" />

        <FloatingPanel z={70} className="-left-3 top-[58%] hidden w-36 sm:block">
          <div className="mb-2 h-1.5 w-10 rounded-full bg-gold/70" />
          <svg viewBox="0 0 120 40" className="h-9 w-full" aria-hidden>
            <path d="M0,32 C15,28 20,12 36,16 S60,30 74,18 S100,4 120,8" fill="none" stroke="#E8D5A3" strokeWidth="1.6" />
          </svg>
        </FloatingPanel>
        <FloatingPanel z={95} className="-right-2 -top-5 hidden w-32 sm:block">
          <div className="mb-2 h-1.5 w-8 rounded-full bg-champagne/40" />
          <div className="flex items-end gap-1">
            {[40, 70, 52, 88, 64].map((h, i) => (
              <span key={i} className="w-full rounded-sm bg-gold/80" style={{ height: `${h * 0.34}px` }} />
            ))}
          </div>
        </FloatingPanel>
      </motion.div>
      <p className="mt-6 text-center text-[0.7rem] tracking-wide text-ivory/45">Illustrative interface. Not market data or product performance.</p>
    </div>
  );
}

export function SoftwareHero() {
  return (
    <section className="surface-forest relative isolate overflow-hidden pb-24 pt-32 text-ivory sm:pb-28 sm:pt-40">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_78%_45%,rgba(6,75,56,0.9),transparent_70%)]" />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-1/2 opacity-[0.18] [background-image:linear-gradient(rgba(232,213,163,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(232,213,163,0.5)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_top,#000,transparent)]"
      />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      <div className="container-lux grid items-center gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6">
          <motion.p
            className="eyebrow flex items-center gap-3 text-gold"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeLux, delay: 0.1 }}
          >
            <span aria-hidden className="h-px w-10 bg-gold" />
            Goldenfalcone · Trading Technology
          </motion.p>
          <motion.h1
            className="mt-6 text-5xl leading-[1.02] sm:text-6xl lg:text-[4.4rem]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: easeLux, delay: 0.2 }}
          >
            Trade Smarter.
            <span className="block italic text-champagne">Powered by Technology.</span>
          </motion.h1>
          <motion.p
            className="mt-7 max-w-xl text-base leading-relaxed text-ivory/75 sm:text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeLux, delay: 0.45 }}
          >
            Explore professional trading software solutions designed to support market analysis, trading strategies and automated workflows.
          </motion.p>
          <motion.div
            className="mt-10 flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeLux, delay: 0.6 }}
          >
            <AnimatedButton href="#catalogue">Explore Software</AnimatedButton>
            <AnimatedButton href="#demo" variant="outline-light" arrow={false}>
              Request a Demo
            </AnimatedButton>
          </motion.div>
        </div>
        <div className="lg:col-span-6">
          <Monitor />
        </div>
      </div>
    </section>
  );
}

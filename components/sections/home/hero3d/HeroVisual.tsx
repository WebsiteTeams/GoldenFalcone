"use client";

import { Component, useCallback, useEffect, useRef, useState } from "react";
import type { MutableRefObject, ReactNode } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import type { StationKey } from "./Stations";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

type Props = {
  src: string;
  active: StationKey | null;
  onHover: (key: StationKey | null) => void;
  pointer: MutableRefObject<{ x: number; y: number }>;
  routes: Record<StationKey, string>;
};

class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function canRender3D() {
  try {
    const c = document.createElement("canvas");
    if (!(c.getContext("webgl2") || c.getContext("webgl"))) return false;
  } catch {
    return false;
  }
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return false;
  if ((nav.deviceMemory ?? 8) <= 2 || (nav.hardwareConcurrency ?? 8) <= 2) return false;
  return true;
}

/**
 * Static emblem poster first (fast LCP, works without WebGL), then the lazy-loaded 3D scene fades in over it.
 * The poster is also the permanent fallback for unsupported or low-powered devices.
 */
export function HeroVisual({ src, active, onHover, pointer, routes }: Props) {
  const router = useRouter();
  const reduce = !!useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const scroll = useRef(0);
  const [mount, setMount] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [wide, setWide] = useState(false);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!canRender3D()) {
      setFailed(true);
      return;
    }
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setMobile(mq.matches);
    const wq = window.matchMedia("(min-width: 1024px)");
    const syncWide = () => setWide(wq.matches);
    sync();
    syncWide();
    mq.addEventListener("change", sync);
    wq.addEventListener("change", syncWide);
    // Defer the heavy chunk until the page has painted so it never blocks the first render.
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const id = idle ? idle(() => setMount(true), { timeout: 1200 }) : window.setTimeout(() => setMount(true), 400);
    return () => {
      mq.removeEventListener("change", sync);
      wq.removeEventListener("change", syncWide);
      if (!idle) window.clearTimeout(id);
    };
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    const onScroll = () => {
      scroll.current = Math.min(1, Math.max(0, window.scrollY / Math.max(1, window.innerHeight)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const onSelect = useCallback((key: StationKey) => router.push(routes[key]), [router, routes]);
  const onReady = useCallback(() => setReady(true), []);
  const onFail = useCallback(() => setFailed(true), []);
  const show3D = mount && !failed;

  return (
    <div ref={box} className="absolute inset-0">
      {/* poster / fallback */}
      <div className={`absolute inset-0 transition-opacity duration-1000 lg:left-[40%] ${ready && show3D ? "opacity-0" : "opacity-100"}`}>
        <div aria-hidden className="absolute left-1/2 top-1/2 h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[68%] w-[68%] -translate-x-1/2 -translate-y-1/2">
          <Image
            src={src}
            alt="Goldenfalcone emblem: a golden eagle encircling a tree"
            fill
            priority
            sizes="(min-width: 1024px) 40vw, 80vw"
            className="object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.45)]"
          />
        </div>
      </div>
      {show3D && (
        <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
          <SceneBoundary onError={onFail}>
            <HeroScene
              src={src}
              active={active}
              visible={visible}
              reduce={reduce}
              mobile={mobile}
              wide={wide}
              pointer={pointer}
              scroll={scroll}
              onHover={onHover}
              onSelect={onSelect}
              onReady={onReady}
              onFail={onFail}
            />
          </SceneBoundary>
        </div>
      )}
    </div>
  );
}

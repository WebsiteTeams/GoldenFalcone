"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { easeLux } from "@/components/animations/motion";
import { divisions, images, type ServiceKey } from "@/lib/content";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";

const divisionImages: Record<ServiceKey, string> = {
  spices: images.spicesMarket,
  mentorship: images.tradingCandles,
  staffing: images.salonChairs,
};

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

/** Gold diamond that marks the current page beneath a link. */
function ActiveMark({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rotate-45 bg-gold transition-all duration-500 ease-[var(--ease-lux)]",
        active ? "scale-100 opacity-100" : "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-60",
      )}
    />
  );
}

export function Navbar({ logo }: { logo?: string }) {
  const pathname = usePathname();
  const { scrollY, scrollYProgress } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuId = useId();
  const menuRef = useRef<HTMLLIElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastY = useRef(0);
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  // Hide on scroll down, reveal on scroll up.
  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 24);
    const delta = y - lastY.current;
    if (Math.abs(delta) > 6) {
      setHidden(delta > 0 && y > 240);
      lastY.current = y;
    }
  });

  useEffect(() => {
    setScrolled(window.scrollY > 24);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // Close the businesses menu with Escape or an outside click.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [menuOpen]);

  const solid = scrolled || menuOpen;
  const hide = hidden && !menuOpen && !mobileOpen;
  const divisionActive = divisions.some((d) => pathname.startsWith(d.href));

  const openWithHover = () => {
    clearTimeout(closeTimer.current);
    setMenuOpen(true);
  };
  const closeWithHover = () => {
    closeTimer.current = setTimeout(() => setMenuOpen(false), 180);
  };

  const linkClass = (active: boolean) =>
    cn(
      "group relative px-1 py-2 text-[0.76rem] font-medium uppercase tracking-[0.2em] transition-colors duration-300",
      active ? "text-gold" : "text-ivory/75 hover:text-ivory",
    );

  return (
    <>
      <motion.header
        animate={{ y: hide ? "-110%" : "0%" }}
        transition={{ duration: 0.45, ease: easeLux }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,padding,border-color,backdrop-filter] duration-500 ease-[var(--ease-lux)]",
          solid
            ? "border-b border-gold/25 bg-[#050706]/90 py-2.5 shadow-[0_18px_50px_-18px_rgba(0,0,0,0.85)] backdrop-blur-xl backdrop-saturate-150"
            : "border-b border-white/10 bg-gradient-to-b from-black/75 to-black/20 py-4 backdrop-blur-md",
        )}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:text-black"
        >
          Skip to content
        </a>

        <nav aria-label="Primary" className="container-lux relative mx-auto flex max-w-[1500px] items-center justify-between gap-6">
          <Logo tone="light" size={solid ? 34 : 42} priority src={logo} />

          {/* centre: primary links */}
          <ul className="hidden items-center gap-9 lg:flex xl:gap-11">
            <li>
              <Link href="/" className={linkClass(isActive(pathname, "/") && pathname === "/")} aria-current={pathname === "/" ? "page" : undefined}>
                Home
                <ActiveMark active={pathname === "/"} />
              </Link>
            </li>
            <li>
              <Link href="/about" className={linkClass(isActive(pathname, "/about"))} aria-current={isActive(pathname, "/about") ? "page" : undefined}>
                About
                <ActiveMark active={isActive(pathname, "/about")} />
              </Link>
            </li>
            <li ref={menuRef} onMouseEnter={openWithHover} onMouseLeave={closeWithHover}>
              <button
                type="button"
                aria-expanded={menuOpen}
                aria-controls={menuId}
                onClick={() => setMenuOpen((o) => !o)}
                className={cn(
                  "group relative inline-flex items-center gap-2 px-1 py-2 text-[0.76rem] font-medium uppercase tracking-[0.2em] transition-colors duration-300",
                  divisionActive || menuOpen ? "text-gold" : "text-ivory/75 hover:text-ivory",
                )}
              >
                Our Businesses
                <ChevronDown aria-hidden className={cn("h-3.5 w-3.5 transition-transform duration-300", menuOpen && "rotate-180")} />
                <ActiveMark active={divisionActive || menuOpen} />
              </button>

              <AnimatePresence>
                {menuOpen ? (
                  <motion.div
                    id={menuId}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: easeLux }}
                    style={{ x: "-50%" }}
                    className="absolute left-1/2 top-full z-30 w-[min(54rem,calc(100vw-3rem))] pt-4"
                  >
                    <div className="surface-black relative overflow-hidden rounded-[1.75rem] border border-gold/30 shadow-[0_40px_90px_-20px_rgba(0,0,0,0.95)]">
                      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
                      <div className="flex items-end justify-between gap-6 px-8 pb-2 pt-7">
                        <div>
                          <p className="eyebrow flex items-center gap-3 text-gold">
                            <span aria-hidden className="h-1 w-1 rotate-45 bg-gold" />
                            Explore Goldenfalcone
                          </p>
                          <p className="mt-2 font-serif text-2xl text-ivory">
                            Three Dimensions. <span className="italic gold-text">One Vision.</span>
                          </p>
                        </div>
                      </div>

                      <ul className="grid gap-4 p-6 sm:grid-cols-3">
                        {divisions.map((d) => {
                          const current = pathname.startsWith(d.href);
                          return (
                            <li key={d.key}>
                              <Link
                                href={d.href}
                                aria-current={current ? "page" : undefined}
                                className={cn(
                                  "group/card relative block overflow-hidden rounded-2xl border bg-black transition-all duration-500 hover:-translate-y-1 hover:border-gold/70",
                                  current ? "border-gold/60" : "border-white/10",
                                )}
                              >
                                <div className="relative aspect-[4/3] overflow-hidden">
                                  <Image
                                    src={divisionImages[d.key]}
                                    alt=""
                                    fill
                                    sizes="(min-width: 1024px) 16rem, 30vw"
                                    className="object-cover opacity-80 transition-all duration-700 group-hover/card:scale-110 group-hover/card:opacity-100"
                                  />
                                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                                  <span className="absolute left-4 top-3 font-serif text-2xl leading-none gold-text">{d.number}</span>
                                  <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-ivory opacity-0 backdrop-blur-md transition-all duration-300 group-hover/card:border-gold group-hover/card:bg-gold group-hover/card:text-black group-hover/card:opacity-100">
                                    <ArrowUpRight aria-hidden className="h-4 w-4" />
                                  </span>
                                </div>
                                <div className="p-4">
                                  <p className="font-serif text-lg leading-tight text-ivory">{d.title}</p>
                                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ivory/55">{d.description}</p>
                                </div>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>

                      <Link
                        href="/contact"
                        className="flex items-center justify-between border-t border-gold/20 bg-white/[0.03] px-8 py-4 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-ivory/70 transition-colors hover:text-gold"
                      >
                        Start a conversation
                        <ArrowRight aria-hidden className="h-4 w-4 text-gold" />
                      </Link>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </li>
            <li>
              <Link href="/contact" className={linkClass(isActive(pathname, "/contact"))} aria-current={isActive(pathname, "/contact") ? "page" : undefined}>
                Contact
                <ActiveMark active={isActive(pathname, "/contact")} />
              </Link>
            </li>
          </ul>

          {/* right: call to action + mobile toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="group hidden items-center gap-2.5 rounded-full bg-gold-foil py-2.5 pl-6 pr-2.5 text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-black shadow-[0_12px_30px_-10px_rgba(212,164,55,0.65)] transition-all duration-300 hover:brightness-110 lg:inline-flex"
            >
              Get in Touch
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-gold transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight aria-hidden className="h-3.5 w-3.5" />
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-white/[0.04] text-ivory backdrop-blur-sm transition-colors duration-300 hover:border-gold hover:text-gold lg:hidden"
            >
              <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="4" y1="8" x2="20" y2="8" />
                <line x1="9" y1="16" x2="20" y2="16" />
              </svg>
            </button>
          </div>
        </nav>

        {/* reading progress */}
        <motion.span
          aria-hidden
          style={{ scaleX: progress }}
          className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-gold/0 via-gold to-champagne"
        />
      </motion.header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} pathname={pathname} logo={logo} />
    </>
  );
}

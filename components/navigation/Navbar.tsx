"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "framer-motion";
import { ArrowRight, ChevronDown, Leaf, GraduationCap, Scissors } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { AnimatedButton } from "@/components/animations";
import { easeLux } from "@/components/animations/motion";
import { divisions, type ServiceKey } from "@/lib/content";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";

const divisionIcons: Record<ServiceKey, typeof Leaf> = {
  spices: Leaf,
  mentorship: GraduationCap,
  staffing: Scissors,
};

/**
 * Determine if the pathname matches a given href prefix.
 * Returns true when href is "/" and pathname is exactly "/",
 * or when pathname starts with the href.
 */
const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

function Underline() {
  return (
    <span
      aria-hidden
      className="absolute inset-x-0 -bottom-0.5 h-px origin-center scale-x-0 bg-gradient-to-r from-transparent via-gold to-transparent transition-transform duration-500 ease-[var(--ease-lux)] group-hover:scale-x-100 group-aria-[current=page]:scale-x-100"
    />
  );
}

export function Navbar({ logo }: { logo?: string }) {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Scroll-based header state
  const lastY = useRef(0);
  const [hidden, setHidden] = useState(false);
  const { scrollYProgress } = useScroll();
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

  // Close menus on navigation link click.
  useEffect(() => {
    setMenuOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // Close the divisions menu with Escape or an outside click.
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
    closeTimer.current = setTimeout(() => setMenuOpen(false), 200);
  };

  /** Class for navigation link text, varying by active state. */
  const linkClass = (active: boolean) =>
    cn(
      "group relative py-2.5 text-[0.8rem] font-medium tracking-[0.14em] uppercase transition-colors duration-300",
      "text-ivory/75 hover:text-champagne",
      active ? "text-champagne" : "",
    );

  /** Class for the CTA button, varying by header state. */
  const ctaClass = (scrolled: boolean) =>
    cn(
      "inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200",
      scrolled
        ? "bg-forest text-ivory hover:bg-champagneGold hover:text-forest"
        : "border border-gold/30 bg-transparent text-ivory hover:bg-gold/10 hover:text-ivory",
    );

  return (
    <>
      <motion.header
        animate={{ y: hide ? "-110%" : "0%" }}
        transition={{ duration: 0.45, ease: easeLux }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,padding,border-color,backdrop-filter] duration-500 ease-[var(--ease-lux)]",
          solid
            ? "border-b border-gold/20 bg-[#04201a]/85 py-2.5 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.7)] backdrop-blur-xl backdrop-saturate-150"
            : "border-b border-white/10 bg-black/55 py-4 backdrop-blur-md",
        )}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:text-forest"
        >
          Skip to content
        </a>
        <nav
          aria-label="Primary"
          className="container-lux flex items-center justify-between gap-6 max-w-[1600px] mx-auto"
        >
          <Logo tone="light" size={solid ? 34 : 42} priority src={logo} />

          {/* Left: Brand end; Centre: Nav; Right: CTA */}
          <div className="flex items-center gap-2">

            {/* Centre zone — Navigation */}
            <ul className="flex items-center gap-8 hidden lg:flex">
              <li>
                <Link
                  href="/"
                  className={linkClass(isActive(pathname, "/"))}
                  aria-current={isActive(pathname, "/") ? "page" : undefined}
                >
                  Home
                  <Underline />
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className={linkClass(isActive(pathname, "/about"))}
                  aria-current={isActive(pathname, "/about") ? "page" : undefined}
                >
                  About Us
                  <Underline />
                </Link>
              </li>

              <li>
                <div
                  ref={menuRef}
                  className="relative group inline-block"
                  onMouseEnter={openWithHover}
                  onMouseLeave={closeWithHover}
                >
                  <button
                    type="button"
                    aria-expanded={menuOpen}
                    aria-controls={menuId}
                    onClick={() => setMenuOpen((o) => !o)}
                    className={cn(
                      "flex items-center gap-1 rounded-full border border-gold/40 bg-white/[0.03] backdrop-blur-sm transition-all duration-300 hover:border-gold hover:bg-gold/10",
                      "py-2.5 pl-5 pr-3.5 text-[0.8rem] font-medium uppercase tracking-[0.14em] hover:text-champagne",
                      divisionActive || menuOpen ? "text-ivory" : "text-ivory/80",
                    )}
                  >
                    Our Businesses
                    <ChevronDown
                      aria-hidden
                      className={cn(
                        "ml-2 h-4 w-4 transition-transform duration-300",
                        menuOpen && "rotate-180",
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {menuOpen ? (
                      <motion.div
                        id={menuId}
                        initial={{ opacity: 0, x: "-50%", y: 8 }}
                        animate={{ opacity: 1, x: "-50%", y: 0 }}
                        exit={{ opacity: 0, x: "-50%", y: 4 }}
                        transition={{ duration: 0.22, ease: easeLux }}
                        className="absolute left-1/2 top-full z-30 w-[22rem] pt-4 transform-negative translate-x-1/2"
                      >
                        <div className="overflow-hidden rounded-2xl border border-gold/25 bg-[#051f19]/95 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.85)] backdrop-blur-xl">
                          <div className="border-b border-white/10 px-5 py-4">
                            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-gold">Explore Goldenfalcone</p>
                            <p className="mt-1 font-serif text-xl text-ivory">Our Business Ventures</p>
                          </div>
                          <ul className="p-2">
                            {divisions.map((d) => {
                              const Icon = divisionIcons[d.key];
                              const current = pathname.startsWith(d.href);
                              return (
                                <li key={d.key}>
                                  <Link
                                    href={d.href}
                                    aria-current={current ? "page" : undefined}
                                    className={cn(
                                      "group/item flex items-center gap-4 rounded-xl px-3 py-3 transition-colors duration-200",
                                      "hover:bg-gold/10 focus-visible:bg-gold/10",
                                      current && "bg-gold/10",
                                    )}
                                  >
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gold/30 bg-gold/10 text-gold transition-colors duration-200 group-hover/item:bg-gold group-hover/item:text-forest">
                                      <Icon aria-hidden className="h-5 w-5" strokeWidth={1.5} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                      <span className="block text-[0.95rem] font-medium text-ivory">{d.title}</span>
                                      <span className="mt-0.5 line-clamp-1 block text-xs text-ivory/60">{d.short === d.title ? "" : d.description}</span>
                                    </span>
                                    <ArrowRight aria-hidden className="h-4 w-4 shrink-0 -translate-x-1 text-gold opacity-0 transition-all duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100" />
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                          <Link href="/contact" className="flex items-center justify-between border-t border-white/10 bg-white/[0.03] px-5 py-3 text-xs uppercase tracking-[0.16em] text-ivory/70 transition-colors hover:text-champagne">
                            Start a conversation
                            <ArrowRight aria-hidden className="h-3.5 w-3.5 text-gold" />
                          </Link>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </li>

              <li>
                <Link
                  href="/contact"
                  className={linkClass(isActive(pathname, "/contact"))}
                  aria-current={isActive(pathname, "/contact") ? "page" : undefined}
                >
                  Contact
                  <Underline />
                </Link>
              </li>
            </ul>

            {/* Right zone — Primary CTA */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-ivory/30 text-ivory transition-colors duration-300 lg:hidden",
                )}
              >
                <svg
                  aria-hidden
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>

          </div>
        </nav>
              <motion.span
          aria-hidden
          style={{ scaleX: progress }}
          className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-gold/0 via-gold to-champagne"
        />
      </motion.header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        pathname={pathname}
        logo={logo}
      />
    </>
  );
}
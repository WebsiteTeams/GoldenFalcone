"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { ChevronDown, Leaf, GraduationCap, Scissors } from "lucide-react";
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
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

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
      "relative py-2.5 text-[0.875rem] font-medium tracking-[0.02em] uppercase transition-colors duration-300",
      "text-ivory/80 hover:text-ivory",
      active && "text-ivory",
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
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,padding,border-color] duration-500 ease-[var(--ease-lux)]",
          solid
            ? "border-b border-line/80 bg-forest py-3 shadow-[0_8px_30px_-18px_rgba(6,47,37,0.35)] backdrop-blur-md"
            : "border-b border-transparent bg-transparent py-5",
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
                  className={linkClass(pathname === "/")}
                  aria-current={pathname === "/" ? "page" : undefined}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className={linkClass(isActive(pathname, "/about"))}
                  aria-current={isActive(pathname, "/about") ? "page" : undefined}
                >
                  About Us
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
                      "flex items-center gap-2 rounded-full border border-gold/30 hover:bg-gold/10 transition-colors",
                      "py-2.5 px-4 text-sm font-medium hover:text-ivory",
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
                        className="absolute left-1/2 top-full z-30 w-full max-w-[24rem] pt-4 transform-negative translate-x-1/2"
                      >
                        <div className="rounded-2xl bg-white p-4 shadow-[0_20px_45px_-12px_rgba(6,47,37,0.3)] backdrop-blur-sm">
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <svg
                                className="h-5 w-5 text-gold flex-shrink-0 mt-0.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <line x1="3" y1="9" x2="21" y2="9" />
                                <line x1="3" y1="15" x2="21" y2="15" />
                              </svg>
                              <div>
                                <p className="text-xs uppercase tracking-[0.1em] text-ivory/60">EXPLORE GOLDENFALCONE</p>
                                <p className="font-medium text-forest">Our Business Ventures</p>
                                <p className="text-xs text-ivory/60">
                                  Three distinct ventures, connected by one vision.
                                </p>
                              </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                              {divisions.map((d) => {
                                const Icon = divisionIcons[d.key];
                                const current = pathname.startsWith(d.href);
                                return (
                                  <motion.a
                                    key={d.key}
                                    href={d.href}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    aria-current={current ? "page" : undefined}
                                    className={cn(
                                      "group flex flex-col rounded-xl px-4 py-3.5 text-[0.9rem] transition-colors duration-200",
                                      "hover:bg-forest/[0.04] hover:text-forest focus-visible:bg-forest/[0.04] focus-visible:text-forest",
                                      current ? "bg-forest/[0.04] text-forest" : "text-muted",
                                    )}
                                  >
                                    <div className="flex items-center gap-3 mb-2">
                                      <Icon
                                        aria-hidden
                                        className="h-5 w-5 shrink-0 text-gold"
                                        strokeWidth={1.25}
                                      />
                                      <span className="text-base font-medium forest">{d.title}</span>
                                    </div>
                                    <p className="text-xs text-ivory/60">{d.short}</p>
                                    <span
                                      className="mt-1 flex items-center justify-between text-gold/70 hover:text-gold transition-colors duration-200"
                                    >
                                      <span>Explore</span>
                                      <ChevronDown
                                        className="h-3.5 w-3.5 ml-1 transition-transform"
                                      />
                                    </span>
                                  </motion.a>
                                );
                              })}
                            </div>
                          </div>
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
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        pathname={pathname}
        logo={logo}
      />
    </>
  );
}
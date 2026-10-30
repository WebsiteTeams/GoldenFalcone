"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowUpRight, ChevronDown, Menu } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { AnimatedButton } from "@/components/animations";
import { easeLux } from "@/components/animations/motion";
import { CartBadge } from "@/components/spices/CartBadge";
import { divisions } from "@/lib/content";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

export function Navbar({ logo }: { logo?: string }) {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  useEffect(() => {
    setScrolled(window.scrollY > 24);
  }, []);

  // Close menus on navigation.
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
    closeTimer.current = setTimeout(() => setMenuOpen(false), 160);
  };

  const linkClass = (active: boolean) =>
    cn(
      "relative py-2 text-[0.82rem] font-medium tracking-[0.08em] uppercase transition-colors duration-300",
      solid ? "text-ink/80 hover:text-forest" : "text-ivory/80 hover:text-ivory",
      active && (solid ? "text-forest" : "text-ivory"),
    );

  const indicator = (
    <motion.span
      layoutId="nav-active"
      className="absolute -bottom-0.5 left-0 right-0 h-px bg-gold"
      transition={{ duration: 0.35, ease: easeLux }}
    />
  );

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,padding,border-color] duration-500 ease-[var(--ease-lux)]",
          solid
            ? "border-b border-line/80 bg-ivory/90 py-3 shadow-[0_8px_30px_-18px_rgba(6,47,37,0.35)] backdrop-blur-md"
            : "border-b border-transparent bg-transparent py-5",
        )}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:text-forest"
        >
          Skip to content
        </a>
        <nav aria-label="Primary" className="container-lux flex items-center justify-between gap-6">
          <Logo tone={solid ? "dark" : "light"} size={solid ? 38 : 46} priority src={logo} />

          <ul className="hidden items-center gap-9 lg:flex">
            <li>
              <Link href="/" className={linkClass(pathname === "/")} aria-current={pathname === "/" ? "page" : undefined}>
                Home
                {pathname === "/" && indicator}
              </Link>
            </li>
            <li>
              <Link href="/about" className={linkClass(isActive(pathname, "/about"))} aria-current={isActive(pathname, "/about") ? "page" : undefined}>
                About
                {isActive(pathname, "/about") && indicator}
              </Link>
            </li>
            <li>
              <div ref={menuRef} className="relative" onMouseEnter={openWithHover} onMouseLeave={closeWithHover}>
                <button
                  type="button"
                  aria-expanded={menuOpen}
                  aria-controls={menuId}
                  onClick={() => setMenuOpen((o) => !o)}
                  className={cn(linkClass(divisionActive), "inline-flex items-center gap-1.5")}
                >
                  Businesses
                  <ChevronDown aria-hidden className={cn("h-3.5 w-3.5 transition-transform duration-300", menuOpen && "rotate-180")} />
                  {divisionActive && indicator}
                </button>

                <AnimatePresence>
                  {menuOpen ? (
                    <motion.div
                      id={menuId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.28, ease: easeLux }}
                      className="absolute left-1/2 top-full w-[40rem] -translate-x-1/2 pt-5"
                    >
                      <div className="grid grid-cols-2 gap-1 rounded-2xl border border-line bg-ivory p-3 shadow-[0_30px_60px_-30px_rgba(6,47,37,0.45)]">
                        {divisions.map((d) => (
                          <Link
                            key={d.key}
                            href={d.href}
                            className={cn(
                              "group rounded-xl p-4 transition-colors duration-300 hover:bg-white focus-visible:bg-white",
                              pathname.startsWith(d.href) && "bg-white",
                            )}
                          >
                            <span className="flex items-start justify-between gap-3">
                              <span>
                                <span className="eyebrow text-gold-dark">{d.number}</span>
                                <span className="mt-1.5 block font-serif text-xl text-forest">{d.title}</span>
                              </span>
                              <ArrowUpRight
                                aria-hidden
                                className="mt-1 h-4 w-4 shrink-0 text-gold transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                              />
                            </span>
                            <span className="mt-2 block text-sm leading-relaxed text-muted">{d.description}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </li>
            <li>
              <Link href="/contact" className={linkClass(isActive(pathname, "/contact"))} aria-current={isActive(pathname, "/contact") ? "page" : undefined}>
                Contact
                {isActive(pathname, "/contact") && indicator}
              </Link>
            </li>
          </ul>

          <div className="flex items-center gap-3">
            <CartBadge />
            <AnimatedButton
              href="/contact"
              variant={solid ? "forest" : "gold"}
              arrow={false}
              className="hidden !px-5 !py-2.5 text-[0.8rem] sm:inline-flex"
            >
              Discuss Your Project
            </AnimatedButton>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-300 lg:hidden",
                solid ? "border-forest/20 text-forest" : "border-ivory/30 text-ivory",
              )}
            >
              <Menu aria-hidden className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} pathname={pathname} logo={logo} />
    </>
  );
}

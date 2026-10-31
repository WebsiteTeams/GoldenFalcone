"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ChevronDown, GraduationCap, Leaf, type LucideIcon, Menu, MonitorSmartphone, Scissors } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { AnimatedButton } from "@/components/animations";
import { easeLux } from "@/components/animations/motion";
import { divisions, type ServiceKey } from "@/lib/content";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";

const divisionIcons: Record<ServiceKey, LucideIcon> = {
  spices: Leaf,
  mentorship: GraduationCap,
  staffing: Scissors,
  digital: MonitorSmartphone,
};

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
    closeTimer.current = setTimeout(() => setMenuOpen(false), 200);
  };
  const linkClass = (active: boolean) =>
    cn(
      "relative py-2 text-[0.82rem] font-medium tracking-[0.08em] uppercase transition-colors duration-300",
      "text-ivory/80 hover:text-ivory",
      active && "text-ivory",
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
        <nav aria-label="Primary" className="container-lux flex items-center justify-between gap-6">
          <Logo tone="light" size={solid ? 38 : 46} priority src={logo} />

          <ul className="hidden lg:flex items-center gap-6">
            <li>
              <Link href="/" className={linkClass(pathname === "/")} aria-current={pathname === "/" ? "page" : undefined}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className={linkClass(isActive(pathname, "/about"))} aria-current={isActive(pathname, "/about") ? "page" : undefined}>
                About Us
              </Link>
            </li>
            <li>
              <div
                ref={menuRef}
                className="relative group"
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
                  <ChevronDown aria-hidden className={cn("ml-2 h-4 w-4 transition-transform duration-300", menuOpen && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {menuOpen ? (
                    <motion.div
                      id={menuId}
                      initial={{ opacity: 0, x: "-50%", y: 8 }}
                      animate={{ opacity: 1, x: "-50%", y: 0 }}
                      exit={{ opacity: 0, x: "-50%", y: 4 }}
                      transition={{ duration: 0.22, ease: easeLux }}
                      className="absolute left-1/2 top-full z-30 w-[20rem] pt-3"
                    >
                      <div className="flex flex-col gap-1 rounded-2xl bg-white p-2.5 shadow-[0_20px_45px_-12px_rgba(6,47,37,0.3)]">
                        {divisions.map((d) => {
                          const Icon = divisionIcons[d.key];
                          const current = pathname.startsWith(d.href);
                          return (
                            <Link
                              key={d.key}
                              href={d.href}
                              onClick={() => setMenuOpen(false)}
                              aria-current={current ? "page" : undefined}
                              className={cn(
                                "flex items-center gap-4 rounded-xl px-4 py-3.5 text-[0.95rem] transition-colors duration-200",
                                "hover:bg-forest/[0.06] hover:text-forest focus-visible:bg-forest/[0.06] focus-visible:text-forest",
                                current ? "bg-forest/[0.06] text-forest" : "text-muted",
                              )}
                            >
                              <Icon aria-hidden className="h-6 w-6 shrink-0" strokeWidth={1.25} />
                              {d.title}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </li>
            <li>
              <Link href="/contact" className={linkClass(isActive(pathname, "/contact"))} aria-current={isActive(pathname, "/contact") ? "page" : undefined}>
                Contact
              </Link>
            </li>
          </ul>

          <div className="flex items-center gap-2">
            <AnimatedButton
              href="/contact"
              variant="gold"
              arrow={false}
              className="max-sm:!hidden px-6 py-3 rounded-full text-sm font-medium transition-colors"
            >
              Discuss Your Project
            </AnimatedButton>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-full border border-ivory/30 text-ivory transition-colors duration-300 lg:hidden",
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
"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { easeLux } from "@/components/animations/motion";
import { divisions } from "@/lib/content";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

type MobileMenuProps = { open: boolean; onClose: () => void; pathname: string; logo?: string };

const primary = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function MobileMenu({ open, onClose, pathname, logo }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("button, a")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Keep focus inside the dialog.
      if (e.key === "Tab" && panelRef.current) {
        const items = panelRef.current.querySelectorAll<HTMLElement>("a, button");
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <motion.div
            className="absolute inset-0 bg-forest-deep/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="grain absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto bg-forest px-6 pb-8 pt-5 text-ivory"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: easeLux }}
          >
            <div className="flex items-center justify-between">
              <Logo size={38} src={logo} />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ivory/25"
              >
                <X aria-hidden className="h-5 w-5" />
              </button>
            </div>

            <motion.nav
              aria-label="Mobile"
              className="mt-10 flex-1"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } } }}
            >
              <ul className="space-y-1">
                {primary.map((item) => (
                  <motion.li key={item.href} variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}>
                    <Link
                      href={item.href}
                      aria-current={active(item.href) ? "page" : undefined}
                      className={cn("block py-2 font-serif text-3xl transition-colors", active(item.href) ? "text-gold" : "text-ivory hover:text-champagne")}
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <p className="eyebrow mt-10 text-champagne/70">Our Businesses</p>
              <ul className="mt-4 divide-y divide-ivory/10 border-y border-ivory/10">
                {divisions.map((d) => (
                  <motion.li key={d.key} variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}>
                    <Link
                      href={d.href}
                      aria-current={active(d.href) ? "page" : undefined}
                      className={cn("flex items-baseline gap-4 py-4 transition-colors", active(d.href) ? "text-gold" : "text-ivory/90 hover:text-champagne")}
                    >
                      <span className="eyebrow text-gold">{d.number}</span>
                      <span className="text-base">{d.title}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.nav>

            <Link
              href="/contact"
              className="mt-10 inline-flex items-center justify-center rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-forest transition-colors hover:bg-champagne"
            >
              Discuss Your Project
            </Link>
            <p className="mt-6 text-center text-xs tracking-[0.2em] text-champagne/60 uppercase">{site.values.join(" · ")}</p>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

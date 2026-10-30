"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Loader2, LogOut, Menu, Settings } from "lucide-react";
import { easeLux } from "@/components/animations/motion";
import { adminRequest } from "@/lib/admin/client";
import { statusLabel } from "@/lib/admin/constants";

type AdminHeaderProps = { name: string; email: string; role: string; onOpenNav: () => void };

export function AdminHeader({ name, email, role, onOpenNav }: AdminHeaderProps) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const signOut = async () => {
    setSigningOut(true);
    await adminRequest("/api/admin/auth/logout", { method: "POST" });
    // Full reload so no protected page stays in the client router cache.
    window.location.href = "/admin/login";
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-line bg-ivory/90 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Open navigation"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-white text-forest lg:hidden"
      >
        <Menu aria-hidden className="h-5 w-5" />
      </button>
      <p className="hidden text-sm text-muted lg:block">Goldenfalcone administration</p>

      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="menu"
          className="flex items-center gap-3 rounded-full border border-line bg-white py-1 pl-1 pr-3 text-left transition-colors hover:border-gold/50"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-forest text-xs font-semibold text-gold">{initials}</span>
          <span className="hidden sm:block">
            <span className="block text-sm font-medium leading-tight text-ink">{name}</span>
            <span className="block text-[0.7rem] leading-tight text-muted">{statusLabel(role)}</span>
          </span>
          <ChevronDown aria-hidden className="h-4 w-4 text-muted" />
        </button>

        <AnimatePresence>
          {open ? (
            <motion.div
              role="menu"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.18, ease: easeLux }}
              className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-line bg-white shadow-[0_24px_48px_-24px_rgba(6,47,37,0.4)]"
            >
              <div className="border-b border-line px-4 py-3">
                <p className="text-sm font-medium text-ink">{name}</p>
                <p className="truncate text-xs text-muted">{email}</p>
              </div>
              <Link
                role="menuitem"
                href="/admin/settings#profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-ivory"
              >
                <Settings aria-hidden className="h-4 w-4 text-muted" /> Profile & password
              </Link>
              <button
                role="menuitem"
                type="button"
                onClick={signOut}
                disabled={signingOut}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-800 hover:bg-red-50 disabled:opacity-60"
              >
                {signingOut ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <LogOut aria-hidden className="h-4 w-4" />}
                Sign out
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}

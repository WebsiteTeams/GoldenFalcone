"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { easeLux } from "@/components/animations/motion";
import { AdminSidebar } from "./AdminSidebar";
import type { BadgeKey } from "./nav";

type Props = { open: boolean; onClose: () => void; badges: Record<BadgeKey, number>; logo: string };

/** Slide-in drawer version of the sidebar for tablets and phones. */
export function MobileAdminNavigation({ open, onClose, badges, logo }: Props) {
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Admin navigation">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-forest-deep/50 backdrop-blur-[2px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            className="absolute inset-y-0 left-0 w-72 max-w-[85vw]"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: easeLux }}
          >
            <AdminSidebar badges={badges} logo={logo} onNavigate={onClose} />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className="absolute right-3 top-3.5 inline-flex h-9 w-9 items-center justify-center rounded-full text-ivory/80 hover:bg-ivory/10"
            >
              <X aria-hidden className="h-5 w-5" />
            </button>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

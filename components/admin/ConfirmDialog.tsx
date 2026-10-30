"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { easeLux } from "@/components/animations/motion";
import { Button } from "./Button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Modal confirmation for destructive actions. Focus starts on "Cancel" so Enter never deletes by accident. */
export function ConfirmDialog({ open, title, description, confirmLabel = "Delete", pending, onConfirm, onCancel }: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !pending && onCancel();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open, pending, onCancel]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-forest-deep/50"
            onClick={() => !pending && onCancel()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_30px_60px_-20px_rgba(6,47,37,0.5)]"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22, ease: easeLux }}
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-800">
              <AlertTriangle aria-hidden className="h-5 w-5" />
            </span>
            <h2 id={titleId} className="mt-4 font-serif text-2xl text-forest">
              {title}
            </h2>
            <p id={descId} className="mt-2 text-sm leading-relaxed text-muted">
              {description}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button ref={cancelRef} variant="secondary" onClick={onCancel} disabled={pending}>
                Cancel
              </Button>
              <Button variant="danger" className="!bg-red-800 !text-white hover:!bg-red-900" onClick={onConfirm} pending={pending}>
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

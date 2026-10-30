"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { easeLux } from "@/components/animations/motion";
import { cn } from "@/lib/utils";

type Toast = { id: number; tone: "success" | "error"; message: string };
type ToastApi = { success: (message: string) => void; error: (message: string) => void };

const ToastContext = createContext<ToastApi | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback(
    (tone: Toast["tone"], message: string) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t.slice(-3), { id, tone, message }]);
      setTimeout(() => dismiss(id), tone === "error" ? 7000 : 4000);
    },
    [dismiss],
  );
  const [api] = useState<ToastApi>(() => ({ success: (m) => push("success", m), error: (m) => push("error", m) }));

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-[80] flex flex-col items-end gap-2 sm:left-auto sm:right-6 sm:w-96">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              role={t.tone === "error" ? "alert" : "status"}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.25, ease: easeLux }}
              className={cn(
                "pointer-events-auto flex w-full items-start gap-3 rounded-xl border bg-white px-4 py-3 text-sm shadow-[0_20px_40px_-20px_rgba(6,47,37,0.35)]",
                t.tone === "success" ? "border-emerald/20" : "border-red-800/25",
              )}
            >
              {t.tone === "success" ? (
                <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
              ) : (
                <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-red-800" />
              )}
              <p className="flex-1 text-ink">{t.message}</p>
              <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-muted hover:text-ink">
                <X aria-hidden className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

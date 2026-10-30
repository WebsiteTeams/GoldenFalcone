"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type SubmitState = { status: "idle" | "success" | "error"; message?: string };

export function SubmitButton({ pending, label, pendingLabel = "Sending…" }: { pending: boolean; label: string; pendingLabel?: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={cn(
        "group inline-flex w-full items-center justify-center gap-3 rounded-full bg-forest px-8 py-4 text-sm font-semibold tracking-wide text-ivory transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-emerald active:translate-y-0 sm:w-auto",
        pending && "cursor-wait opacity-80 hover:translate-y-0",
      )}
    >
      {pending ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : null}
      {pending ? pendingLabel : label}
    </button>
  );
}

export function FormError({ state }: { state: SubmitState }) {
  return (
    <AnimatePresence>
      {state.status === "error" ? (
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-start gap-3 rounded-xl border border-red-800/20 bg-red-50 px-4 py-3 text-sm text-red-900"
        >
          <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function FormSuccess({ message, onReset, resetLabel = "Send another enquiry" }: { message?: string; onReset: () => void; resetLabel?: string }) {
  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-start gap-5 rounded-2xl border border-gold/30 bg-white p-8"
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-forest text-gold">
        <CheckCircle2 aria-hidden className="h-6 w-6" />
      </span>
      <div>
        <h3 className="font-serif text-3xl text-forest">Thank you.</h3>
        <p className="mt-2 leading-relaxed text-muted">{message}</p>
      </div>
      <div className="flex flex-wrap gap-5 text-sm font-semibold">
        <button type="button" onClick={onReset} className="link-underline text-forest">
          {resetLabel}
        </button>
        <Link href="/" className="link-underline text-gold-dark">
          Back to home
        </Link>
      </div>
    </motion.div>
  );
}

export function PrivacyConsentLabel({ children }: { children?: React.ReactNode }) {
  return (
    <>
      {children ?? "I agree that Goldenfalcone may store and use the details I provide to respond to this enquiry, as described in the "}
      <Link href="/privacy-policy" className="font-medium text-forest underline decoration-gold/60 underline-offset-2">
        Privacy Policy
      </Link>
      .
    </>
  );
}

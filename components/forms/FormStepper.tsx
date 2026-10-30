"use client";

import { Check, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export type FormStep = { label: string };

/**
 * Editorial step header shared by the staffing and candidate forms.
 * The step list is compact on desktop and reduces to a single line on mobile,
 * where four labels would otherwise be truncated into noise.
 * Does NOT render navigation buttons - the form component renders those.
 */
export function FormStepper({
  steps,
  current,
  ariaLabel = "Form progress",
}: {
  steps: readonly FormStep[];
  current: number;
  ariaLabel?: string;
}) {
  const total = steps.length;
  const progress = ((current + 1) / total) * 100;

  return (
    <nav aria-label={ariaLabel} className="border-b border-line pb-5">
      <div className="flex items-baseline justify-between gap-4 sm:hidden">
        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-gold-dark">
          Step {current + 1} of {total}
        </span>
        <span className="truncate text-sm font-semibold text-forest">{steps[current]?.label}</span>
      </div>

      <ol className="hidden gap-5 sm:flex">
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li
              key={step.label}
              aria-current={active ? "step" : undefined}
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center border text-[0.68rem] font-semibold tabular-nums transition-colors duration-300",
                  active
                    ? "border-forest bg-forest text-ivory"
                    : done
                      ? "border-gold/60 bg-champagne/40 text-forest"
                      : "border-line bg-white text-muted",
                )}
              >
                {done ? <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={2.5} /> : String(index + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "truncate text-[0.8rem] transition-colors duration-300",
                  active ? "font-semibold text-forest" : "text-muted",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 h-px w-full bg-line" aria-hidden>
        <div
          className="h-px bg-gold transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </nav>
  );
}
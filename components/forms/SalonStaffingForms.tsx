"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BriefcaseBusiness, ShieldCheck, UserRound } from "lucide-react";
import { easeLux } from "@/components/animations/motion";
import { cn } from "@/lib/utils";
import { CandidateApplicationForm } from "./CandidateApplicationForm";
import { StaffingRequestForm } from "./StaffingRequestForm";

export type StaffingFormKey = "hiring" | "candidate";

const tabs: {
  key: StaffingFormKey;
  label: string;
  short: string;
  icon: typeof BriefcaseBusiness;
  description: string;
}[] = [
  {
    key: "hiring",
    label: "I Need Salon Staff",
    short: "Hiring",
    icon: BriefcaseBusiness,
    description:
      "Share the role, the skills that matter and the terms you can offer. We review every requirement personally.",
  },
  {
    key: "candidate",
    label: "I'm Looking for a Job",
    short: "Job seeker",
    icon: UserRound,
    description:
      "Build a private professional profile with your skills, experience and certificates. Nothing is shared without your consent.",
  },
];

function readFormFromUrl(): StaffingFormKey | undefined {
  if (typeof window === "undefined") return undefined;
  const value = new URLSearchParams(window.location.search).get("form");
  return value === "hiring" || value === "candidate" ? value : undefined;
}

/** Two recruitment journeys behind one accessible, URL-addressable switcher. */
export function SalonStaffingForms({ initialForm = "hiring" }: { initialForm?: StaffingFormKey }) {
  const [active, setActive] = useState<StaffingFormKey>(initialForm);
  const baseId = useId();

  // The server passes the current ?form value so deep links and back/forward
  // navigation always open the right journey.
  useEffect(() => {
    setActive(initialForm);
  }, [initialForm]);

  useEffect(() => {
    const syncFromUrl = () => {
      const value = readFormFromUrl();
      if (value) setActive(value);
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const select = (next: StaffingFormKey) => {
    setActive(next);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("form", next);
    url.hash = "staffing-forms";
    // Keep the journey in the address bar without forcing a server round trip.
    window.history.replaceState({ form: next }, "", url.toString());
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const keys = tabs.map((tab) => tab.key);
    const index = keys.indexOf(active);
    let next: StaffingFormKey | undefined;

    if (event.key === "ArrowRight") next = keys[(index + 1) % keys.length];
    if (event.key === "ArrowLeft") next = keys[(index - 1 + keys.length) % keys.length];
    if (event.key === "Home") next = keys[0];
    if (event.key === "End") next = keys[keys.length - 1];
    if (!next) return;

    event.preventDefault();
    select(next);
    document.getElementById(`${baseId}-tab-${next}`)?.focus();
  };

  const current = tabs.find((tab) => tab.key === active) ?? tabs[0];

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-gold-dark">Choose your route</p>
          <h3 className="mt-2 font-serif text-3xl text-forest sm:text-4xl">Two journeys. One careful process.</h3>
        </div>
        <p className="flex items-center gap-2 text-xs text-muted">
          <ShieldCheck aria-hidden className="h-4 w-4 text-emerald" />
          Private by default · Reviewed by people
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Choose your staffing journey"
        className="mt-6 grid border border-line bg-white sm:grid-cols-2"
      >
        {tabs.map(({ key, label, short, icon: Icon }) => {
          const selected = key === active;
          return (
            <button
              key={key}
              id={`${baseId}-tab-${key}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(key)}
              onKeyDown={onKeyDown}
              className={cn(
                "group relative flex items-center gap-4 px-5 py-5 text-left transition-colors duration-300 sm:px-6",
                "border-b border-line last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0",
                selected ? "bg-forest text-ivory" : "bg-white text-ink hover:bg-ivory",
              )}
            >
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
                  selected
                    ? "border-gold/50 bg-emerald text-gold"
                    : "border-line bg-ivory text-forest group-hover:border-gold/50",
                )}
              >
                <Icon aria-hidden className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    "block text-[0.65rem] font-semibold uppercase tracking-[0.2em]",
                    selected ? "text-gold" : "text-gold-dark",
                  )}
                >
                  {short}
                </span>
                <span className={cn("mt-1 block font-serif text-xl leading-tight sm:text-2xl", selected ? "text-ivory" : "text-forest")}>
                  {label}
                </span>
              </span>
              <span
                aria-hidden
                className={cn(
                  "ml-auto hidden h-2 w-2 shrink-0 rounded-full sm:block",
                  selected ? "bg-gold" : "bg-line group-hover:bg-gold/60",
                )}
              />
            </button>
          );
        })}
      </div>

      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active}`}
        className="pt-8"
      >
        <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted">{current.description}</p>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: easeLux }}
          >
            {active === "hiring" ? <StaffingRequestForm /> : <CandidateApplicationForm />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

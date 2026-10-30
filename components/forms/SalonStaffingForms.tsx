"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Store, UserRound } from "lucide-react";
import { easeLux } from "@/components/animations/motion";
import { cn } from "@/lib/utils";
import { CandidateApplicationForm } from "./CandidateApplicationForm";
import { StaffingRequestForm } from "./StaffingRequestForm";

type Tab = "salon-owners" | "candidates";

const tabs: {
  key: Tab;
  badge: string;
  label: string;
  subtitle: string;
  icon: typeof Store;
  intro: string;
}[] = [
  {
    key: "salon-owners",
    badge: "For Salons & Spas",
    label: "I'm Hiring",
    subtitle: "Submit your salon's staffing requirements",
    icon: Store,
    intro:
      "Tell us what your business requires. Our team will review your specifications, search our curated talent pool, and coordinate introductions.",
  },
  {
    key: "candidates",
    badge: "For Beauty Professionals",
    label: "I'm Looking for a Job",
    subtitle: "Create your verified professional profile",
    icon: UserRound,
    intro:
      "Build your profile with your specialized skills, certificates, and portfolio. We present matching profiles directly to premier salons.",
  },
];

const fromHash = (): Tab | undefined => {
  const hash = window.location.hash.slice(1);
  return tabs.some((t) => t.key === hash) ? (hash as Tab) : undefined;
};

/** Two recruitment workflows behind an executive tab interface. */
export function SalonStaffingForms() {
  const [active, setActive] = useState<Tab>("salon-owners");
  const baseId = useId();

  useEffect(() => {
    const sync = () => {
      const tab = fromHash();
      if (tab) setActive(tab);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = tabs[(tabs.findIndex((t) => t.key === active) + 1) % tabs.length].key;
    setActive(next);
    document.getElementById(`${baseId}-tab-${next}`)?.focus();
  };

  const current = tabs.find((t) => t.key === active)!;

  return (
    <div className="relative">
      {/* Tab Switcher Header */}
      <div
        role="tablist"
        aria-label="Choose recruitment pathway"
        className="grid gap-3 rounded-2xl border border-line/80 bg-ivory p-2 sm:grid-cols-2"
      >
        {tabs.map(({ key, label, subtitle, badge, icon: Icon }) => {
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
              onClick={() => setActive(key)}
              onKeyDown={onKeyDown}
              className={cn(
                "group relative flex items-start gap-4 rounded-xl p-4 text-left transition-all duration-300 sm:p-5",
                selected
                  ? "text-ivory shadow-lg shadow-forest/10"
                  : "bg-transparent text-muted hover:bg-white/80 hover:text-forest",
              )}
            >
              {selected ? (
                <motion.span
                  layoutId={`${baseId}-pill`}
                  className="absolute inset-0 rounded-xl bg-forest"
                  transition={{ duration: 0.45, ease: easeLux }}
                />
              ) : null}

              <div
                className={cn(
                  "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors duration-300 sm:h-11 sm:w-11",
                  selected
                    ? "border-gold/40 bg-emerald/60 text-gold"
                    : "border-line bg-white text-forest group-hover:border-gold/50 group-hover:text-gold-dark",
                )}
              >
                <Icon aria-hidden className="h-5 w-5" strokeWidth={1.75} />
              </div>

              <div className="relative min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-[0.65rem] font-bold uppercase tracking-wider",
                      selected ? "text-gold" : "text-gold-dark",
                    )}
                  >
                    {badge}
                  </span>
                  {selected && (
                    <Sparkles className="h-3 w-3 text-gold animate-pulse" aria-hidden />
                  )}
                </div>
                <h3
                  className={cn(
                    "mt-0.5 font-serif text-xl font-medium sm:text-2xl",
                    selected ? "text-ivory" : "text-forest",
                  )}
                >
                  {label}
                </h3>
                <p
                  className={cn(
                    "mt-0.5 line-clamp-1 text-xs",
                    selected ? "text-ivory/70" : "text-muted",
                  )}
                >
                  {subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Description Banner */}
      <div className="mt-8 rounded-xl border border-line/60 bg-ivory-dark/40 px-5 py-3.5">
        <p className="text-sm leading-relaxed text-ink/80">
          <span className="font-semibold text-forest">Current Selection:</span>{" "}
          {current.intro}
        </p>
      </div>

      {/* Form Container */}
      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active}`}
        className="mt-8"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: easeLux }}
          >
            {active === "salon-owners" ? (
              <StaffingRequestForm />
            ) : (
              <CandidateApplicationForm />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

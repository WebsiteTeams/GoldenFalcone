"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { easeLux } from "@/components/animations/motion";
import { cn } from "@/lib/utils";

type Item = { q: string; a: string };

export function Accordion({ items, tone = "light" }: { items: Item[]; tone?: "light" | "dark" }) {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();
  const dark = tone === "dark";

  return (
    <div className={cn("divide-y border-y", dark ? "divide-white/15 border-white/15" : "divide-line border-line")}>
      {items.map((item, i) => {
        const expanded = open === i;
        const buttonId = `${baseId}-b${i}`;
        const panelId = `${baseId}-p${i}`;
        return (
          <div key={item.q}>
            <h3 className="font-sans">
              <button
                id={buttonId}
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? null : i)}
                className={cn(
                  "flex w-full items-center justify-between gap-6 py-6 text-left font-serif transition-colors",
                  dark ? "text-base font-semibold text-white hover:text-tech-light sm:text-lg" : "text-xl text-forest hover:text-gold-dark sm:text-2xl",
                )}
              >
                {item.q}
                <span
                  className={cn(
                    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-[transform,background-color,border-color] duration-300",
                    expanded
                      ? "rotate-45 border-gold bg-gold text-forest"
                      : dark
                        ? "border-white/30 text-white"
                        : "border-line text-forest",
                  )}
                >
                  <Plus aria-hidden className="h-4 w-4" />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {expanded ? (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: easeLux }}
                  className="overflow-hidden"
                >
                  <p className={cn("max-w-3xl pb-7 leading-relaxed", dark ? "text-white/75" : "text-muted")}>{item.a}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

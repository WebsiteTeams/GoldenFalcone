"use client";

import { motion } from "framer-motion";
import { StaggerList, StaggerListItem } from "@/components/animations";
import { easeLux, viewportOnce } from "@/components/animations/motion";
import { processSteps } from "./content";

/** Connected process: a vertical timeline on small screens, horizontal from the lg breakpoint. */
export function ProcessTimeline() {
  return (
    <div className="relative mt-14 lg:mt-20">
      <div aria-hidden className="absolute left-[8.33%] right-[8.33%] top-6 hidden h-px bg-line lg:block" />
      <motion.div
        aria-hidden
        className="absolute left-[8.33%] right-[8.33%] top-6 hidden h-px origin-left bg-tech-blue lg:block"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={viewportOnce}
        transition={{ duration: 1.6, ease: easeLux }}
      />
      <StaggerList className="relative grid gap-10 lg:grid-cols-6 lg:gap-6" gap={0.14}>
        {processSteps.map((step, i) => (
          <StaggerListItem key={step.title} className="relative flex gap-5 lg:flex-col lg:items-center lg:gap-0 lg:text-center">
            {i < processSteps.length - 1 ? <span aria-hidden className="absolute -bottom-10 left-6 top-12 w-px bg-line lg:hidden" /> : null}
            <span className="relative z-10 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-tech-blue/30 bg-white text-tech-blue shadow-[0_0_0_6px_#ffffff]">
              <step.icon aria-hidden className="h-5 w-5" strokeWidth={1.6} />
            </span>
            <div className="lg:mt-6">
              <p className="text-xs font-bold tracking-widest text-tech-blue">0{i + 1}</p>
              <h3 className="mt-1.5 text-lg leading-snug text-forest lg:text-base">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
            </div>
          </StaggerListItem>
        ))}
      </StaggerList>
    </div>
  );
}

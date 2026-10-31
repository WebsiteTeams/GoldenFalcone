import { RevealUp, StaggerList, StaggerListItem, TextReveal } from "@/components/animations";

const reasons = [
  { title: "Diversified Business Ventures", text: "Four distinct ventures under one brand, each focused on its own field." },
  { title: "Purpose-Driven Approach", text: "Every venture exists to serve a clear need for the people it works with." },
  { title: "Commitment to Quality", text: "The same standard of care applies across every venture, from the first enquiry onward." },
  { title: "Customer-Focused Service", text: "We listen first, then respond to what each customer actually needs." },
  { title: "Long-Term Relationships", text: "We aim to build working relationships that last beyond a single project." },
];

export function WhyGoldenfalcone() {
  return (
    <section className="grain relative overflow-hidden bg-emerald py-20 text-ivory sm:py-28">
      <div className="container-lux relative grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:sticky lg:top-32 lg:col-span-5 lg:self-start">
          <RevealUp distance={14}>
            <p className="eyebrow flex items-center gap-3 text-champagne">
              <span aria-hidden className="h-px w-8 bg-current" />
              Why Goldenfalcone
            </p>
          </RevealUp>
          <TextReveal
            lines={["A Vision That Connects", "Different Opportunities."]}
            accentIndex={1}
            accentClassName="italic text-champagne"
            className="mt-6 text-[2.6rem] leading-[1.05] xs:text-5xl sm:text-6xl"
          />
        </div>
        <StaggerList className="border-t border-gold/40 lg:col-span-6 lg:col-start-7">
          {reasons.map((reason, i) => (
            <StaggerListItem key={reason.title} className="group grid grid-cols-[2.5rem_1fr] gap-x-3 border-b border-ivory/15 py-6 sm:py-7">
              <span className="pt-2 font-sans text-xs font-semibold tracking-[0.2em] text-champagne">0{i + 1}</span>
              <div>
                <h3 className="text-[1.65rem] leading-tight text-ivory transition-colors duration-300 group-hover:text-champagne sm:text-[2rem]">{reason.title}</h3>
                <p className="mt-2 leading-relaxed text-ivory/75">{reason.text}</p>
              </div>
            </StaggerListItem>
          ))}
        </StaggerList>
      </div>
    </section>
  );
}

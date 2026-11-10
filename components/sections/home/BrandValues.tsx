import { Gem, Handshake, Landmark, type LucideIcon, Shield, TreeDeciduous } from "lucide-react";
import { RevealUp, StaggerContainer, StaggerItem, TextReveal } from "@/components/animations";
import type { BrandValue } from "@/lib/content";

const icons: Record<string, LucideIcon> = {
  integrity: Gem,
  loyalty: Handshake,
  respect: Landmark,
  strength: Shield,
  legacy: TreeDeciduous,
};

const numerals = ["I", "II", "III", "IV", "V"];

/** Each value stands as a pillar; the row steps down in a gentle stagger on large screens. */
export function BrandValues({ values }: { values: BrandValue[] }) {
  return (
    <section className="surface-white fade-from-white relative overflow-hidden py-28 sm:py-40">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div aria-hidden className="absolute -right-40 top-10 h-[34rem] w-[34rem] rounded-full bg-gold/[0.07] blur-3xl" />

      <div className="container-lux relative">
        <div className="grid items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <RevealUp distance={14}>
              <p className="eyebrow flex items-center gap-4 text-gold-deep">
                <span aria-hidden className="h-px w-12 bg-gold" />
                Our Philosophy
              </p>
            </RevealUp>
            <TextReveal
              lines={["Built on Values.", "Driven by Vision."]}
              accentIndex={1}
              accentClassName="italic gold-text-dark"
              className="mt-7 text-[2.75rem] leading-[1.03] text-forest xs:text-5xl sm:text-7xl"
            />
          </div>
          <RevealUp delay={0.15} className="lg:col-span-4 lg:col-start-9">
            <p className="border-l border-gold/60 pl-6 font-serif text-xl italic leading-snug text-forest/80 sm:text-2xl">
              Five principles that shape every conversation, agreement and relationship.
            </p>
          </RevealUp>
        </div>

        <StaggerContainer className="mt-16 grid gap-5 sm:grid-cols-2 lg:mt-24 lg:grid-cols-5 lg:items-start lg:gap-4">
          {values.map((value, i) => {
            const Icon = icons[value.name.toLowerCase()] ?? Gem;
            return (
              <StaggerItem key={value.name} className={i % 2 === 1 ? "lg:mt-14" : ""}>
                <article className="group relative flex h-full min-h-[22rem] flex-col overflow-hidden rounded-t-[5rem] rounded-b-2xl border border-gold/40 bg-[linear-gradient(180deg,#0d4d3a_0%,#0a3d2e_50%,#050706_100%)] ring-1 ring-inset ring-white/5 px-6 pb-8 pt-12 shadow-[0_30px_60px_-30px_rgba(6,47,37,0.8)] transition-all duration-500 hover:-translate-y-2 hover:border-gold/70 hover:shadow-[0_40px_80px_-25px_rgba(212,164,55,0.35)] motion-reduce:hover:translate-y-0">
                  <div aria-hidden className="absolute inset-x-6 top-3 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
                  <span aria-hidden className="absolute -right-2 bottom-0 select-none font-serif text-[7rem] italic leading-none text-gold/[0.08] transition-colors duration-500 group-hover:text-gold/[0.16]">
                    {numerals[i] ?? i + 1}
                  </span>
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold/50 bg-gold/10 text-gold transition-colors duration-500 group-hover:bg-gold group-hover:text-forest">
                    <Icon aria-hidden className="h-6 w-6" strokeWidth={1.3} />
                  </span>
                  <h3 className="mt-7 text-center text-[1.9rem] leading-none text-champagne">{value.name}</h3>
                  <span aria-hidden className="mx-auto mt-4 h-px w-10 bg-gold/60 transition-all duration-500 group-hover:w-20" />
                  <p className="relative mt-5 text-center text-sm leading-relaxed text-ivory/70">{value.text}</p>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}

import { Gem, Handshake, Landmark, type LucideIcon, Shield, TreeDeciduous } from "lucide-react";
import { RevealUp, StaggerContainer, StaggerItem, TextReveal } from "@/components/animations";
import type { BrandValue } from "@/lib/content";
import { GoldRule } from "./GoldRule";

const icons: Record<string, LucideIcon> = {
  integrity: Gem,
  loyalty: Handshake,
  respect: Landmark,
  strength: Shield,
  legacy: TreeDeciduous,
};

export function BrandValues({ values }: { values: BrandValue[] }) {
  return (
    <section className="bg-ivory py-20 sm:py-28">
      <div className="container-lux">
        <div className="grid items-end gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <RevealUp distance={14}>
              <p className="eyebrow flex items-center gap-3 text-gold-deep">
                <span aria-hidden className="h-px w-8 bg-current" />
                Our Philosophy
              </p>
            </RevealUp>
            <TextReveal
              lines={["Built on Values.", "Driven by Vision."]}
              accentIndex={1}
              accentClassName="italic text-gold-dark"
              className="mt-6 text-[2.75rem] leading-[1.03] text-forest xs:text-5xl sm:text-7xl"
            />
          </div>
        </div>

        <GoldRule className="mt-12 sm:mt-16" />
        <StaggerContainer
          className="grid divide-y divide-line lg:grid-cols-[repeat(var(--count),minmax(0,1fr))] lg:divide-x lg:divide-y-0"
          style={{ "--count": values.length } as React.CSSProperties}
        >
          {values.map((value) => {
            const Icon = icons[value.name.toLowerCase()] ?? Gem;
            return (
              <StaggerItem key={value.name} className="group grid grid-cols-[3.25rem_1fr] gap-x-3 py-7 lg:block lg:px-6 lg:py-10 lg:first:pl-0 lg:last:pr-0">
                <Icon aria-hidden className="h-8 w-8 text-gold-dark transition-transform duration-500 group-hover:-translate-y-1 motion-reduce:group-hover:translate-y-0" strokeWidth={1.15} />
                <div>
                  <h3 className="text-[2rem] leading-none text-gold-dark lg:mt-7 xl:text-[2.4rem]">{value.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted lg:mt-4">{value.text}</p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}

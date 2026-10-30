import Link from "next/link";
import { ArrowRight, Code2, GraduationCap, Leaf, Scissors } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/animations";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getDivisions } from "@/lib/cms";
import type { ServiceKey } from "@/lib/content";

const icons: Record<ServiceKey, typeof Leaf> = {
  spices: Leaf,
  mentorship: GraduationCap,
  digital: Code2,
  staffing: Scissors,
};

export async function FeaturedServices() {
  const divisions = await getDivisions();
  return (
    <section className="bg-ivory py-24 sm:py-32">
      <div className="container-lux">
        <SectionHeading
          align="center"
          eyebrow="Featured Services"
          title={["What you can", "explore with us."]}
          intro="A closer look at the offerings within each division."
        />
        <StaggerContainer className="mt-16 grid gap-px overflow-hidden rounded-[1.5rem] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {divisions.map((d) => {
            const Icon = icons[d.key];
            return (
              <StaggerItem key={d.key} className="group flex flex-col bg-ivory p-8 transition-colors duration-500 hover:bg-white">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 text-gold-dark transition-colors duration-300 group-hover:bg-forest group-hover:text-gold">
                  <Icon aria-hidden className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <h3 className="mt-6 text-2xl text-forest">{d.title}</h3>
                <ul className="mt-5 flex-1 space-y-2.5 text-sm text-muted">
                  {d.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-3">
                      <span aria-hidden className="h-px w-3 bg-gold" />
                      {h}
                    </li>
                  ))}
                </ul>
                <Link href={d.href} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-forest">
                  <span className="link-underline">Learn more</span>
                  <span className="sr-only"> about {d.title}</span>
                  <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}

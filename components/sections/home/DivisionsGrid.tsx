import { StaggerContainer } from "@/components/animations";
import { DivisionCard } from "@/components/services/DivisionCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getDivisions } from "@/lib/cms";

export async function DivisionsGrid() {
  const divisions = await getDivisions();
  return (
    <section id="businesses" className="scroll-mt-16 bg-ivory-dark/60 py-24 sm:py-32">
      <div className="container-lux">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading eyebrow="Our Business Divisions" title={["Four dimensions,", "one standard of care."]} />
          <p className="max-w-md leading-relaxed text-muted lg:pb-2">
            Explore each division to learn what we offer, who it is for and how to begin a conversation with us.
          </p>
        </div>
        <StaggerContainer className="mt-16 grid gap-6 md:grid-cols-2 lg:gap-8" gap={0.12}>
          {divisions.map((d) => (
            <DivisionCard key={d.key} division={d} />
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/animations";
import { PageHero } from "@/components/sections/PageHero";
import { ContactSection } from "@/components/sections/ContactSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { divisions, images, type ServiceKey } from "@/lib/content";
import { pageMetadata } from "@/lib/cms";

export const generateMetadata = () =>
  pageMetadata("contact", {
    title: "Contact Us",
    description:
      "Contact Goldenfalcone about whole spices, trading mentorship, digital projects or salon staffing. Send an enquiry and we will respond personally.",
    alternates: { canonical: "/contact" },
    openGraph: { title: "Contact Goldenfalcone", url: "/contact" },
  });

// Where each division's dedicated enquiry form lives.
const divisionForms: Record<ServiceKey, string> = {
  spices: "/spices#bulk-enquiry",
  mentorship: "/trading-mentorship#consultation",
  digital: "/digital-solutions#project-enquiry",
  staffing: "/salon-staffing#salon-owners",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact & Enquiries"
        title={["Let's Work", "Together."]}
        intro="Whatever brings you to Goldenfalcone, the first step is a conversation. Share a few details and we will respond personally."
        image={images.corporateTowers}
        imageAlt="Looking up at modern glass office towers"
      />

      <ContactSection
        id="enquiry"
        eyebrow="General Enquiry"
        title={["Tell us what", "you have in mind."]}
      />

      <section className="bg-ivory-dark/60 py-24 sm:py-32">
        <div className="container-lux">
          <SectionHeading
            eyebrow="Division Enquiries"
            title={["Know exactly", "what you need?"]}
            intro="Each division has a dedicated form that asks the right questions up front, so our first reply can be more useful."
          />
          <StaggerContainer className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {divisions.map((d) => (
              <StaggerItem key={d.key}>
                <Link
                  href={divisionForms[d.key]}
                  className="group flex h-full flex-col rounded-[1.5rem] border border-line bg-white p-7 transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-gold/50"
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="eyebrow text-gold-dark">{d.number}</span>
                    <ArrowUpRight
                      aria-hidden
                      className="h-4 w-4 text-gold transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                  <h3 className="mt-5 text-2xl text-forest">{d.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{d.description}</p>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </>
  );
}

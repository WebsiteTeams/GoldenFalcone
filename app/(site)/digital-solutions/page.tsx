import { AppWindow, Building2, CalendarCheck, Cpu, LayoutTemplate, Wrench } from "lucide-react";
import {
  AnimatedButton,
  ImageReveal,
  RevealUp,
  StaggerContainer,
  StaggerItem,
  StaggerList,
  StaggerListItem,
} from "@/components/animations";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { digitalProcess, digitalServices, images, portfolioConcepts } from "@/lib/content";
import { DigitalServiceCard, PortfolioCard } from "@/components/services/CatalogueItems";
import { getPublishedDigital, pageMetadata } from "@/lib/cms";

export const revalidate = 3600;

export const generateMetadata = () =>
  pageMetadata("digital", {
    title: "Website Development & Digital Solutions",
    description:
      "Corporate websites, landing pages, web applications, booking systems and custom business software from Goldenfalcone — plus maintenance and basic SEO.",
    alternates: { canonical: "/digital-solutions" },
    openGraph: { title: "Digital Solutions | Goldenfalcone", url: "/digital-solutions" },
  });

const serviceIcons = [Building2, LayoutTemplate, AppWindow, CalendarCheck, Cpu, Wrench];

const principles = [
  "Responsive on every screen size",
  "Built for speed and Core Web Vitals",
  "Accessible, semantic markup",
  "Search-ready metadata and structure",
];

export default async function DigitalSolutionsPage() {
  // Published services / projects from the admin panel replace the built-in lists once at least one exists.
  const managed = await getPublishedDigital();
  const showsClientWork = managed.projects.some((p) => !p.isConcept);
  return (
    <>
      <PageHero
        eyebrow="Division 03 · Digital Solutions"
        title={["Ideas, Engineered", "into Experiences."]}
        intro="Websites, applications and business software designed around how your customers behave and how your team actually works."
        image={images.digitalWorkspace}
        imageAlt="Laptop with code editor open on a minimal desk"
        actions={
          <>
            <AnimatedButton href="#project-enquiry">Start a Project</AnimatedButton>
            <AnimatedButton href="#services" variant="outline-light" arrow={false}>
              Our Services
            </AnimatedButton>
          </>
        }
      />

      {/* Introduction */}
      <section className="bg-ivory py-24 sm:py-32">
        <div className="container-lux grid items-center gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHeading
              eyebrow="The Digital Division"
              title={["Practical technology,", "carefully crafted."]}
              intro="We build digital products that are clear to use, quick to load and simple to maintain — whether you need a polished company website or a tool that replaces a tangle of spreadsheets."
            />
            <StaggerContainer className="mt-10 grid gap-3 sm:grid-cols-2" delay={0.1}>
              {principles.map((p) => (
                <StaggerItem key={p} className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3.5 text-sm text-ink">
                  <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {p}
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
          <div className="lg:col-span-6">
            <ImageReveal
              src={images.digitalDashboard}
              alt="Laptop displaying an analytics dashboard"
              sizes="(min-width: 1024px) 50vw, 100vw"
              wrapperClassName="aspect-[4/3] rounded-[1.5rem]"
              direction="left"
            />
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="scroll-mt-20 bg-forest py-24 text-ivory sm:py-32">
        <div className="container-lux">
          <SectionHeading
            tone="light"
            eyebrow="What We Build"
            title={["Six ways we help", "businesses go digital."]}
          />
          <StaggerContainer className="mt-16 grid gap-px overflow-hidden rounded-[1.5rem] border border-ivory/10 bg-ivory/10 sm:grid-cols-2 lg:grid-cols-3">
            {managed.services.length
              ? managed.services.map((s) => (
                  <StaggerItem key={s.id}>
                    <DigitalServiceCard service={s} />
                  </StaggerItem>
                ))
              : digitalServices.map((s, i) => {
              const Icon = serviceIcons[i];
              return (
                <StaggerItem key={s.title} className="group bg-forest p-8 transition-colors duration-500 hover:bg-emerald/60 sm:p-10">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 text-gold transition-colors duration-300 group-hover:bg-gold group-hover:text-forest">
                    <Icon aria-hidden className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <h3 className="mt-7 text-2xl text-ivory sm:text-[1.75rem]">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ivory/65">{s.text}</p>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Portfolio */}
      <section className="bg-ivory py-24 sm:py-32">
        <div className="container-lux">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeading eyebrow="Portfolio" title={["The kinds of work", "we take on."]} />
            <RevealUp className="max-w-md lg:pb-2">
              <p className="leading-relaxed text-muted">
                {showsClientWork
                  ? "A selection of our work. Items marked “Concept” illustrate a project type rather than client work."
                  : "Concept showcases illustrating each project type. Live client work is shared on request during your consultation."}
              </p>
            </RevealUp>
          </div>
          <StaggerContainer className="mt-14 grid gap-6 md:grid-cols-3" gap={0.12}>
            {managed.projects.length
              ? managed.projects.map((p) => (
                  <StaggerItem key={p.id}>
                    <PortfolioCard project={p} />
                  </StaggerItem>
                ))
              : portfolioConcepts.map((p) => (
              <StaggerItem key={p.title} className="group">
                <ImageReveal
                  src={p.image}
                  alt={p.alt}
                  sizes="(min-width: 768px) 33vw, 100vw"
                  wrapperClassName="aspect-[4/5] rounded-[1.5rem]"
                  className="transition-transform duration-[1200ms] ease-[var(--ease-lux)] group-hover:scale-[1.04]"
                />
                <p className="eyebrow mt-6 text-gold-dark">{p.category}</p>
                <h3 className="mt-2 text-3xl text-forest">{p.title}</h3>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Process */}
      <section className="bg-ivory-dark/60 py-24 sm:py-32">
        <div className="container-lux">
          <SectionHeading
            eyebrow="Our Process"
            title={["Five clear steps,", "no surprises."]}
            intro="You always know what happens next, what it costs and when it will be ready."
          />
          <StaggerList className="mt-16 grid gap-px overflow-hidden rounded-[1.5rem] border border-line bg-line md:grid-cols-5">
            {digitalProcess.map((p) => (
              <StaggerListItem key={p.step} className="flex flex-col bg-ivory p-7">
                <span className="font-serif text-5xl text-gold">{p.step}</span>
                <h3 className="mt-6 text-2xl text-forest">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{p.text}</p>
              </StaggerListItem>
            ))}
          </StaggerList>
        </div>
      </section>

      {/* Enquiry */}
      <section id="project-enquiry" className="scroll-mt-20 bg-ivory py-24 sm:py-32">
        <div className="container-lux grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading
              eyebrow="Project Enquiry"
              title={["Tell us about", "your project."]}
              intro="A short description is enough to begin. We will reply with questions, an approach and next steps."
            />
            <RevealUp delay={0.2} className="mt-8">
              <WhatsAppButton message="Hello Goldenfalcone, I would like to discuss a website or software project." label="Discuss on WhatsApp" />
            </RevealUp>
          </div>
          <RevealUp delay={0.1} className="lg:col-span-8">
            <div className="rounded-[1.5rem] border border-line bg-white p-6 sm:p-10">
              <EnquiryForm variant="digital" />
            </div>
          </RevealUp>
        </div>
      </section>
    </>
  );
}

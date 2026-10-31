import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { AnimatedButton, RevealUp, StaggerContainer, StaggerItem } from "@/components/animations";
import { benefits, enquiryHref, faqs, services, solutions, technologies, type ServiceKey } from "@/components/digital/content";
import {
  CtaDevices,
  DashboardWindow,
  HeroDevices,
  PhoneComposition,
  SoftwareEcosystem,
  WebsiteComposition,
} from "@/components/digital/Illustrations";
import { ProcessTimeline } from "@/components/digital/ProcessTimeline";
import { DigitalEnquiryForm } from "@/components/forms/DigitalEnquiryForm";
import { DigitalServiceCard, PortfolioCard } from "@/components/services/CatalogueItems";
import { Accordion } from "@/components/ui/Accordion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { getPublishedDigital, pageMetadata } from "@/lib/cms";

export const revalidate = 3600;

export const generateMetadata = () =>
  pageMetadata("digital", {
    title: "Website, Mobile App & Custom Software Development",
    description:
      "Goldenfalcone builds websites, mobile applications, web applications and custom business software designed around your business requirements.",
    alternates: { canonical: "/digital-solutions" },
    openGraph: { title: "Digital Solutions | Goldenfalcone", url: "/digital-solutions" },
  });

const heading = "text-[1.75rem] leading-[1.15] sm:text-[2.5rem] lg:text-[3rem]";

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-navy pt-32 text-white sm:pt-40">
      <div aria-hidden className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,#0d4fa8_0%,#071d3a_55%,#06152e_100%)]" />
      <div aria-hidden className="digital-grid absolute inset-0 -z-10" />
      <svg aria-hidden className="absolute inset-0 -z-10 hidden h-full w-full xl:block" preserveAspectRatio="none" viewBox="0 0 1000 600">
        <g stroke="#6cb4ff" strokeOpacity=".22" fill="none">
          <path d="M60 110 L210 190 L120 330" />
          <path d="M940 90 L800 210 L900 340" />
        </g>
        {[
          [60, 110],
          [210, 190],
          [120, 330],
          [940, 90],
          [800, 210],
          [900, 340],
        ].map(([cx, cy], i) => (
          <circle key={`${cx}-${cy}`} className="digital-node" style={{ animationDelay: `${i * 0.6}s` }} cx={cx} cy={cy} r="2.5" fill="#6cb4ff" />
        ))}
      </svg>

      <div className="container-lux text-center">
        <RevealUp distance={14}>
          <p className="eyebrow text-[#e3bd63]">Digital Solutions</p>
        </RevealUp>
        <RevealUp delay={0.05} distance={20}>
          <h1 className="mx-auto mt-5 max-w-5xl text-[2.35rem] font-bold leading-[1.08] sm:text-6xl lg:text-7xl">
            We Turn Business Ideas Into Powerful Digital Solutions.
          </h1>
        </RevealUp>
        <RevealUp delay={0.12} distance={20}>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
            From business websites to intelligent applications and custom software, we build digital experiences that help businesses operate
            smarter, connect with customers, and grow.
          </p>
        </RevealUp>
        <RevealUp delay={0.18} distance={20} className="mt-9 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <AnimatedButton href="#project-enquiry" variant="tech">
            Discuss Your Project
          </AnimatedButton>
          <AnimatedButton href="#services" variant="outline-light" arrow={false}>
            Explore Our Services
          </AnimatedButton>
        </RevealUp>
        <RevealUp delay={0.25} className="mt-14 sm:mt-16">
          <HeroDevices />
        </RevealUp>
      </div>
    </section>
  );
}

function ServiceCopy({ service, index, tone = "light" }: { service: ServiceKey; index: number; tone?: "light" | "dark" }) {
  const s = services[service];
  const dark = tone === "dark";
  return (
    <>
      <p className={`text-sm font-bold tracking-widest ${dark ? "text-[#e3bd63]" : "text-tech-blue"}`}>0{index}</p>
      <h3 className={`mt-3 text-[1.65rem] leading-tight sm:text-4xl ${dark ? "text-white" : "text-forest"}`}>{s.title}</h3>
      <p className={`mt-4 leading-relaxed sm:text-lg ${dark ? "text-white/75" : "text-muted"}`}>{s.description}</p>
      <ul className="mt-7 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {s.capabilities.map((item) => (
          <li key={item} className={`flex items-start gap-3 text-sm leading-snug sm:text-[0.95rem] ${dark ? "text-white/90" : "text-ink"}`}>
            <Check aria-hidden className={`mt-0.5 h-4 w-4 shrink-0 ${dark ? "text-tech-bright" : "text-tech-blue"}`} strokeWidth={2.25} />
            {item}
          </li>
        ))}
      </ul>
      <AnimatedButton href={enquiryHref(service)} variant="tech" className="mt-8 w-full sm:w-auto">
        {s.cta}
      </AnimatedButton>
    </>
  );
}

const reveal = "transition-transform duration-500 ease-[var(--ease-lux)] hover:-translate-y-1.5 motion-reduce:hover:translate-y-0";

function Services() {
  return (
    <section id="services" className="scroll-mt-20">
      <div className="container-lux pt-20 sm:pt-28">
        <SectionHeading
          eyebrow="What We Build"
          title={["Digital Solutions Designed Around Your Business"]}
          accentIndex={null}
          intro="Explore our development services, designed to turn business requirements into practical, reliable digital products."
        />
      </div>

      {/* Website: copy beside a desktop and phone pairing */}
      <div id={services.website.id} className="container-lux grid scroll-mt-24 items-center gap-12 py-16 sm:py-20 lg:grid-cols-12 lg:gap-14">
        <RevealUp className="lg:col-span-6">
          <ServiceCopy service="website" index={1} />
        </RevealUp>
        <RevealUp delay={0.1} className={`lg:col-span-6 ${reveal}`}>
          <WebsiteComposition />
        </RevealUp>
      </div>

      {/* Mobile: full-width light band with phones leading */}
      <div id={services.mobile.id} className="scroll-mt-20 bg-tech-light">
        <div className="container-lux grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-12 lg:gap-14">
          <RevealUp className={`order-last lg:order-first lg:col-span-6 ${reveal}`}>
            <PhoneComposition />
          </RevealUp>
          <RevealUp delay={0.1} className="lg:col-span-6">
            <ServiceCopy service="mobile" index={2} />
          </RevealUp>
        </div>
      </div>

      {/* Web applications: dark band, with the dashboard across the full content width */}
      <div id={services.webapp.id} className="relative isolate scroll-mt-20 overflow-hidden bg-navy-2">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_85%_100%,rgba(8,102,217,0.55),transparent)]" />
        <div className="container-lux py-16 sm:py-24">
          <RevealUp className="max-w-4xl">
            <ServiceCopy service="webapp" index={3} tone="dark" />
          </RevealUp>
          <RevealUp delay={0.1} className={`mt-12 shadow-[0_40px_90px_-35px_rgba(0,0,0,0.85)] sm:mt-14 ${reveal}`}>
            <DashboardWindow />
          </RevealUp>
        </div>
      </div>

      {/* Custom software: connected modules beside the copy */}
      <div id={services.custom.id} className="container-lux grid scroll-mt-24 items-center gap-12 py-16 sm:py-24 lg:grid-cols-12 lg:gap-14">
        <RevealUp className="lg:col-span-5">
          <ServiceCopy service="custom" index={4} />
        </RevealUp>
        <RevealUp delay={0.1} className="rounded-2xl border border-line bg-tech-soft p-4 sm:p-8 lg:col-span-7">
          <SoftwareEcosystem />
        </RevealUp>
      </div>
    </section>
  );
}

/** Services and projects published from the admin panel appear here once at least one exists. */
function ManagedContent({ managed }: { managed: Awaited<ReturnType<typeof getPublishedDigital>> }) {
  const showsClientWork = managed.projects.some((p) => !p.isConcept);
  return (
    <>
      {managed.services.length ? (
        <section className="bg-navy py-20 text-white sm:py-24">
          <div className="container-lux">
            <SectionHeading tone="light" eyebrow="Service Packages" title={["More Ways We Can Help"]} accentIndex={null} />
            <StaggerContainer className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
              {managed.services.map((s) => (
                <StaggerItem key={s.id}>
                  <DigitalServiceCard service={s} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      ) : null}
      {managed.projects.length ? (
        <section className="py-20 sm:py-24">
          <div className="container-lux">
            <SectionHeading
              eyebrow="Portfolio"
              title={["Examples of Our Work"]}
              accentIndex={null}
              intro={
                showsClientWork
                  ? "A selection of our work. Items marked “Concept” illustrate a project type rather than client work."
                  : "Concept showcases illustrating each project type. Live client work is shared on request during your consultation."
              }
            />
            <StaggerContainer className="mt-12 grid gap-6 md:grid-cols-3" gap={0.12}>
              {managed.projects.map((p) => (
                <StaggerItem key={p.id}>
                  <PortfolioCard project={p} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      ) : null}
    </>
  );
}

function Solutions() {
  return (
    <section className="bg-tech-soft py-20 sm:py-28">
      <div className="container-lux">
        <SectionHeading eyebrow="Solutions for Your Business" title={["Technology That Solves Real Business Challenges"]} accentIndex={null} />
        <StaggerContainer className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((item) => (
            <StaggerItem key={item.title} className="group bg-white p-7 transition-colors duration-300 hover:bg-tech-light sm:p-9">
              <item.icon aria-hidden className="h-8 w-8 text-tech-blue transition-transform duration-300 group-hover:-translate-y-0.5" strokeWidth={1.4} />
              <h3 className="mt-5 text-lg text-forest">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
            </StaggerItem>
          ))}
        </StaggerContainer>
        <RevealUp>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted">
            These are examples of solutions that can be developed around your requirements. Each one is scoped and built for your project, not
            sold as a ready-made product.
          </p>
        </RevealUp>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container-lux">
        <SectionHeading eyebrow="How We Work" title={["From Your Idea to a Working Digital Product"]} accentIndex={null} />
        <ProcessTimeline />
      </div>
    </section>
  );
}

function Technology() {
  return (
    <section className="border-y border-line bg-tech-soft py-20 sm:py-24">
      <div className="container-lux">
        <SectionHeading eyebrow="Our Technology" title={["Built With Modern Development Technologies"]} accentIndex={null} />
        <dl className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {technologies.map((group) => (
            <RevealUp key={group.group} className="border-t-2 border-tech-blue pt-5">
              <dt className="flex items-center gap-3 font-bold text-forest">
                <group.icon aria-hidden className="h-5 w-5 text-tech-blue" strokeWidth={1.6} />
                {group.group}
              </dt>
              {group.items.map((item) => (
                <dd key={item} className="mt-3 text-[0.95rem] text-muted">
                  {item}
                </dd>
              ))}
            </RevealUp>
          ))}
        </dl>
      </div>
    </section>
  );
}

function WhyGoldenfalcone() {
  return (
    <section className="relative isolate overflow-hidden bg-navy-2 py-20 text-white sm:py-28">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_55%_70%_at_0%_0%,rgba(8,102,217,0.45),transparent)]" />
      <div className="container-lux grid gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <SectionHeading tone="light" eyebrow="Why Goldenfalcone" title={["A Development Partner Focused on Your Business Goals"]} accentIndex={null} />
        </div>
        <StaggerContainer className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:col-span-7 lg:pt-10">
          {benefits.map((b) => (
            <StaggerItem key={b.title}>
              <b.icon aria-hidden className="h-7 w-7 text-[#e3bd63]" strokeWidth={1.4} />
              <h3 className="mt-4 text-lg text-white">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{b.text}</p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

function ProjectCta() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-lux">
        <RevealUp className="grid items-center gap-10 overflow-hidden rounded-2xl border border-tech-blue/15 bg-tech-light p-7 sm:p-12 lg:grid-cols-2 lg:gap-12 lg:p-16">
          <div>
            <h2 className={`text-forest ${heading}`}>Have a Digital Project in Mind?</h2>
            <p className="mt-4 max-w-lg leading-relaxed text-muted sm:text-lg">
              Let&apos;s discuss your idea and find the right digital solution for your business.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <AnimatedButton href="#project-enquiry" variant="tech">
                Start Your Project
              </AnimatedButton>
              <AnimatedButton href="/contact" variant="outline-dark" arrow={false}>
                Contact Our Team
              </AnimatedButton>
            </div>
          </div>
          <div className="pb-[6%]">
            <CtaDevices />
          </div>
        </RevealUp>
      </div>
    </section>
  );
}

function EnquirySection() {
  return (
    <section id="project-enquiry" className="scroll-mt-20 bg-tech-soft py-20 sm:py-28">
      <div className="container-lux grid gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-4">
          <SectionHeading
            eyebrow="Project Enquiry"
            title={["Tell Us What You Want to Build"]}
            accentIndex={null}
            intro="Share your requirements and our team will review your project and contact you to discuss the next steps."
          />
          <RevealUp delay={0.2} className="mt-8">
            <WhatsAppButton message="Hello Goldenfalcone, I would like to discuss a digital project." label="Discuss on WhatsApp" />
          </RevealUp>
        </div>
        <RevealUp delay={0.1} className="rounded-2xl border border-line bg-white p-6 shadow-[0_24px_60px_-40px_rgba(6,21,46,0.35)] sm:p-10 lg:col-span-8">
          <DigitalEnquiryForm />
        </RevealUp>
      </div>
    </section>
  );
}

function Faq({ children }: { children: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden bg-navy py-20 text-white sm:py-28">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(160deg,#06152e_20%,#07356f_75%,#0866d9_130%)]" />
      <div className="container-lux">
        <div className="mx-auto max-w-4xl">
          <RevealUp>
            <h2 className={`text-center ${heading}`}>Questions About Our Digital Solutions</h2>
          </RevealUp>
          <RevealUp delay={0.1} className="mt-10 sm:mt-14">
            <Accordion items={faqs} tone="dark" />
          </RevealUp>
          {children}
        </div>
      </div>
    </section>
  );
}

export default async function DigitalSolutionsPage() {
  const managed = await getPublishedDigital();

  return (
    <div className="digital-theme">
      <Hero />
      <Services />
      <ManagedContent managed={managed} />
      <Solutions />
      <Process />
      <Technology />
      <WhyGoldenfalcone />
      <ProjectCta />
      <EnquirySection />
      <Faq>
        <RevealUp className="mt-12 text-center">
          <p className="text-xl font-bold sm:text-2xl">Still Have Questions? Let&apos;s Talk.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <AnimatedButton href="/contact" variant="tech">
              Contact Our Team
            </AnimatedButton>
            <WhatsAppButton
              message="Hello Goldenfalcone, I have a question about your digital solutions."
              label="Ask on WhatsApp"
              variant="outline-light"
              className="sm:min-w-44"
            />
          </div>
        </RevealUp>
      </Faq>
    </div>
  );
}

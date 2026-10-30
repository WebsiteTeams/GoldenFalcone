import { AlertTriangle, BookOpen, CalendarClock, LineChart, ShieldAlert, Users } from "lucide-react";
import { AnimatedButton, ImageReveal, RevealUp, StaggerContainer, StaggerItem } from "@/components/animations";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { PageHero } from "@/components/sections/PageHero";
import { ChartLine } from "@/components/services/ChartLine";
import { Accordion } from "@/components/ui/Accordion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { images, mentorshipFaqs, mentorshipTopics } from "@/lib/content";
import { ProgrammeCard } from "@/components/services/CatalogueItems";
import { getPublishedPrograms, pageMetadata } from "@/lib/cms";

export const revalidate = 3600;

export const generateMetadata = () =>
  pageMetadata("mentorship", {
    title: "Trading Mentorship",
    description:
      "Educational trading mentorship from Goldenfalcone — trading fundamentals, market basics and risk-management education. Educational only; not financial advice.",
    alternates: { canonical: "/trading-mentorship" },
    openGraph: { title: "Trading Mentorship | Goldenfalcone", url: "/trading-mentorship" },
  });

const topicIcons = [BookOpen, LineChart, ShieldAlert, Users];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: mentorshipFaqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default async function TradingMentorshipPage() {
  const programs = await getPublishedPrograms();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <PageHero
        eyebrow="Division 02 · Trading Mentorship"
        title={["Understand the Markets.", "Build Your Knowledge."]}
        intro="Structured, educational guidance for individuals who want to understand how financial markets work — at their own pace, with risk awareness at the core."
        image={images.tradingScreen}
        imageAlt="Trading platform screen showing a price chart and order book"
        actions={
          <>
            <AnimatedButton href="#consultation">Request a Consultation</AnimatedButton>
            <AnimatedButton href="#curriculum" variant="outline-light" arrow={false}>
              What You Will Learn
            </AnimatedButton>
          </>
        }
      />

      {/* Introduction */}
      <section className="bg-ivory py-24 sm:py-32">
        <div className="container-lux grid items-center gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHeading
              eyebrow="Mentorship Introduction"
              title={["Education first.", "Always."]}
              intro="Our mentorship is designed to help you build genuine understanding — of market structure, terminology, chart reading and, above all, managing risk responsibly."
            />
            <RevealUp delay={0.2}>
              <p className="mt-5 leading-relaxed text-muted">
                We do not sell signals, manage money or promise outcomes. The goal is to help you think clearly, learn
                systematically and make your own informed decisions.
              </p>
            </RevealUp>
          </div>
          <RevealUp className="lg:col-span-6" delay={0.1}>
            <div className="grain relative overflow-hidden rounded-[1.5rem] bg-forest p-8 text-ivory sm:p-10">
              <p className="eyebrow text-gold">Learning Curve</p>
              <p className="mt-3 max-w-xs font-serif text-2xl text-ivory/90">Knowledge compounds with patience and discipline.</p>
              <ChartLine className="mt-8 w-full text-ivory" />
              <p className="mt-4 text-[0.7rem] text-ivory/45">Illustrative graphic only — not market data or performance.</p>
            </div>
          </RevealUp>
        </div>
      </section>

      {/* Programmes managed in the admin panel (hidden until one is published) */}
      {programs.length ? (
        <section id="programmes" className="scroll-mt-20 bg-ivory py-24 sm:py-32">
          <div className="container-lux">
            <SectionHeading eyebrow="Programmes" title={["Choose how", "you want to learn."]} intro="Educational programmes only — no signals, no managed accounts and no promised returns." />
            <StaggerContainer className="mt-14 grid gap-6 md:grid-cols-2">
              {programs.map((p) => (
                <StaggerItem key={p.id}>
                  <ProgrammeCard program={p} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      ) : null}

      {/* Curriculum */}
      <section id="curriculum" className="scroll-mt-20 bg-ivory-dark/60 py-24 sm:py-32">
        <div className="container-lux">
          <SectionHeading eyebrow="What You Will Learn" title={["A structured path", "through the markets."]} />
          <StaggerContainer className="mt-14 grid gap-5 md:grid-cols-2">
            {mentorshipTopics.map((t, i) => {
              const Icon = topicIcons[i];
              return (
                <StaggerItem key={t.title} className="group flex gap-6 rounded-[1.5rem] border border-line bg-white p-8 transition-colors duration-500 hover:border-gold/50">
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-forest text-gold transition-transform duration-500 group-hover:scale-105">
                    <Icon aria-hidden className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <div>
                    <p className="eyebrow text-gold-dark">Module 0{i + 1}</p>
                    <h3 className="mt-2 text-2xl text-forest sm:text-3xl">{t.title}</h3>
                    <p className="mt-3 leading-relaxed text-muted">{t.text}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Format & availability */}
      <section className="bg-ivory py-24 sm:py-32">
        <div className="container-lux grid items-center gap-16 lg:grid-cols-2">
          <ImageReveal
            src={images.tradingDesk}
            alt="Laptop and phone showing trading charts on a dark desk"
            sizes="(min-width: 1024px) 50vw, 100vw"
            wrapperClassName="aspect-[4/3] rounded-[1.5rem]"
          />
          <div>
            <SectionHeading
              eyebrow="Format & Availability"
              title={["Shaped around", "your schedule."]}
              intro="Session format, frequency and timing are agreed individually after an initial consultation, based on your goals and current level."
            />
            <StaggerContainer className="mt-10 space-y-4">
              {[
                { icon: CalendarClock, text: "Schedules and availability confirmed after your enquiry" },
                { icon: Users, text: "One-to-one mentorship, subject to availability" },
                { icon: BookOpen, text: "Starting points for complete beginners upwards" },
              ].map(({ icon: Icon, text }) => (
                <StaggerItem key={text} className="flex items-center gap-4 rounded-xl border border-line bg-white px-5 py-4">
                  <Icon aria-hidden className="h-5 w-5 shrink-0 text-gold-dark" strokeWidth={1.5} />
                  <span className="text-ink">{text}</span>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* Risk disclosure */}
      <section className="bg-ivory pb-24 sm:pb-32" aria-labelledby="risk-heading">
        <div className="container-lux">
          <RevealUp>
            <div className="flex flex-col gap-6 rounded-[1.5rem] border border-gold/40 bg-champagne/25 p-8 sm:flex-row sm:p-10">
              <AlertTriangle aria-hidden className="h-8 w-8 shrink-0 text-gold-dark" strokeWidth={1.5} />
              <div>
                <h2 id="risk-heading" className="text-3xl text-forest">
                  Important risk disclosure
                </h2>
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink/80">
                  <p>
                    Goldenfalcone&apos;s trading mentorship is provided for <strong>educational purposes only</strong>. It
                    does not constitute financial, investment, tax or legal advice, and no content should be taken as a
                    recommendation to buy or sell any financial instrument.
                  </p>
                  <p>
                    Trading in financial markets — including stocks, derivatives, currencies and cryptocurrencies — involves
                    substantial risk and may not be suitable for everyone. You can lose some or all of your capital. Past
                    performance does not indicate future results, and no education programme can guarantee profits.
                  </p>
                  <p>
                    Any trading decisions you make are entirely your own responsibility. Consider seeking advice from a
                    suitably licensed financial adviser before trading.
                  </p>
                </div>
              </div>
            </div>
          </RevealUp>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-ivory-dark/60 py-24 sm:py-32">
        <div className="container-lux grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading eyebrow="FAQ" title={["Questions,", "answered."]} />
          </div>
          <RevealUp className="lg:col-span-8">
            <Accordion items={mentorshipFaqs} />
          </RevealUp>
        </div>
      </section>

      {/* Consultation */}
      <section id="consultation" className="scroll-mt-20 bg-ivory py-24 sm:py-32">
        <div className="container-lux grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading
              eyebrow="Consultation Enquiry"
              title={["Begin with", "a conversation."]}
              intro="Tell us about your learning goals and experience. We will get back to you to discuss format, availability and next steps."
            />
            <RevealUp delay={0.2} className="mt-8">
              <WhatsAppButton message="Hello Goldenfalcone, I would like to know more about the trading mentorship." label="Ask on WhatsApp" />
            </RevealUp>
          </div>
          <RevealUp delay={0.1} className="lg:col-span-8">
            <div className="rounded-[1.5rem] border border-line bg-white p-6 sm:p-10">
              <EnquiryForm variant="mentorship" />
            </div>
          </RevealUp>
        </div>
      </section>
    </>
  );
}

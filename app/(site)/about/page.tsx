import Image from "next/image";
import Link from "next/link";
import { AnimatedButton, ImageReveal, RevealUp, StaggerContainer, StaggerItem } from "@/components/animations";
import { PageHero } from "@/components/sections/PageHero";
import { ValuesReveal } from "@/components/sections/ValuesReveal";
import { CtaBand } from "@/components/sections/CtaBand";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getDivisions, getSiteConfig, getSiteContent, pageMetadata } from "@/lib/cms";
import { images } from "@/lib/content";

export const generateMetadata = () =>
  pageMetadata("about", {
    title: "About Us",
    description:
      "Goldenfalcone is a values-led, multi-service business brand built on integrity, loyalty, respect, strength and legacy.",
    alternates: { canonical: "/about" },
    openGraph: { title: "About Goldenfalcone", url: "/about" },
  });

const approach = [
  {
    title: "Listen first",
    text: "Every engagement starts by understanding what you actually need — not by fitting you into a package.",
  },
  {
    title: "Be transparent",
    text: "Clear information, realistic expectations and no promises we cannot keep, in every division.",
  },
  {
    title: "Stay accountable",
    text: "One brand, one standard. The same care applies whether the enquiry is large or small.",
  },
];

export default async function AboutPage() {
  const [{ values }, divisions, config] = await Promise.all([getSiteContent(), getDivisions(), getSiteConfig()]);
  return (
    <>
      <PageHero
        eyebrow="About Goldenfalcone"
        title={["Built on Values.", "Driven by Possibilities."]}
        intro="A diversified business brand bringing one set of principles to four distinct fields — trade, education, technology and talent."
        image={images.corporateOffice}
        imageAlt="Calm, modern office corridor with natural light"
      />

      <section className="py-24 sm:py-32">
        <div className="container-lux max-w-3xl mx-auto">
          <SectionHeading
            eyebrow="Our Philosophy"
            title={["One identity.", "Many possibilities."]}
            intro="Goldenfalcone was shaped around a simple idea: that strong values travel well. The same principles that make a reliable trading partner also make a trustworthy mentor, a dependable technology partner and a fair recruiter."
          />
          <RevealUp delay={0.2}>
            <p className="mt-5 leading-relaxed text-muted">
              Rather than specialising narrowly, we have chosen to build several focused divisions — each with its own
              expertise and audience — united by a shared way of working. For our clients, that means one familiar point
              of contact and a consistent standard of care, whichever service they need.
            </p>
          </RevealUp>
        </div>
      </section>

      <div className="bg-gradient-to-b from-gold/5 to-transparent min-h-[60vh]">
        <div className="container-lux relative overflow-hidden">
          <div className="absolute inset-0"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-gold/5 to-transparent"></div>
          <div className="relative mx-auto aspect-square max-w-sm rounded-full border border-gold/30 p-10">
            <div className="absolute inset-4 rounded-full border border-line" aria-hidden />
            <RevealUp className="relative h-full w-full">
              <Image src={config.logo} alt="Goldenfalcone emblem" fill sizes="384px" className="object-contain" />
            </RevealUp>
          </div>
          <div className="absolute -bottom-6 -right-6 text-gold text-4xl font-serif">
            <span>&ldquo;</span>
          </div>
        </div>
      </div>

      <ValuesReveal
        eyebrow="Brand Values"
        title={[`${values.length === 5 ? "Five" : values.length} values.`, "One promise."]}
        values={values}
        intro="Our values are not slogans — they are the standard every division is held to."
      />

      <section className="py-24 sm:py-32">
        <div className="container-lux">
          <SectionHeading eyebrow="Our Approach" title={["How we work,", "across every division."]} />
          <StaggerContainer className="mt-14 grid gap-6 md:grid-cols-3">
            {approach.map((a, i) => (
              <StaggerItem
                key={a.title}
                className="rounded-xl border border-gold/20 bg-white/[0.03] p-8 backdrop-blur-md hover:border-gold/30 transition-all duration-300"
              >
                <span className="font-serif text-5xl text-gold">0{i + 1}</span>
                <h3 className="mt-6 text-2xl text-forest">{a.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{a.text}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="py-24 sm:py-32 bg-gold/5">
        <div className="container-lux grid items-center gap-16 lg:grid-cols-2">
          <ImageReveal
            src={images.collaboration}
            alt="Two colleagues celebrating together at a shared desk"
            sizes="(min-width: 1024px) 50vw, 100vw"
            wrapperClassName="aspect-[4/3] rounded-xl"
            direction="left"
          />
          <div>
            <SectionHeading eyebrow="Our Divisions" title={["Four businesses,", "one family."]} />
            <ul className="mt-10 divide-y divide-divide divide-gold/20">
              {divisions.map((d) => (
                <li key={d.key}>
                  <RevealUp distance={14} className="flex items-baseline gap-5 py-5">
                    <span className="eyebrow text-gold-dark">{d.number}</span>
                    <Link href={d.href} className="group flex-1">
                      <span className="block font-serif text-2xl text-forest transition-colors group-hover:text-gold-dark">{d.title}</span>
                      <span className="mt-1 block text-sm text-muted">{d.description}</span>
                    </Link>
                  </RevealUp>
                </li>
              ))}
              <RevealUp delay={0.1} className="mt-10">
                <AnimatedButton href="/#businesses" variant="forest">
                  Explore Our Businesses
                </AnimatedButton>
              </RevealUp>
            </ul>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
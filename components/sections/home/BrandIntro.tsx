import Image from "next/image";
import Link from "next/link";
import { RevealUp, TextReveal } from "@/components/animations";
import { getSiteConfig, getSiteContent } from "@/lib/cms";
import { lines } from "@/lib/cms/defaults";
import { divisions } from "@/lib/content";
import { GoldRule } from "./GoldRule";

const orbit = ["left-1/2 top-0 -translate-x-1/2", "right-0 top-1/2 -translate-y-1/2", "bottom-0 left-1/2 -translate-x-1/2", "left-0 top-1/2 -translate-y-1/2"];

/** One brand at the centre with each business dimension on the same ring. */
function DimensionsDiagram({ logo }: { logo: string }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[30rem]">
      <svg aria-hidden viewBox="0 0 400 400" fill="none" className="absolute inset-0 h-full w-full text-gold-dark">
        <circle cx="200" cy="200" r="152" stroke="currentColor" strokeOpacity=".45" />
        <circle cx="200" cy="200" r="112" stroke="currentColor" strokeOpacity=".2" strokeDasharray="2 6" />
      </svg>
      <div className="absolute inset-[27%]">
        <Image src={logo} alt="" fill sizes="(min-width: 1024px) 15vw, 40vw" className="object-contain" />
      </div>
      {divisions.map((d, i) => (
        <Link
          key={d.key}
          href={d.href}
          className={`group absolute ${orbit[i]} flex min-w-[5.5rem] flex-col items-center rounded-sm bg-ivory px-2 py-1.5 text-center transition-colors hover:text-gold-dark`}
        >
          <span className="eyebrow text-[0.6rem] text-gold-deep">{d.number}</span>
          <span className="mt-0.5 font-serif text-lg leading-tight text-forest transition-colors group-hover:text-gold-dark sm:text-xl">{d.short}</span>
        </Link>
      ))}
    </div>
  );
}

export async function BrandIntro() {
  const [{ home, values }, config] = await Promise.all([getSiteContent(), getSiteConfig()]);
  return (
    <section id="introduction" className="scroll-mt-20 bg-ivory pb-20 pt-20 sm:pb-28 sm:pt-28">
      <div className="container-lux">
        <RevealUp distance={14}>
          <p className="eyebrow flex items-center gap-3 text-gold-deep">
            <span aria-hidden className="h-px w-8 bg-current" />
            About Goldenfalcone
          </p>
        </RevealUp>
        <TextReveal
          lines={lines(home.introTitle)}
          accentIndex={lines(home.introTitle).length - 1}
          accentClassName="italic text-gold-dark"
          className="mt-6 text-[2.75rem] leading-[1.02] text-forest xs:text-5xl sm:text-7xl xl:text-[5.75rem]"
        />

        <div className="mt-12 grid items-center gap-12 sm:mt-16 lg:grid-cols-12 lg:gap-14">
          <RevealUp className="order-last lg:order-first lg:col-span-5">
            <DimensionsDiagram logo={config.logo} />
          </RevealUp>
          <div className="lg:col-span-6 lg:col-start-7">
            <RevealUp>
              <p className="font-serif text-2xl leading-snug text-forest sm:text-[2rem]">{home.introLead}</p>
            </RevealUp>
            {home.introBody ? (
              <RevealUp delay={0.1}>
                <p className="mt-6 leading-relaxed text-muted sm:text-lg">{home.introBody}</p>
              </RevealUp>
            ) : null}
            <RevealUp delay={0.15}>
              <blockquote className="mt-9 border-l-2 border-gold pl-5 font-serif text-xl italic leading-snug text-gold-deep sm:text-2xl">
                The eagle for vision and strength; the tree for roots, growth and legacy.
              </blockquote>
            </RevealUp>
          </div>
        </div>

        <GoldRule className="mt-14 sm:mt-20" />
        <p className="mt-6 text-center text-[0.6rem] font-semibold uppercase leading-loose tracking-[0.16em] text-forest xs:tracking-[0.2em] sm:text-xs sm:tracking-[0.4em]">
          {values.map((v) => v.name).join(" · ")}
        </p>
      </div>
    </section>
  );
}

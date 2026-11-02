import Image from "next/image";
import Link from "next/link";
import { RevealUp, TextReveal } from "@/components/animations";
import { getSiteConfig, getSiteContent } from "@/lib/cms";
import { lines } from "@/lib/cms/defaults";
import { divisions } from "@/lib/content";

const numerals = ["I", "II", "III", "IV", "V"];

/** A tall arched plate: the emblem framed by concentric gold arches, like a museum niche. */
function EmblemPlate({ logo }: { logo: string }) {
  return (
    <div className="relative mx-auto w-full max-w-[26rem] lg:max-w-none">
      <div aria-hidden className="absolute -inset-4 rounded-t-full border border-gold/30" />
      <div aria-hidden className="absolute -inset-8 rounded-t-full border border-gold/15" />
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-full bg-[radial-gradient(ellipse_80%_60%_at_50%_38%,#0e6b52_0%,#062f25_60%,#041f19_100%)] shadow-[0_40px_80px_-30px_rgba(6,47,37,0.7)]">
        <div aria-hidden className="absolute inset-0 opacity-[0.07] [background:repeating-linear-gradient(90deg,#fff_0_1px,transparent_1px_26px)]" />
        <div aria-hidden className="absolute left-1/2 top-[40%] aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/40" />
        <div aria-hidden className="absolute left-1/2 top-[40%] aspect-square w-[64%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-2xl" />
        <div className="absolute left-1/2 top-[40%] aspect-square w-[62%] -translate-x-1/2 -translate-y-1/2">
          <Image src={logo} alt="Goldenfalcone emblem: a golden eagle encircling a tree" fill sizes="(min-width: 1024px) 24vw, 70vw" className="object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]" />
        </div>
        <p className="absolute inset-x-0 bottom-7 text-center text-[0.6rem] font-semibold uppercase tracking-[0.34em] text-champagne/80">Est. Vision · Strength · Legacy</p>
      </div>
      {/* hanging tag */}
      <div className="absolute -bottom-5 left-1/2 w-[82%] -translate-x-1/2 rounded-sm border border-gold/40 bg-ivory px-5 py-3 text-center shadow-[0_18px_40px_-20px_rgba(6,47,37,0.5)]">
        <p className="font-serif text-base italic leading-snug text-gold-deep sm:text-lg">The eagle for vision and strength; the tree for roots, growth and legacy.</p>
      </div>
    </div>
  );
}

export async function BrandIntro() {
  const [{ home, values }, config] = await Promise.all([getSiteContent(), getSiteConfig()]);
  const title = lines(home.introTitle);

  return (
    <section className="relative scroll-mt-20 overflow-hidden bg-ivory py-24 sm:py-32">
      <div className="container-lux relative">
        <div className="grid items-center gap-20 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <RevealUp distance={14}>
              <p className="eyebrow flex items-center gap-4 text-gold-deep">
                <span aria-hidden className="h-px w-12 bg-gold" />
                About Goldenfalcone
              </p>
            </RevealUp>
            <TextReveal
              lines={title}
              accentIndex={title.length - 1}
              accentClassName="italic text-gold-dark"
              className="mt-7 text-[2.6rem] font-medium leading-[1.05] text-forest sm:text-6xl xl:text-[4.6rem]"
            />

            <div className="mt-10 grid gap-8 sm:grid-cols-[1fr_auto] sm:gap-10">
              <RevealUp>
                <p className="border-l-2 border-gold pl-6 font-serif text-2xl leading-snug text-forest sm:text-[1.7rem]">{home.introLead}</p>
              </RevealUp>
            </div>
            {home.introBody ? (
              <RevealUp delay={0.1}>
                <p className="mt-7 max-w-xl pl-6 text-base leading-relaxed text-muted sm:pl-[1.65rem]">{home.introBody}</p>
              </RevealUp>
            ) : null}

            {/* the three dimensions as a numbered ledger */}
            <RevealUp delay={0.15}>
              <ol className="mt-12 border-t border-forest/15">
                {divisions.map((d) => (
                  <li key={d.key} className="border-b border-forest/15">
                    <Link href={d.href} className="group flex items-center gap-5 py-5 transition-colors sm:gap-8">
                      <span className="w-12 shrink-0 font-serif text-3xl leading-none text-gold-dark/70 transition-colors group-hover:text-gold-dark sm:text-4xl">{d.number}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-serif text-xl text-forest sm:text-2xl">{d.title}</span>
                        <span className="mt-1 line-clamp-1 block text-sm text-muted">{d.description}</span>
                      </span>
                      <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-forest/20 text-forest transition-all duration-300 group-hover:border-gold group-hover:bg-gold group-hover:text-forest">
                        <svg viewBox="0 0 16 16" className="h-4 w-4 -rotate-45 transition-transform duration-300 group-hover:rotate-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 8h10M9 4l4 4-4 4" />
                        </svg>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </RevealUp>
          </div>

          <RevealUp className="lg:col-span-4 lg:col-start-9">
            <EmblemPlate logo={config.logo} />
          </RevealUp>
        </div>

        {/* values strip */}
        <RevealUp delay={0.1}>
          <ul className="mt-28 grid grid-cols-2 gap-y-8 border-t border-gold/40 pt-10 sm:grid-cols-3 lg:grid-cols-5">
            {values.map((v, i) => (
              <li key={v.name} className="pr-6">
                <span className="font-serif text-sm italic text-gold-dark">{numerals[i] ?? i + 1}</span>
                <p className="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-forest">{v.name}</p>
              </li>
            ))}
          </ul>
        </RevealUp>
      </div>
    </section>
  );
}

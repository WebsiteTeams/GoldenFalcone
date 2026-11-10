import Image from "next/image";
import Link from "next/link";
import { RevealUp, TextReveal } from "@/components/animations";
import { getSiteConfig, getSiteContent } from "@/lib/cms";
import { lines } from "@/lib/cms/defaults";
import { divisions } from "@/lib/content";

const numerals = ["I", "II", "III", "IV", "V"];

/** Gold corner brackets that frame a panel like a presentation case. */
function Corners() {
  const c = "absolute h-6 w-6 border-gold/70";
  return (
    <>
      <span aria-hidden className={`${c} left-4 top-4 border-l border-t`} />
      <span aria-hidden className={`${c} right-4 top-4 border-r border-t`} />
      <span aria-hidden className={`${c} bottom-4 left-4 border-b border-l`} />
      <span aria-hidden className={`${c} bottom-4 right-4 border-b border-r`} />
    </>
  );
}

function Diamond() {
  return <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-gold" />;
}

export async function BrandIntro() {
  const [{ home, values }, config] = await Promise.all([getSiteContent(), getSiteConfig()]);
  const title = lines(home.introTitle);

  return (
    <section className="surface-white fade-from-black relative scroll-mt-20 overflow-hidden py-28 sm:py-40">
      {/* fine vertical linework, fading at top and bottom */}
      <div aria-hidden className="absolute inset-0 [background:repeating-linear-gradient(90deg,rgba(10,61,46,0.035)_0_1px,transparent_1px_88px)] [mask-image:linear-gradient(to_bottom,transparent,#000_25%,#000_75%,transparent)]" />
      {/* oversized watermark */}
      <span aria-hidden className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2 select-none whitespace-nowrap font-serif text-[16rem] italic leading-none text-forest/[0.035] max-lg:hidden">
        Goldenfalcone
      </span>

      <div className="container-lux relative">
        {/* centred statement */}
        <div className="mx-auto max-w-4xl text-center">
          <RevealUp distance={14}>
            <p className="eyebrow inline-flex items-center gap-4 text-gold-deep">
              <span aria-hidden className="h-px w-12 bg-gradient-to-r from-transparent to-gold" />
              <Diamond />
              About Goldenfalcone
              <Diamond />
              <span aria-hidden className="h-px w-12 bg-gradient-to-l from-transparent to-gold" />
            </p>
          </RevealUp>
          <TextReveal
            lines={title}
            accentIndex={title.length - 1}
            accentClassName="italic gold-text-dark"
            className="mt-8 text-[2.7rem] font-medium leading-[1.04] text-forest sm:text-6xl xl:text-[4.8rem]"
          />
          <RevealUp delay={0.1}>
            <p className="mx-auto mt-10 max-w-3xl font-serif text-2xl italic leading-snug text-ink/80 sm:text-[1.9rem]">{home.introLead}</p>
          </RevealUp>
        </div>

        {/* manifesto + ledger */}
        <div className="mt-20 grid gap-8 lg:mt-28 lg:grid-cols-12 lg:gap-10">
          <RevealUp className="lg:col-span-5">
            <aside className="surface-black relative h-full overflow-hidden rounded-[2rem] border border-gold/40 p-10 text-ivory shadow-[0_50px_90px_-40px_rgba(5,7,6,0.85)] sm:p-12">
              <Corners />
              <div aria-hidden className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
              <div className="relative flex h-full flex-col">
                <span className="relative flex h-20 w-20 items-center justify-center rounded-full border border-gold/50 bg-white/[0.04] shadow-[0_0_0_6px_rgba(212,164,55,0.08)]">
                  <Image src={config.logo} alt="Goldenfalcone emblem: a golden eagle encircling a tree" width={56} height={56} className="h-14 w-14 object-contain" />
                </span>
                <p className="mt-8 font-serif text-3xl leading-tight text-champagne sm:text-[2.2rem]">
                  Vision <span className="text-gold">&amp;</span> Strength.
                  <span className="block italic gold-text">Roots &amp; Legacy.</span>
                </p>
                <span aria-hidden className="mt-7 h-px w-16 bg-gold-foil" />
                {home.introBody ? <p className="mt-7 leading-relaxed text-ivory/70">{home.introBody}</p> : null}
                <p className="mt-auto pt-10 text-[0.65rem] font-semibold uppercase tracking-[0.34em] text-gold/80">The eagle for vision · The tree for legacy</p>
              </div>
            </aside>
          </RevealUp>

          <RevealUp delay={0.1} className="lg:col-span-7">
            <div className="flex h-full flex-col justify-center">
              <p className="eyebrow text-gold-deep">Three dimensions of one group</p>
              <ol className="mt-6 divide-y divide-forest/15 border-y border-forest/15">
                {divisions.map((d) => (
                  <li key={d.key}>
                    <Link href={d.href} className="group relative flex items-center gap-5 px-2 py-7 transition-all duration-500 hover:bg-forest hover:px-6 sm:gap-8">
                      <span className="w-14 shrink-0 font-serif text-4xl leading-none gold-text-dark transition-opacity group-hover:opacity-90 sm:text-5xl">{d.number}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-serif text-2xl text-forest transition-colors duration-500 group-hover:text-champagne sm:text-[1.9rem]">{d.title}</span>
                        <span className="mt-1.5 line-clamp-2 block text-sm leading-relaxed text-muted transition-colors duration-500 group-hover:text-ivory/70">{d.description}</span>
                      </span>
                      <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-forest/25 text-forest transition-all duration-500 group-hover:border-gold group-hover:bg-gold">
                        <svg viewBox="0 0 16 16" className="h-4 w-4 -rotate-45 transition-transform duration-500 group-hover:rotate-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 8h10M9 4l4 4-4 4" />
                        </svg>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </RevealUp>
        </div>

        {/* values band */}
        <RevealUp delay={0.1}>
          <ul className="surface-forest relative mt-20 grid grid-cols-2 overflow-hidden rounded-[2rem] border border-gold/40 shadow-[0_40px_80px_-40px_rgba(6,42,32,0.8)] sm:grid-cols-3 lg:mt-28 lg:grid-cols-5">
            {values.map((v, i) => (
              <li key={v.name} className="relative flex flex-col items-center gap-2 border-gold/20 px-4 py-9 text-center [&:not(:last-child)]:border-r max-sm:[&:nth-child(2n)]:border-r-0">
                <span className="font-serif text-lg italic gold-text">{numerals[i] ?? i + 1}</span>
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-ivory">{v.name}</span>
              </li>
            ))}
          </ul>
        </RevealUp>
      </div>
    </section>
  );
}

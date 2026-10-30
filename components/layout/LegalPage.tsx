import Link from "next/link";
import type { ReactNode } from "react";
import { RevealUp, TextReveal } from "@/components/animations";
import { getSiteConfig } from "@/lib/cms";

export type LegalSection = { id: string; heading: string; body: ReactNode };

type LegalPageProps = {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

/** Shared layout for policy pages: compact forest header, sticky contents list and readable prose column. */
export async function LegalPage({ eyebrow, title, updated, intro, sections }: LegalPageProps) {
  const { email } = (await getSiteConfig()).contact;

  return (
    <>
      <section className="grain relative overflow-hidden bg-forest pb-16 pt-40 text-ivory sm:pb-20">
        <div className="container-lux">
          <p className="eyebrow flex items-center gap-3 text-gold">
            <span aria-hidden className="h-px w-10 bg-gold" />
            {eyebrow}
          </p>
          <TextReveal as="h1" immediate delay={0.1} lines={[title]} className="mt-6 text-5xl leading-[1.05] sm:text-6xl" />
          <p className="mt-6 max-w-2xl leading-relaxed text-ivory/70">{intro}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-champagne/60">Last updated: {updated}</p>
        </div>
      </section>

      <section className="bg-ivory py-20 sm:py-24">
        <div className="container-lux grid gap-14 lg:grid-cols-12">
          <nav aria-label="On this page" className="lg:sticky lg:top-28 lg:col-span-3 lg:self-start">
            <p className="eyebrow text-gold-dark">Contents</p>
            <ol className="mt-5 space-y-2.5 border-l border-line pl-5 text-sm">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-muted transition-colors hover:text-forest">
                    {i + 1}. {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="max-w-3xl lg:col-span-8 lg:col-start-5">
            {sections.map((s, i) => (
              <RevealUp key={s.id} distance={16}>
                <article id={s.id} className="scroll-mt-28 border-t border-line py-10 first:border-t-0 first:pt-0">
                  <h2 className="text-3xl text-forest">
                    <span className="mr-3 font-sans text-sm font-semibold tracking-[0.2em] text-gold-dark">{String(i + 1).padStart(2, "0")}</span>
                    {s.heading}
                  </h2>
                  <div className="mt-5 space-y-4 leading-relaxed text-ink/80 [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:marker:text-gold">
                    {s.body}
                  </div>
                </article>
              </RevealUp>
            ))}

            <div className="mt-6 rounded-[1.5rem] border border-gold/30 bg-champagne/20 p-7 text-sm leading-relaxed text-ink/80">
              Questions about this page?{" "}
              {email ? (
                <>
                  Email{" "}
                  <a href={`mailto:${email}`} className="font-medium text-forest underline decoration-gold/60 underline-offset-2">
                    {email}
                  </a>{" "}
                  or use our{" "}
                </>
              ) : (
                "Use our "
              )}
              <Link href="/contact" className="font-medium text-forest underline decoration-gold/60 underline-offset-2">
                contact form
              </Link>
              .
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

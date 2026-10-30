import { ImageReveal, Parallax, RevealUp, StaggerContainer, StaggerItem } from "@/components/animations";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getSiteContent } from "@/lib/cms";
import { lines } from "@/lib/cms/defaults";
import { divisions, images } from "@/lib/content";

export async function BrandIntro() {
  const { home } = await getSiteContent();
  return (
    <section id="introduction" className="scroll-mt-20 bg-ivory py-24 sm:py-32">
      <div className="container-lux grid items-center gap-16 lg:grid-cols-12">
        <div className="relative lg:col-span-5">
          <ImageReveal
            src={images.corporateTowers}
            alt="Looking up at modern glass office towers"
            sizes="(min-width: 1024px) 40vw, 100vw"
            wrapperClassName="aspect-[4/5] rounded-[1.5rem]"
          />
          <Parallax offset={50} className="absolute -bottom-10 -right-4 hidden w-44 sm:block lg:-right-10">
            <div className="rounded-2xl border border-gold/40 bg-forest p-6 text-ivory shadow-[0_30px_60px_-30px_rgba(6,47,37,0.6)]">
              <p className="font-serif text-6xl leading-none text-gold">4</p>
              <p className="mt-3 text-xs uppercase leading-relaxed tracking-[0.2em] text-champagne/80">Business divisions, one set of values</p>
            </div>
          </Parallax>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <SectionHeading
            eyebrow="Who We Are"
            title={lines(home.introTitle)}
            intro={home.introLead}
          />
          {home.introBody ? (
            <RevealUp delay={0.2}>
              <p className="mt-5 leading-relaxed text-muted">{home.introBody}</p>
            </RevealUp>
          ) : null}
          <StaggerContainer className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line" delay={0.1}>
            {divisions.map((d) => (
              <StaggerItem key={d.key} className="bg-ivory p-5">
                <span className="eyebrow text-gold-dark">{d.number}</span>
                <p className="mt-2 font-serif text-xl text-forest">{d.short}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}

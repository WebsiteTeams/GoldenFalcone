import { AnimatedButton, ImageReveal, RevealUp, TextReveal } from "@/components/animations";
import { DashboardWindow, PhoneBooking, WebsiteWindow } from "@/components/digital/Illustrations";
import { getDivisions } from "@/lib/cms";
import { images } from "@/lib/content";
import { cn } from "@/lib/utils";

type Division = Awaited<ReturnType<typeof getDivisions>>[number];
type Tone = "light" | "dark";

function Copy({ division, tone, className, children }: { division: Division; tone: Tone; className?: string; children?: React.ReactNode }) {
  const dark = tone === "dark";
  return (
    <RevealUp className={className}>
      <div className="flex items-end gap-5">
        <span aria-hidden className={cn("outline-numeral text-[5.5rem] sm:text-[7.5rem]", dark ? "text-gold/70" : "text-gold-dark/60")}>
          {division.number}
        </span>
        <p className={cn("eyebrow pb-1 leading-relaxed", dark ? "text-gold" : "text-gold-deep")}>Dimension {division.number}</p>
      </div>
      <h3 className={cn("mt-6 text-[2.5rem] leading-[1.05] sm:text-[3.4rem]", dark ? "text-ivory" : "text-forest")}>{division.title}</h3>
      <p className={cn("mt-5 max-w-xl leading-relaxed sm:text-lg", dark ? "text-ivory/75" : "text-muted")}>{division.description}</p>
      <ul className={cn("mt-6 flex max-w-xl flex-wrap gap-x-3 gap-y-1.5 text-sm", dark ? "text-champagne" : "text-forest")}>
        {division.highlights.map((item, i) => (
          <li key={item} className="flex items-center gap-3">
            {i > 0 ? <span aria-hidden className="h-1 w-1 rounded-full bg-gold" /> : null}
            {item}
          </li>
        ))}
      </ul>
      {children}
      <AnimatedButton href={division.href} variant={dark ? "gold" : "forest"} className="mt-8 w-full xs:w-auto">
        {division.cta}
      </AnimatedButton>
    </RevealUp>
  );
}

const zoom = "transition-transform duration-[1400ms] ease-[var(--ease-lux)] group-hover:scale-[1.04] motion-reduce:group-hover:scale-100";

function SpicesVenture({ division }: { division: Division }) {
  return (
    <article id={division.key} className="scroll-mt-24 bg-ivory py-16 sm:py-24">
      <div className="container-lux grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="group relative pb-[14%] pr-[8%] lg:col-span-7">
          <ImageReveal src={images.spicesMarket} alt="Bowls of assorted whole Indian spices at a market" sizes="(min-width: 1024px) 50vw, 90vw" wrapperClassName="aspect-[5/4]" className={zoom} />
          <div className="absolute bottom-0 right-0 w-[42%] border-[6px] border-ivory shadow-[0_30px_50px_-30px_rgba(6,47,37,0.6)] sm:border-8">
            <ImageReveal src="/images/spices/hero-platter.jpg" alt="Platter of ground and whole spices" sizes="(min-width: 1024px) 22vw, 40vw" wrapperClassName="aspect-square" direction="left" />
          </div>
        </div>
        <Copy division={division} tone="light" className="lg:col-span-5" />
      </div>
    </article>
  );
}

function MentorshipVenture({ division }: { division: Division }) {
  return (
    <article id={division.key} className="grain relative scroll-mt-20 overflow-hidden bg-forest py-16 sm:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
        <Copy
          division={division}
          tone="dark"
          className="order-last px-5 md:px-10 lg:order-first lg:col-span-5 lg:col-start-1 lg:pl-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))] lg:pr-0"
        >
          <p className="mt-6 max-w-xl border-l border-gold/50 pl-4 text-sm leading-relaxed text-ivory/70">
            Educational mentorship only. It is not financial advice, and trading involves a significant risk of loss.
          </p>
        </Copy>
        <div className="group relative pl-5 md:pl-10 lg:col-span-7 lg:pl-0">
          <ImageReveal src={images.tradingCandles} alt="Candlestick price chart on a dark trading screen" sizes="(min-width: 1024px) 58vw, 100vw" wrapperClassName="aspect-[16/10]" className={zoom} />
          <div className="absolute -bottom-6 left-5 hidden w-[34%] border-[6px] border-forest shadow-[0_30px_50px_-20px_rgba(0,0,0,0.7)] sm:block md:left-10 lg:-left-10">
            <ImageReveal src={images.tradingDesk} alt="Trading desk with charts on a laptop and phone" sizes="24vw" wrapperClassName="aspect-[4/3]" direction="left" />
          </div>
        </div>
      </div>
    </article>
  );
}

function StaffingVenture({ division }: { division: Division }) {
  const frames = [
    { src: images.salonInterior, alt: "Premium salon interior with styling stations", offset: "mt-[18%]" },
    { src: images.salonStylist, alt: "Salon professional styling a client's hair", offset: "" },
    { src: images.salonMakeup, alt: "Makeup artist working with a client", offset: "mt-[28%]" },
  ];
  return (
    <article id={division.key} className="scroll-mt-24 bg-ivory py-16 sm:py-24">
      <div className="container-lux grid items-center gap-12 lg:grid-cols-12 lg:gap-12">
        <div className="group grid grid-cols-3 items-start gap-2 sm:gap-4 lg:col-span-7">
          {frames.map((f) => (
            <div key={f.alt} className={f.offset}>
              <ImageReveal src={f.src} alt={f.alt} sizes="(min-width: 1024px) 19vw, 32vw" wrapperClassName="aspect-[3/4.6]" className={zoom} />
            </div>
          ))}
        </div>
        <Copy division={division} tone="light" className="lg:col-span-5" />
      </div>
    </article>
  );
}

function DigitalVenture({ division }: { division: Division }) {
  return (
    <article id={division.key} className="grain relative scroll-mt-20 overflow-hidden bg-forest-deep py-16 sm:py-24">
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(ellipse_65%_70%_at_50%_100%,rgba(6,75,56,0.9),transparent)]" />
      <div className="container-lux relative">
        <Copy division={division} tone="dark" className="max-w-3xl" />
        <RevealUp delay={0.1} className="mock-forest relative mt-12 sm:mt-16">
          <div className="relative mx-auto aspect-[16/10] max-w-6xl sm:aspect-[16/9]">
            <div className="absolute left-0 top-[14%] hidden w-[52%] opacity-90 sm:block shadow-[0_30px_70px_-30px_rgba(0,0,0,0.9)]">
              <WebsiteWindow label="Business website on a desktop browser" />
            </div>
            <div className="absolute left-0 top-0 z-10 w-[92%] sm:left-auto sm:right-[6%] sm:w-[64%] shadow-[0_50px_90px_-30px_rgba(0,0,0,0.95)]">
              <DashboardWindow label="Software dashboard with metrics, charts and records" />
            </div>
            <div className="absolute bottom-0 right-0 z-20 w-[25%] sm:left-[43%] sm:right-auto sm:w-[15%] drop-shadow-[0_24px_30px_rgba(0,0,0,0.6)]">
              <PhoneBooking label="Mobile application booking screen" />
            </div>
          </div>
        </RevealUp>
      </div>
    </article>
  );
}

export async function Ventures() {
  const divisions = await getDivisions();
  const byKey = Object.fromEntries(divisions.map((d) => [d.key, d]));
  return (
    <section id="businesses" aria-labelledby="businesses-title" className="scroll-mt-20 bg-ivory">
      <div className="bg-forest py-16 text-ivory sm:py-24">
        <div className="container-lux grid items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="eyebrow flex items-center gap-3 text-gold">
              <span aria-hidden className="h-px w-8 bg-current" />
              Our Business Ventures
            </p>
            <div id="businesses-title">
              <TextReveal
                lines={["Four Dimensions,", "One Standard of Excellence."]}
                accentIndex={1}
                accentClassName="italic text-champagne"
                className="mt-6 text-[2.6rem] leading-[1.04] xs:text-5xl sm:text-6xl xl:text-7xl"
              />
            </div>
          </div>
          <RevealUp className="lg:col-span-4 lg:pb-2">
            <p className="leading-relaxed text-ivory/75 sm:text-lg">Explore the different business ventures operating under the Goldenfalcone brand.</p>
          </RevealUp>
        </div>
      </div>
      <SpicesVenture division={byKey.spices} />
      <MentorshipVenture division={byKey.mentorship} />
      <StaffingVenture division={byKey.staffing} />
      <DigitalVenture division={byKey.digital} />
    </section>
  );
}

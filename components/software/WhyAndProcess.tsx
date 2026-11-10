import { BookText, Headset, LayoutPanelTop, MonitorCheck, PackageCheck, RefreshCw } from "lucide-react";
import { RevealUp, StaggerContainer, StaggerItem } from "@/components/animations";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Each point describes how the store itself works: product details come from the product record, and setup and support
 * are handled by our team per order. Nothing here claims certification, results or customer numbers.
 */
const reasons = [
  { icon: LayoutPanelTop, title: "Software functionality", text: "Every product lists its features and what it is built to do, as confirmed by the product owner." },
  { icon: MonitorCheck, title: "Platform compatibility", text: "Supported platforms and technical requirements are stated on each product page before you buy." },
  { icon: BookText, title: "Product documentation", text: "Installation notes, licence conditions and common questions sit alongside each product." },
  { icon: PackageCheck, title: "Installation assistance", text: "After your order is confirmed, we send setup and activation details for your product." },
  { icon: Headset, title: "Customer support", text: "Questions before or after purchase go to our team directly by email, phone or WhatsApp." },
  { icon: RefreshCw, title: "Software updates", text: "Where a product includes updates, its licence terms say so. Ask us if you are unsure." },
];

export function WhyGoldenfalcone() {
  return (
    <section aria-label="Why Goldenfalcone" className="surface-white relative py-28 sm:py-36">
      <div className="container-lux grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading eyebrow="Why Goldenfalcone" title={["Technology Built Around", "Trading Workflows."]} intro="A software store that tells you what a product does, what it runs on and how you receive it." />
        </div>
        <StaggerContainer className="grid gap-px overflow-hidden rounded-[1.5rem] border border-line bg-line sm:grid-cols-2 lg:col-span-8">
          {reasons.map(({ icon: Icon, title, text }) => (
            <StaggerItem key={title} className="bg-white p-7 sm:p-8">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-forest text-gold">
                <Icon aria-hidden className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <h3 className="mt-5 text-2xl text-forest">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

const steps = [
  { n: "01", title: "Explore", text: "Discover software products and compare available solutions." },
  { n: "02", title: "Select", text: "Review the product details, pricing and licence options." },
  { n: "03", title: "Purchase", text: "Complete the available purchase or enquiry process." },
  { n: "04", title: "Activate", text: "Receive the configured software delivery and activation instructions." },
];

export function HowItWorks() {
  return (
    <section aria-label="How it works" className="surface-forest fade-from-white fade-to-white relative py-28 text-ivory sm:py-36">
      <div className="container-lux">
        <SectionHeading tone="light" eyebrow="How It Works" title={["From first look", "to first launch."]} />
        <ol className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
          <span aria-hidden className="absolute left-[1.1rem] top-2 hidden h-px w-[calc(100%-2.2rem)] bg-gradient-to-r from-gold/0 via-gold/50 to-gold/0 md:block" />
          {steps.map((s, i) => (
            <RevealUp key={s.n} delay={i * 0.08}>
              <li className="relative md:pt-10">
                <span aria-hidden className="absolute left-0 top-0 hidden h-[0.55rem] w-[0.55rem] rounded-full bg-gold md:block" />
                <span className="outline-numeral block text-6xl text-gold/70">{s.n}</span>
                <h3 className="mt-4 text-3xl">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ivory/70">{s.text}</p>
              </li>
            </RevealUp>
          ))}
        </ol>
        <p className="mt-16 max-w-3xl border-t border-white/10 pt-8 text-xs leading-relaxed text-ivory/55">
          Goldenfalcone sells trading software. We do not provide trading signals, investment advice or managed accounts, and no product is presented as a way to make profit.
          Trading in financial markets carries a risk of loss.
        </p>
      </div>
    </section>
  );
}

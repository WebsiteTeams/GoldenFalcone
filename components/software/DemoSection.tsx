import { RevealUp } from "@/components/animations";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { DemoRequestForm } from "./DemoRequestForm";

export function DemoSection({ software, defaultSoftwareId, productName }: { software: { id: string; name: string }[]; defaultSoftwareId?: string; productName?: string }) {
  return (
    <section id="demo" aria-label="Request a demo" className="scroll-mt-20 bg-ivory py-24 sm:py-32">
      <div className="container-lux grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading
            eyebrow="Software Demo"
            title={["Request a", productName ? `${productName} demo.` : "demonstration."]}
            intro="Tell us which software you are interested in and how you prefer to be contacted. We will get back to you with the available demonstration options."
          />
          <RevealUp delay={0.2} className="mt-8">
            <WhatsAppButton message={`Hello Goldenfalcone, I would like to know more about ${productName ?? "your trading software"}.`} label="Ask on WhatsApp" />
          </RevealUp>
        </div>
        <RevealUp delay={0.1} className="lg:col-span-8">
          <div className="rounded-[1.5rem] border border-line bg-white p-6 sm:p-10">
            <DemoRequestForm software={software} defaultSoftwareId={defaultSoftwareId} />
          </div>
        </RevealUp>
      </div>
    </section>
  );
}

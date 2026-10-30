import Image from "next/image";
import { AnimatedButton, RevealUp, TextReveal } from "@/components/animations";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { getSiteContent } from "@/lib/cms";
import { lines } from "@/lib/cms/defaults";
import { site } from "@/lib/site";

type CtaBandProps = {
  eyebrow?: string;
  title?: string[];
  text?: string;
  href?: string;
  label?: string;
  whatsappMessage?: string;
};

/** Closing call to action. Heading, text and button default to the copy managed in the admin panel. */
export async function CtaBand({
  eyebrow = "Start a Conversation",
  title,
  text,
  href = "/contact",
  label,
  whatsappMessage = "Hello Goldenfalcone, I would like to discuss an enquiry.",
}: CtaBandProps) {
  const { cta } = await getSiteContent();
  title ??= lines(cta.title);
  text ??= cta.text;
  label ??= cta.buttonLabel;
  return (
    <section className="bg-ivory py-20 sm:py-28">
      <div className="container-lux">
        <div className="grain relative overflow-hidden rounded-[1.75rem] bg-forest px-6 py-16 text-ivory sm:px-14 sm:py-20">
          <Image
            src={site.logo}
            alt=""
            width={420}
            height={420}
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-16 h-[26rem] w-[26rem] opacity-[0.07] sm:-right-10"
          />
          <div aria-hidden className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
          <div className="relative max-w-2xl">
            <RevealUp distance={14}>
              <p className="eyebrow text-gold">{eyebrow}</p>
            </RevealUp>
            <TextReveal lines={title} className="mt-5 text-4xl leading-[1.05] sm:text-5xl" />
            <RevealUp delay={0.15}>
              <p className="mt-6 leading-relaxed text-ivory/70">{text}</p>
              <div className="mt-10 flex flex-wrap gap-4">
                <AnimatedButton href={href}>{label}</AnimatedButton>
                <WhatsAppButton message={whatsappMessage} variant="outline-light" />
              </div>
            </RevealUp>
          </div>
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import { AnimatedButton, RevealUp, TextReveal } from "@/components/animations";
import { getSiteConfig, getSiteContent } from "@/lib/cms";
import { lines } from "@/lib/cms/defaults";

export async function HomeCta() {
  const [{ cta }, config] = await Promise.all([getSiteContent(), getSiteConfig()]);
  return (
    <section className="bg-ivory">
      <div className="grid lg:grid-cols-12">
        <div className="flex items-center px-5 py-16 md:px-10 lg:col-span-7 lg:py-24 lg:pl-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))] lg:pr-14">
          <div>
            <RevealUp distance={14}>
              <p className="eyebrow flex items-center gap-3 text-gold-deep">
                <span aria-hidden className="h-px w-8 bg-current" />
                Start a Conversation
              </p>
            </RevealUp>
            <TextReveal lines={lines(cta.title)} className="mt-6 text-[2.6rem] leading-[1.05] text-forest xs:text-5xl sm:text-6xl xl:text-[4.5rem]" />
            <RevealUp delay={0.15}>
              <p className="mt-6 max-w-xl leading-relaxed text-muted sm:text-lg">{cta.text}</p>
            </RevealUp>
          </div>
        </div>
        <div className="grain relative isolate flex min-h-[22rem] items-end overflow-hidden bg-forest px-5 py-12 md:px-10 lg:col-span-5 lg:min-h-[34rem] lg:p-14">
          <Image src={config.logo} alt="" width={640} height={640} className="absolute -right-16 -top-10 -z-10 h-[24rem] w-[24rem] opacity-30 lg:-right-20 lg:top-[-4rem] lg:h-[36rem] lg:w-[36rem]" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-forest via-forest/70 to-transparent" />
          <RevealUp className="flex w-full flex-col gap-3 xs:flex-row xs:flex-wrap sm:gap-4">
            <AnimatedButton href="/contact#enquiry">{cta.buttonLabel}</AnimatedButton>
            <AnimatedButton href="/contact" variant="outline-light" arrow={false}>
              Contact Us
            </AnimatedButton>
          </RevealUp>
        </div>
      </div>
    </section>
  );
}

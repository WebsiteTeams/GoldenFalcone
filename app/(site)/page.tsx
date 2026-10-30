import { HomeHero } from "@/components/sections/home/HomeHero";
import { BrandIntro } from "@/components/sections/home/BrandIntro";
import { DivisionsGrid } from "@/components/sections/home/DivisionsGrid";
import { FeaturedServices } from "@/components/sections/home/FeaturedServices";
import { ValuesReveal } from "@/components/sections/ValuesReveal";
import { CtaBand } from "@/components/sections/CtaBand";
import { ContactSection } from "@/components/sections/ContactSection";
import { getSiteConfig, getSiteContent } from "@/lib/cms";
import { lines } from "@/lib/cms/defaults";

export async function generateMetadata() {
  const { seo } = await getSiteContent();
  return {
    ...(seo.home.title ? { title: { absolute: seo.home.title } } : {}),
    ...(seo.home.description ? { description: seo.home.description } : {}),
    alternates: { canonical: "/" },
  };
}

export default async function HomePage() {
  const [{ home, values }, config] = await Promise.all([getSiteContent(), getSiteConfig()]);
  return (
    <>
      <HomeHero
        eyebrow={values.map((v) => v.name.toUpperCase()).join(" • ")}
        title={lines(home.heroTitle)}
        description={home.heroDescription}
        primaryCta={home.heroPrimaryCta}
        secondaryCta={home.heroSecondaryCta}
        logo={config.logo}
      />
      <BrandIntro />
      <DivisionsGrid />
      <ValuesReveal values={values} />
      <FeaturedServices />
      <CtaBand />
      <ContactSection />
    </>
  );
}

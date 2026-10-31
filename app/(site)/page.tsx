import { BrandIntro } from "@/components/sections/home/BrandIntro";
import { BrandValues } from "@/components/sections/home/BrandValues";
import { HomeCta } from "@/components/sections/home/HomeCta";
import { HomeHero } from "@/components/sections/home/HomeHero";
import { Ventures } from "@/components/sections/home/Ventures";
import { WhyGoldenfalcone } from "@/components/sections/home/WhyGoldenfalcone";
import { getDivisions, getSiteConfig, getSiteContent } from "@/lib/cms";
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
  const [{ home, values }, config, divisions] = await Promise.all([getSiteContent(), getSiteConfig(), getDivisions()]);
  return (
    <>
      <HomeHero
        title={lines(home.heroTitle)}
        description={home.heroDescription}
        primaryCta={home.heroPrimaryCta}
        secondaryCta={home.heroSecondaryCta}
        logo={config.logo}
        ventures={divisions.map(({ key, number, title, href }) => ({ key, number, title, href }))}
      />
      <BrandIntro />
      <Ventures />
      <BrandValues values={values} />
      {/* <WhyGoldenfalcone /> */}
      {/* <HomeCta /> */}
    </>
  );
}

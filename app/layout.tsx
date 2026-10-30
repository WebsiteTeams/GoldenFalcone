import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Providers } from "@/components/layout/Providers";
import { getSiteConfig } from "@/lib/cms";
import { site } from "@/lib/site";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const DEFAULT_TITLE = "Goldenfalcone — One Vision. Four Dimensions of Business.";

export async function generateMetadata(): Promise<Metadata> {
  const { name, seo } = await getSiteConfig();
  const title = seo.defaultTitle || DEFAULT_TITLE;
  const description = seo.defaultDescription || site.description;
  return {
    metadataBase: new URL(site.url),
    title: { default: title, template: `%s | ${name}` },
    description,
    applicationName: name,
    icons: { icon: site.logo },
    openGraph: { type: "website", siteName: name, title, description, url: "/", locale: "en_US" },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: "/" },
  };
}

export const viewport: Viewport = {
  themeColor: "#062F25",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`}>
      <head>
        <noscript>
          {/* Without JavaScript, show content that would otherwise wait for a scroll reveal. */}
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/layout/Providers";
import { getSiteConfig } from "@/lib/cms";
import { site } from "@/lib/site";
import "./globals.css";

const cormorant = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Inter({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const DEFAULT_TITLE = "Goldenfalcone — One Vision. Three Dimensions of Business.";

export async function generateMetadata(): Promise<Metadata> {
  const { name, seo } = await getSiteConfig();
  const title = seo.defaultTitle || DEFAULT_TITLE;
  const description = seo.defaultDescription || site.description;
  return {
    metadataBase: new URL(site.url),
    title: { default: title, template: `%s | ${name}` },
    description,
    applicationName: name,
    icons: { icon: "/brand/emblem-192.png" },
    openGraph: { type: "website", siteName: name, title, description, url: "/", locale: "en_US" },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: "/" },
  };
}

export const viewport: Viewport = {
  themeColor: "#0A3D2E",
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

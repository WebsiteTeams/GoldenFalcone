import { Eye } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/navigation/Navbar";
import { CartProvider } from "@/lib/cart/context";
import { getSiteConfig, isPreviewing } from "@/lib/cms";
import { site } from "@/lib/site";


export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [config, previewing] = await Promise.all([getSiteConfig(), isPreviewing()]);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: config.name,
    url: site.url,
    logo: `${site.url}${config.logo}`,
    description: site.description,
    ...(config.contact.email ? { email: config.contact.email } : {}),
    ...(config.contact.phone ? { telephone: config.contact.phone } : {}),
    ...(config.social.length ? { sameAs: config.social.map(([, url]) => url) } : {}),
  };

  return (
    <CartProvider>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      {previewing ? (
        <div className="fixed inset-x-0 bottom-4 z-[70] flex justify-center px-4">
          <div className="flex items-center gap-4 rounded-full border border-gold/50 bg-forest px-5 py-2.5 text-sm text-ivory shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]">
            <Eye aria-hidden className="h-4 w-4 text-gold" />
            <span>Previewing draft content</span>
            {/* A plain link: the exit route clears the preview cookie and redirects. */}
            <a href="/api/admin/preview/exit" className="font-semibold text-gold underline-offset-2 hover:underline">
              Exit preview
            </a>
          </div>
        </div>
      ) : null}
      <Navbar logo={config.logo} />
      <main id="main">{children}</main>
      <Footer />
    </CartProvider>
  );
}


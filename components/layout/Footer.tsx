import Link from "next/link";
import { Globe, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { getSiteConfig, getSiteContent, whatsappHref } from "@/lib/cms";
import { divisions } from "@/lib/content";
import { site } from "@/lib/site";

const company = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const socialLabels: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  x: "X",
  youtube: "YouTube",
};

export async function Footer() {
  const [config, content] = await Promise.all([getSiteConfig(), getSiteContent()]);
  const { email, phone, address, whatsappNumber } = config.contact;
  const whatsapp = whatsappHref(whatsappNumber, "Hello Goldenfalcone, I would like to make an enquiry.");
  const hasContact = Boolean(email || phone || address || whatsapp);

  return (
    <footer className="grain relative overflow-hidden bg-forest text-ivory">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div className="container-lux grid gap-12 py-20 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo size={52} src={config.logo} />
          <p className="mt-6 font-serif text-2xl italic text-champagne">{content.footer.tagline}</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ivory/65">{content.footer.description}</p>
          {config.social.length ? (
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {config.social.map(([key, url]) => (
                <li key={key}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-ivory/75 transition-colors hover:text-champagne"
                  >
                    <Globe aria-hidden className="h-3.5 w-3.5 text-gold" />
                    {socialLabels[key]}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="md:col-span-3">
          <h2 className="eyebrow font-sans text-gold">Our Businesses</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {divisions.map((d) => (
              <li key={d.key}>
                <Link href={d.href} className="link-underline text-ivory/75 transition-colors hover:text-champagne">
                  {d.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h2 className="eyebrow font-sans text-gold">Company</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {company.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="link-underline text-ivory/75 transition-colors hover:text-champagne">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h2 className="eyebrow font-sans text-gold">Get in Touch</h2>
          <ul className="mt-5 space-y-3 text-sm text-ivory/75">
            {email ? (
              <li>
                <a href={`mailto:${email}`} className="inline-flex items-center gap-2 break-all transition-colors hover:text-champagne">
                  <Mail aria-hidden className="h-4 w-4 shrink-0 text-gold" /> {email}
                </a>
              </li>
            ) : null}
            {phone ? (
              <li>
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 transition-colors hover:text-champagne">
                  <Phone aria-hidden className="h-4 w-4 shrink-0 text-gold" /> {phone}
                </a>
              </li>
            ) : null}
            {whatsapp ? (
              <li>
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-champagne">
                  <MessageCircle aria-hidden className="h-4 w-4 shrink-0 text-gold" /> WhatsApp
                </a>
              </li>
            ) : null}
            {address ? (
              <li className="flex items-start gap-2">
                <MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> <span>{address}</span>
              </li>
            ) : null}
            {!hasContact ? (
              <li>
                <Link href="/contact" className="link-underline transition-colors hover:text-champagne">
                  Send us an enquiry
                </Link>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="container-lux flex flex-col gap-4 py-6 text-xs text-ivory/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>
          <ul className="flex gap-6">
            <li>
              <Link href="/privacy-policy" className="link-underline transition-colors hover:text-champagne">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="link-underline transition-colors hover:text-champagne">
                Terms &amp; Conditions
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

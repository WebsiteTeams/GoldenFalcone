import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { RevealUp } from "@/components/animations";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getSiteConfig, whatsappHref } from "@/lib/cms";
import type { ServiceType } from "@/lib/validations";

type ContactSectionProps = {
  id?: string;
  eyebrow?: string;
  title?: string[];
  intro?: string;
  defaultService?: ServiceType;
};

export async function ContactSection({
  id = "contact",
  eyebrow = "Contact",
  title = ["Tell us what", "you have in mind."],
  intro = "Choose the service you are interested in and share a few details. We read every enquiry and respond personally.",
  defaultService,
}: ContactSectionProps) {
  const { email, phone, address, whatsappNumber } = (await getSiteConfig()).contact;
  const whatsapp = whatsappHref(whatsappNumber, "Hello Goldenfalcone, I would like to make an enquiry.");
  const channels = [
    email && { icon: Mail, label: "Email", value: email, href: `mailto:${email}` },
    phone && { icon: Phone, label: "Phone", value: phone, href: `tel:${phone.replace(/\s/g, "")}` },
    whatsapp && { icon: MessageCircle, label: "WhatsApp", value: "Chat with us", href: whatsapp, external: true },
    address && { icon: MapPin, label: "Address", value: address },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href?: string; external?: boolean }[];

  return (
    <section id={id} className="scroll-mt-20 bg-ivory py-24 sm:py-32">
      <div className="container-lux grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading eyebrow={eyebrow} title={title} intro={intro} />
          {channels.length ? (
            <RevealUp delay={0.2}>
              <ul className="mt-10 space-y-5">
                {channels.map(({ icon: Icon, label, value, href, external }) => (
                  <li key={label} className="flex items-start gap-4">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest text-gold">
                      <Icon aria-hidden className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="eyebrow block text-muted">{label}</span>
                      {href ? (
                        <a
                          href={href}
                          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                          className="link-underline mt-1 inline-block break-all text-forest"
                        >
                          {value}
                        </a>
                      ) : (
                        <span className="mt-1 block text-forest">{value}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </RevealUp>
          ) : null}
        </div>
        <RevealUp delay={0.1} className="lg:col-span-7">
          <div className="rounded-[1.5rem] border border-line bg-ivory-dark/50 p-6 sm:p-10">
            <EnquiryForm defaultService={defaultService} />
          </div>
        </RevealUp>
      </div>
    </section>
  );
}

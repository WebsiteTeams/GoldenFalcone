import { MessageCircle } from "lucide-react";
import { AnimatedButton } from "@/components/animations";
import { getSiteConfig, whatsappHref } from "@/lib/cms";

type WhatsAppButtonProps = {
  message: string;
  label?: string;
  variant?: "gold" | "forest" | "outline-light" | "outline-dark";
  className?: string;
};

/** Renders nothing until a client-confirmed WhatsApp number is configured (admin settings or env). */
export async function WhatsAppButton({ message, label = "Enquire on WhatsApp", variant = "outline-dark", className }: WhatsAppButtonProps) {
  const { contact } = await getSiteConfig();
  const href = whatsappHref(contact.whatsappNumber, message);
  if (!href) return null;
  return (
    <AnimatedButton
      href={href}
      external
      variant={variant}
      arrow={false}
      className={className}
      icon={<MessageCircle aria-hidden className="h-4 w-4" />}
    >
      {label}
    </AnimatedButton>
  );
}

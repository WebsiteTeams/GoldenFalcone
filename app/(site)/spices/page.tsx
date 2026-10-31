import type { Metadata } from "next";
import { MessageCircle, ArrowRight, Sparkles, PhoneCall } from "lucide-react";
import { SpiceHeroSection } from "@/components/spices/SpiceHeroSection";
import { FeaturedPicks } from "@/components/spices/FeaturedPicks";
import { WhyChooseUsProcess } from "@/components/spices/WhyChooseUsProcess";
import { CategoryFilterStore } from "@/components/spices/CategoryFilterStore";
import { SpiceTrailMap } from "@/components/spices/SpiceTrailMap";
import { SpiceTestimonials } from "@/components/spices/SpiceTestimonials";
import { SpiceGiftSets } from "@/components/spices/SpiceGiftSets";
import { SpicesFaq } from "@/components/spices/SpicesFaq";
import {
  getPublishedCategories,
  getPublishedSpices,
  getSettings,
  pageMetadata,
  whatsappHref,
} from "@/lib/cms";

// Refreshed on demand when products change in the admin panel; hourly as a fallback.
export const revalidate = 3600;

export const generateMetadata = (): Promise<Metadata> =>
  pageMetadata("spices", {
    title: "Authentic Indian Spices, Delivered to Your Doorstep | Goldenfalcone",
    description:
      "Explore pure single-origin Indian whole spices, stone-ground powders, and artisan blends with Goldenfalcone — turmeric, cardamom, black pepper, ginger, and gift boxes.",
    alternates: { canonical: "/spices" },
    openGraph: {
      title: "Authentic Indian Spices, Delivered to Your Doorstep | Goldenfalcone",
      url: "/spices",
    },
  });

const WA_MESSAGE =
  "Hello Goldenfalcone, I would like to enquire about your authentic spices collection and pricing.";

export default async function SpicesPage() {
  // Published products, categories, and settings from the admin panel / MongoDB
  const [managed, categories, settings] = await Promise.all([
    getPublishedSpices(),
    getPublishedCategories(),
    getSettings(),
  ]);

  const rawWa =
    process.env.GOLDENFALCONE_WHATSAPP_NUMBER ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    settings.whatsappNumber ||
    "919790586474";
  const digits = rawWa.replace(/\D/g, "");
  const whatsappNumber = digits.length === 10 ? `91${digits}` : (digits || "919790586474");
  const waLink = whatsappHref(whatsappNumber, WA_MESSAGE);

  return (
    <div className="bg-[#FAF7F2] text-[#2A1E17] min-h-screen">
      {/* 1. Hero Section matching the user's reference design */}
      <SpiceHeroSection whatsappHref={waLink} />

      {/* 2. "Explore Our Pure Spice Collections" (3 Ceramic Bowl Highlights) */}
      <FeaturedPicks />

      {/* 3. "Why Choose Us" & "Our Process" Sections */}
      <WhyChooseUsProcess />

      {/* 4. "Top Picks from Indian Kitchens" (Interactive Shop Catalogue) */}
      <section className="py-20 sm:py-28 bg-[#FAF7F2] border-b border-line/60">
        <div className="container-lux max-w-6xl mx-auto px-4 sm:px-6">
          <CategoryFilterStore categories={categories} products={managed} />
        </div>
      </section>

      {/* 5. "Regional Spice Trail" (Interactive India Map & Origins) */}
      <SpiceTrailMap />

      {/* 6. "Testimonials" (Customer Reviews with Carousel) */}
      <SpiceTestimonials />

      {/* 7. Gift Boxes & Sets ("Royal Spice Jar Set" & "Traditional Masala Treasure") */}
      <SpiceGiftSets whatsappHref={waLink} />

      {/* 8. FAQs Section (Accordion) */}
      <SpicesFaq />

      {/* 9. Commercial Wholesale & Export Desk */}
      <section className="py-16 sm:py-20 bg-[#F4EFE6] border-t border-line/80">
        <div className="container-lux max-w-5xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl border border-[#D4AF37]/40 bg-gradient-to-r from-[#1E3A2B] via-[#12281D] to-[#1E3A2B] p-8 sm:p-12 text-[#FAF7F2] flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 px-3 py-1 text-[11px] font-semibold text-[#D4AF37]">
                <Sparkles className="h-3.5 w-3.5" />
                Institutional & Bulk Export Orders
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-white font-medium">
                Looking for container loads or wholesale consignments?
              </h3>
              <p className="text-xs sm:text-sm text-[#D8CEBF] leading-relaxed">
                Connect directly with our spice export desk on WhatsApp (+91 97905 86474) for FOB/CIF freight quotes, phytosanitary specs, and live auction prices.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3.5 shrink-0">
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-xs font-semibold text-white hover:bg-[#1EBE5D] transition-all shadow-md"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat on WhatsApp
                </a>
              )}
              <a
                href="tel:+919790586474"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3.5 text-xs font-semibold text-white hover:bg-white/20 transition-all"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                Call +91 97905 86474
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

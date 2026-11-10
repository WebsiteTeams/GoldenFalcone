import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { images } from "@/lib/content";

type GiftSetsProps = {
  whatsappHref?: string;
};

export function SpiceGiftSets({ whatsappHref }: GiftSetsProps) {
  const defaultHref = whatsappHref || "/checkout";

  return (
    <section className="surface-black fade-from-white fade-to-white relative text-white py-20 sm:py-28 overflow-hidden">
      <div className="container-lux max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Card 1: Royal Spice Jar Set */}
        <div className="group relative rounded-3xl border border-[#1F1F1F] bg-gradient-to-br from-[#0F0F0F] to-[#070807] overflow-hidden shadow-2xl">
          <div className="grid lg:grid-cols-12 items-center">
            {/* Text details */}
            <div className="p-8 sm:p-12 lg:col-span-6 space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4A437]/20 border border-[#D4A437]/30 px-3 py-1 text-xs font-semibold text-[#D4A437]">
                <Sparkles className="h-3.5 w-3.5" />
                Artisan Festive Edition
              </span>

              <h3 className="font-serif text-3xl sm:text-4xl text-[#FFFFFF] font-medium tracking-tight">
                Royal Spice Jar Set
              </h3>

              <p className="text-sm text-[#BDBFBC] leading-relaxed max-w-md">
                Get the richness of authentic Indian spices in elegant, air-tight glass jars housed in a handcrafted sustainable teak-finish wooden caddy.
              </p>

              <div className="pt-4">
                <a
                  href={defaultHref}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-xs font-semibold text-[#070807] shadow-md transition-all hover:bg-[#D4A437] hover:text-[#070807]"
                >
                  Shop Gift Box
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Image */}
            <div className="relative aspect-[16/10] lg:col-span-6 overflow-hidden">
              <Image
                src="/images/spices/gift-jar-set.jpg"
                alt="Royal Spice Jar Set in handcrafted wooden caddy"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Traditional Masala Treasure */}
        <div className="group relative rounded-3xl border border-[#1F1F1F] bg-gradient-to-br from-[#0F0F0F] to-[#000000] overflow-hidden shadow-2xl">
          <div className="grid lg:grid-cols-12 items-center">
            {/* Image on left for alternate visual cadence */}
            <div className="relative aspect-[16/10] lg:col-span-6 overflow-hidden order-2 lg:order-1">
              <Image
                src={images.spicesFlatlay}
                alt="Traditional Masala Treasure assorted spices"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* Text details on right */}
            <div className="p-8 sm:p-12 lg:col-span-6 space-y-4 order-1 lg:order-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4A437]/20 border border-[#D4A437]/30 px-3 py-1 text-xs font-semibold text-[#D4A437]">
                <Sparkles className="h-3.5 w-3.5" />
                Heritage Gourmet Box
              </span>

              <h3 className="font-serif text-3xl sm:text-4xl text-[#FFFFFF] font-medium tracking-tight">
                Traditional Masala Treasure
              </h3>

              <p className="text-sm text-[#BDBFBC] leading-relaxed max-w-md">
                A curated collection of artisan whole spices and signature blends. Hand-harvested, Sortex-cleaned, and packed for discerning chefs and culinary lovers.
              </p>

              <div className="pt-4">
                <a
                  href={defaultHref}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-xs font-semibold text-[#070807] shadow-md transition-all hover:bg-[#D4A437] hover:text-[#070807]"
                >
                  Shop Gift Box
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

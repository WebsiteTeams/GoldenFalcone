import Image from "next/image";
import { ArrowRight, Sparkles, ShieldCheck, Truck, Award } from "lucide-react";

type SpiceHeroProps = {
  whatsappHref?: string;
};

export function SpiceHeroSection({ whatsappHref }: SpiceHeroProps) {
  return (
    <section className="relative overflow-hidden surface-white relative pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Decorative ambient gradients */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#E5E5E2]/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-[#D4A437]/15 blur-3xl"
      />

      <div className="container-lux max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          {/* Left Column: Heading, Subtitle & CTA */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4A437]/40 bg-[#D4A437]/10 px-3.5 py-1 text-xs font-semibold text-[#6B6F6C]">
              <Sparkles className="h-3.5 w-3.5 text-[#D4A437]" />
              100% Pure · Single-Origin Spices
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#0A0A0A] font-semibold leading-[1.12] tracking-tight">
              Authentic Indian Spices, Delivered to Your Doorstep
            </h1>

            <p className="text-base sm:text-lg text-[#5F6662] leading-relaxed max-w-xl mx-auto lg:mx-0">
              From farm-fresh turmeric to hand-pounded garam masala — discover the taste of India in every pinch.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                href="#top-picks"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#D4A437] px-8 py-3.5 text-sm font-semibold text-[#0F0F0F] shadow-md shadow-[#D4A437]/25 transition-all hover:bg-[#B8891F] hover:scale-[1.02] active:scale-[0.98]"
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </a>

              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-[#D9D9D5] bg-white px-7 py-3.5 text-sm font-semibold text-[#0A0A0A] hover:border-[#D4A437] hover:surface-white relative transition-colors"
                >
                  WhatsApp Order Desk
                </a>
              )}
            </div>

            {/* Micro Trust Indicators */}
            <div className="pt-6 border-t border-[#E5E5E2] flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#5F6662]">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="h-4 w-4 text-[#0A3D2E]" />
                Zero Adulteration
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Award className="h-4 w-4 text-[#D4A437]" />
                Sortex Graded
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Truck className="h-4 w-4 text-[#6B6F6C]" />
                All India & Global Delivery
              </span>
            </div>
          </div>

          {/* Right Column: Circular Brass Thali Platter */}
          <div className="lg:col-span-6 flex justify-center relative">
            <div className="relative w-full max-w-[460px] sm:max-w-[500px] aspect-square">
              {/* Subtle decorative glow ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#D4A437]/20 via-[#A87D1E]/10 to-transparent blur-2xl" />

              <div className="relative h-full w-full rounded-full overflow-hidden border-8 border-white/80 shadow-2xl shadow-[#0A0A0A]/15">
                <Image
                  src="/images/spices/hero-platter.jpg"
                  alt="Traditional Indian brass thali platter with assorted authentic spices"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 500px"
                  className="object-cover"
                />
              </div>

              {/* Floating Quality Pill Badge */}
              <div className="absolute -bottom-3 left-4 sm:left-8 rounded-2xl border border-[#D4A437]/40 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A3D2E] text-white">
                    <Sparkles className="h-4 w-4 text-[#D4A437]" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold text-[#0A0A0A] uppercase tracking-wide">
                      Heritage Plantation Direct
                    </p>
                    <p className="text-[10px] text-[#5F6662]">Idukki, Wayanad & Guntur</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Sprout, Tractor, PackageCheck, SunMedium } from "lucide-react";

const whyUsItems = [
  {
    icon: Sprout,
    title: "100% Pure",
    desc: "No additives, no shortcuts",
  },
  {
    icon: Tractor,
    title: "Sourced From Indian Farms",
    desc: "Direct from origin",
  },
  {
    icon: PackageCheck,
    title: "Eco-packaging",
    desc: "Safe to earth, moisture-free",
  },
  {
    icon: SunMedium,
    title: "Traditional processing",
    desc: "Stone-ground, sun-dried",
  },
];

const processSteps = [
  {
    number: "1",
    title: "Sourcing",
    desc: "Direct from local farmers",
  },
  {
    number: "2",
    title: "Processing",
    desc: "Sun-dried, hand-cleaned, and sortex-tested",
  },
  {
    number: "3",
    title: "Packaging",
    desc: "Eco-friendly, hermetically sealed",
  },
];

export function WhyChooseUsProcess() {
  return (
    <>
      {/* 1. Why Choose Us Section */}
      <section className="py-20 sm:py-28 bg-[#FAF7F2] border-b border-line/60">
        <div className="container-lux max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl text-[#2A1E17] font-semibold tracking-tight">
              Why Choose Us
            </h2>
            <p className="mt-2 font-serif italic text-base text-[#8C6D53]">
              &ldquo;What Makes Our Spices Special?&rdquo;
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {whyUsItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-[#EBE3D7] shadow-xs transition-all duration-300 hover:border-[#D4AF37] hover:shadow-md"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37]/15 text-[#B8860B] mb-4">
                    <Icon className="h-7 w-7" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-lg font-medium text-[#2A1E17]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#736357] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Our Process Section */}
      <section className="py-20 sm:py-28 bg-[#FAF7F2] border-b border-line/60">
        <div className="container-lux max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl text-[#2A1E17] font-semibold tracking-tight">
              Our Process
            </h2>
            <p className="mt-2 font-serif italic text-base text-[#8C6D53]">
              &ldquo;From Indian Fields To Your Kitchen&rdquo;
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3 relative">
            {processSteps.map((step) => (
              <div
                key={step.number}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-[#EBE3D7] shadow-xs relative z-10"
              >
                {/* Golden numbered badge */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D4AF37] text-white font-serif font-bold text-lg shadow-md shadow-[#D4AF37]/25 mb-5">
                  {step.number}
                </div>
                <h3 className="font-serif text-xl font-medium text-[#2A1E17]">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-xs text-[#736357] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type FaqItem = {
  q: string;
  a: string;
};

const faqs: FaqItem[] = [
  {
    q: "Are your spices organic?",
    a: "Yes, all our spices are organically grown by certified farmers across India. We strictly test every harvest for purity, free from artificial additives, fillers and chemical preservatives.",
  },
  {
    q: "How long does delivery take?",
    a: "Domestic orders across India typically arrive within 3 to 5 business days via insured express courier. International shipments arrive in 5–8 business days depending on customs and port clearances.",
  },
  {
    q: "How to store the spices?",
    a: "Store whole spices and spice powders in a cool, dry place away from direct sunlight and stove heat. Keep them sealed in airtight glass or tin containers to preserve their volatile aromatic oils.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes, Goldenfalcone supplies spices globally. We fulfill retail consumer orders as well as large-scale commercial export containers (FOB/CIF) to the UAE, Middle East, Europe, UK, USA, and Southeast Asia.",
  },
];

export function SpicesFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-20 sm:py-28 bg-[#FAF7F2] border-b border-line/60">
      <div className="container-lux max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="font-serif text-3xl sm:text-4xl text-[#2A1E17] font-semibold tracking-tight">
            FAQs
          </h2>
          <p className="mt-2 font-serif italic text-base text-[#8C6D53]">
            &ldquo;Got Questions? We Have Answers&rdquo;
          </p>
        </div>

        <div className="divide-y divide-[#E6DDD0] border-y border-[#E6DDD0]">
          {faqs.map((item, i) => {
            const isOpen = openIdx === i;

            return (
              <div key={item.q} className="py-5">
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 text-left font-serif text-lg sm:text-xl text-[#2A1E17] hover:text-[#8C6D53] transition-colors"
                >
                  <span className="font-medium">
                    {i + 1}. {item.q}
                  </span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#D8CEBF] transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-[#1E3A2B] text-white border-[#1E3A2B]" : "text-[#736357]"
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </button>

                {isOpen && (
                  <div className="mt-3 text-sm text-[#736357] leading-relaxed pl-5 pr-4 animate-in fade-in duration-200">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

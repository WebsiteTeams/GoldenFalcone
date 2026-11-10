"use client";

import { useState } from "react";
import { MapPin, Sparkles } from "lucide-react";

type Region = {
  id: string;
  name: string;
  spice: string;
  localName: string;
  notes: string;
  x: number; // percentage coordinates on map
  y: number;
};

const regions: Region[] = [
  {
    id: "kashmir",
    name: "Kashmir",
    spice: "Mogra Saffron",
    localName: "Kesar",
    notes: "High-altitude cold climate produces GI-tagged saffron strands with unmatched aroma and deep carmine color.",
    x: 35,
    y: 14,
  },
  {
    id: "rajasthan",
    name: "Rajasthan",
    spice: "Cumin & Coriander",
    localName: "Jeera & Dhania",
    notes: "Arid desert soil and high sun exposure give these seeds deep earthy pungency and rich essential oil concentration.",
    x: 27,
    y: 35,
  },
  {
    id: "gujarat",
    name: "Gujarat",
    spice: "Sweet Fennel & Mustard",
    localName: "Saunf & Rai",
    notes: "Coastal alluvial plains yield crisp, bright green aromatic fennel seeds prized for confectionery and digestifs.",
    x: 20,
    y: 47,
  },
  {
    id: "maharashtra",
    name: "Maharashtra",
    spice: "Byadgi Chilli",
    localName: "Lal Mirch",
    notes: "Famous wrinkled pods known for imparting deep crimson natural oil and gentle warm heat without sharp acidity.",
    x: 33,
    y: 60,
  },
  {
    id: "meghalaya",
    name: "Meghalaya",
    spice: "Lakadong Turmeric",
    localName: "Haldi",
    notes: "Harvested from the pristine Jaintia Hills with world-record 7% to 9% natural curcumin concentration.",
    x: 78,
    y: 36,
  },
  {
    id: "kerala",
    name: "Kerala (Malabar Coast)",
    spice: "Black Pepper & Green Cardamom",
    localName: "Kali Mirch & Elaichi",
    notes: "The Western Ghats spice sanctuary — producing bold Alleppey Green Extra Bold cardamoms and pungent Tellicherry TGSEB black pepper.",
    x: 34,
    y: 84,
  },
  {
    id: "tamilnadu",
    name: "Tamil Nadu",
    spice: "Dry Ginger & Cloves",
    localName: "Sonth & Laung",
    notes: "Hill-grown aromatic dried ginger rhizomes and hand-picked whole clove buds with powerful natural eugenol.",
    x: 43,
    y: 85,
  },
];

export function SpiceTrailMap() {
  const [activeRegion, setActiveRegion] = useState<Region>(regions[5]); // Default Kerala

  return (
    <section id="spice-trail" className="py-20 sm:py-28 surface-white relative">
      <div className="container-lux max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-serif text-3xl sm:text-4xl text-[#0A0A0A] font-semibold tracking-tight">
            Regional Spice Trail
          </h2>
          <p className="mt-2 font-serif italic text-base text-[#6B6F6C]">
            What Makes Our Spices Special?
          </p>
          <p className="mt-3 text-sm text-[#5F6662]">
            Trace every pinch back to its geographic homeland across India&apos;s ancient spice-growing belts.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-12 items-center">
          {/* Map Visual with pins */}
          <div className="lg:col-span-7 relative flex justify-center">
            <div className="relative w-full max-w-[500px] aspect-[4/5] rounded-3xl border border-[#EDEDEA] bg-[#F5F5F3]/60 p-6 sm:p-8 shadow-xs">
              {/* Subtle Stylized India Contour Silhouette */}
              <svg
                viewBox="0 0 400 500"
                className="w-full h-full text-[#DCDCD8] fill-current opacity-70 filter drop-shadow-sm"
              >
                {/* Simplified smooth aesthetic outline of Indian subcontinent */}
                <path d="M140,40 Q170,20 180,50 Q200,60 210,80 Q225,120 200,140 Q250,150 280,140 Q340,140 340,180 Q320,200 270,190 Q250,210 230,220 Q230,260 210,310 Q190,360 170,410 Q160,450 150,470 Q140,450 130,400 Q120,330 110,280 Q80,260 70,220 Q80,180 100,160 Q110,120 130,80 Z" />
              </svg>

              {/* Pins placed across the map */}
              {regions.map((region) => {
                const isSelected = activeRegion.id === region.id;

                return (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => setActiveRegion(region)}
                    className="group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
                    style={{ left: `${region.x}%`, top: `${region.y}%` }}
                    aria-label={`Select ${region.name} (${region.spice})`}
                  >
                    <div className="relative flex items-center justify-center">
                      {isSelected && (
                        <span className="absolute h-8 w-8 rounded-full bg-[#D4A437]/30 animate-ping" />
                      )}
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full border shadow-md transition-transform duration-200 group-hover:scale-125 ${
                          isSelected
                            ? "bg-[#0A3D2E] text-[#D4A437] border-[#D4A437] scale-110"
                            : "bg-white text-[#6B6F6C] border-[#D9D9D5] hover:surface-white relative"
                        }`}
                      >
                        <MapPin className="h-3.5 w-3.5 fill-current" />
                      </div>
                    </div>
                    <span
                      className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-semibold transition-all ${
                        isSelected
                          ? "bg-[#0A0A0A] text-[#FFFFFF]"
                          : "bg-white/90 text-[#5F6662] opacity-80 group-hover:opacity-100"
                      }`}
                    >
                      {region.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Region Detail Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl border border-[#E5E5E2] bg-white p-7 sm:p-9 shadow-sm">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#0A3D2E]/10 px-3 py-1 text-xs font-semibold text-[#0A3D2E]">
                <Sparkles className="h-3.5 w-3.5 text-[#D4A437]" />
                Single-Origin Provenance
              </div>

              <h3 className="mt-4 font-serif text-2xl sm:text-3xl font-medium text-[#0A0A0A]">
                {activeRegion.name}
              </h3>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-serif text-lg font-bold text-[#6B6F6C]">
                  {activeRegion.spice}
                </span>
                <span className="text-xs text-[#5F6662]">({activeRegion.localName})</span>
              </div>

              <p className="mt-4 text-sm text-[#5F6662] leading-relaxed">
                {activeRegion.notes}
              </p>

              <div className="mt-6 pt-5 border-t border-[#F5F5F3] flex items-center justify-between text-xs">
                <span className="text-[#8A8E8B]">Certified Farm Direct</span>
                <a
                  href="#top-picks"
                  className="font-semibold text-[#0A3D2E] hover:text-[#D4A437] transition-colors"
                >
                  Shop This Origin →
                </a>
              </div>
            </div>

            {/* Quick picker pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {regions.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveRegion(r)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    activeRegion.id === r.id
                      ? "bg-[#0A3D2E] text-white"
                      : "bg-white border border-[#E5E5E2] text-[#5F6662] hover:border-[#D4A437]"
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

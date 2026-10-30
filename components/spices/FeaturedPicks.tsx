"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/context";
import { formatPrice } from "@/lib/cart/price";

type FeaturedItem = {
  id: string;
  name: string;
  subname: string;
  desc: string;
  price: number;
  unit: string;
  image: string;
};

const items: FeaturedItem[] = [
  {
    id: "turmeric-pure",
    name: "Turmeric",
    subname: "(Haldi)",
    desc: "Helps healing and building body defence with high natural curcumin.",
    price: 180,
    unit: "250g",
    image: "/images/spices/turmeric-bowl.jpg",
  },
  {
    id: "ginger-pure",
    name: "Ginger Powder",
    subname: "(Sonth)",
    desc: "Warm, spicy, and digestion-friendly from premium dry ginger rhizomes.",
    price: 240,
    unit: "250g",
    image: "/images/spices/ginger-bowl.jpg",
  },
  {
    id: "red-chilli-pure",
    name: "Red Chilli",
    subname: "(Lal Mirch)",
    desc: "Delicious pure flavour, natural vibrant red color without artificial dyes.",
    price: 190,
    unit: "250g",
    image: "/images/spices/chilli-bowl.jpg",
  },
];

export function FeaturedPicks() {
  const { addItem } = useCart();
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  const handleAdd = (item: FeaturedItem) => {
    addItem({
      productId: item.id,
      name: `${item.name} ${item.subname}`,
      image: item.image,
      unit: item.unit,
      unitPrice: item.price,
      currency: "INR",
      quantity: 1,
    });

    setAddedMap((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  return (
    <section className="py-20 sm:py-28 bg-[#FAF7F2] border-b border-line/60">
      <div className="container-lux max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Heading matching the mockup */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl text-[#2A1E17] font-semibold tracking-tight">
            Explore Our Pure Spice Collections
          </h2>
          <p className="mt-3 text-sm text-[#736357]">
            Carefully curated kitchen essentials stone-ground in small batches to preserve volatile essential oils.
          </p>
        </div>

        {/* 3 Porcelain Bowl Cards */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const isAdded = Boolean(addedMap[item.id]);

            return (
              <div
                key={item.id}
                className="group flex flex-col rounded-3xl border border-[#EBE3D7] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/50 hover:shadow-xl"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#F5EFE6]">
                  <Image
                    src={item.image}
                    alt={`${item.name} in ceramic bowl`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="mt-5 flex flex-col flex-1">
                  <h3 className="font-serif text-xl font-medium text-[#2A1E17]">
                    {item.name} <span className="text-[#8C6D53] text-base font-normal">{item.subname}</span>
                  </h3>
                  <p className="mt-1.5 text-xs text-[#736357] leading-relaxed line-clamp-2 flex-1">
                    {item.desc}
                  </p>

                  <div className="mt-5 flex items-center justify-between pt-4 border-t border-[#F0E8DD]">
                    <div className="flex items-baseline gap-1">
                      <span className="font-serif text-xl font-bold text-[#1E3A2B] tabular-nums">
                        {formatPrice(item.price)}
                      </span>
                      <span className="text-xs text-[#8C7B6E]">/ {item.unit}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAdd(item)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-semibold transition-all duration-200 ${
                        isAdded
                          ? "bg-emerald-600 text-white"
                          : "border border-[#2A1E17] text-[#2A1E17] hover:bg-[#2A1E17] hover:text-[#FAF7F2]"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Added
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-3.5 w-3.5" />
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Link matching mockup: "Explore More →" */}
        <div className="mt-12 text-center">
          <a
            href="#top-picks"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#8C6D53] hover:text-[#2A1E17] transition-colors"
          >
            <span>Explore More</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

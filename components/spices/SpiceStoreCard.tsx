"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Package, ShoppingBag, Eye, Star, Check } from "lucide-react";
import type { PublicSpice } from "@/lib/cms";
import { useCart } from "@/lib/cart/context";
import { formatPrice, discountPercent } from "@/lib/cart/price";
import { useState } from "react";

export function SpiceStoreCard({ spice }: { spice: PublicSpice }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const mainImage = spice.images[0];
  const showMarket = spice.marketPrice !== null && spice.ourPrice !== null && spice.marketPrice > spice.ourPrice;
  const discount = showMarket ? discountPercent(spice.marketPrice!, spice.ourPrice!) : 0;

  function handleAddToCart() {
    if (spice.ourPrice === null) return;
    addItem({
      productId: spice.id,
      name: spice.name,
      image: mainImage?.url ?? "",
      unit: spice.unit,
      unitPrice: spice.ourPrice,
      marketPrice: spice.marketPrice,
      currency: spice.currency,
      quantity: spice.minimumOrderQuantity ?? 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col rounded-3xl border border-[#EBE3D7] bg-white overflow-hidden shadow-xs hover:border-[#D4AF37]/60 hover:shadow-xl transition-all duration-300"
    >
      {/* Product Image */}
      <Link href={`/spices/${spice.slug}`} className="relative block aspect-[4/3] bg-[#F7F2E9] overflow-hidden">
        {mainImage?.url ? (
          <Image
            src={mainImage.url}
            alt={mainImage.alt || spice.name}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-700 group-hover:scale-106"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#F5EFE6]">
            <Package className="h-12 w-12 text-[#D4AF37]/40" strokeWidth={1.2} />
          </div>
        )}
        {discount >= 5 && (
          <span className="absolute top-3 left-3 rounded-full bg-[#D4AF37] px-2.5 py-0.5 text-[11px] font-bold text-[#1C1510] shadow-sm">
            {discount}% OFF
          </span>
        )}
      </Link>

      {/* Content Details */}
      <div className="flex flex-1 flex-col p-5">
        <Link href={`/spices/${spice.slug}`}>
          <h3 className="font-serif text-lg text-[#2A1E17] font-semibold leading-snug group-hover:text-[#B8860B] transition-colors line-clamp-1">
            {spice.name}
          </h3>
        </Link>

        {/* Star Rating matching mockup ⭐⭐⭐⭐⭐ */}
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#8C7B6E]">
          <div className="flex text-[#D4AF37]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-current" />
            ))}
          </div>
          <span className="text-[11px] font-medium">(48 Reviews)</span>
        </div>

        {spice.shortDescription && (
          <p className="mt-2 text-xs leading-relaxed text-[#736357] line-clamp-2">
            {spice.shortDescription}
          </p>
        )}

        {spice.origin && (
          <p className="mt-2 flex items-center gap-1 text-[11px] text-[#8C6D53]">
            <MapPin className="h-3 w-3 shrink-0" />
            {spice.origin}
          </p>
        )}

        {/* Price & Action Button */}
        <div className="mt-auto pt-4 border-t border-[#F0E8DD] flex items-center justify-between gap-3">
          <div>
            {spice.ourPrice !== null ? (
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-xl font-bold text-[#1E3A2B] tabular-nums">
                  {formatPrice(spice.ourPrice, spice.currency)}
                </span>
                {spice.unit && <span className="text-xs text-[#8C7B6E]">/ {spice.unit}</span>}
              </div>
            ) : (
              <span className="text-xs text-[#736357] italic">Wholesale enquiry</span>
            )}
            {showMarket && (
              <span className="block text-[11px] text-[#A6978A] line-through tabular-nums">
                {formatPrice(spice.marketPrice!, spice.currency)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href={`/spices/${spice.slug}`}
              aria-label={`View ${spice.name}`}
              className="rounded-full border border-[#D8CEBF] p-2 text-[#736357] hover:border-[#D4AF37] hover:text-[#1E3A2B] transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
            </Link>

            {spice.ourPrice !== null && (
              <button
                type="button"
                onClick={handleAddToCart}
                aria-label={`Add ${spice.name} to cart`}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                  added
                    ? "bg-emerald-600 text-white"
                    : "border border-[#2A1E17] text-[#2A1E17] hover:bg-[#2A1E17] hover:text-[#FAF7F2]"
                }`}
              >
                {added ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Added
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Add to Basket
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Package } from "lucide-react";

export function ProductGallery({
  images,
  productName,
}: {
  images: { url: string; alt: string }[];
  productName: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-square w-full rounded-3xl bg-forest/5 border border-line flex items-center justify-center p-8">
        <div className="flex flex-col items-center text-muted">
          <Package className="h-20 w-20 text-gold/40 stroke-[1.2]" />
          <p className="mt-3 text-sm">Authentic whole spice</p>
        </div>
      </div>
    );
  }

  const activeImage = images[selectedIndex] || images[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Main active image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeImage.url}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative h-full w-full"
          >
            <Image
              src={activeImage.url}
              alt={activeImage.alt || productName}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-forest/70 backdrop-blur-md px-3 py-1 text-xs font-medium text-ivory">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails (up to 4 images) */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.slice(0, 4).map((img, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={img.url}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                aria-label={`View photo ${idx + 1} of ${productName}`}
                className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-gold shadow-md scale-102 ring-2 ring-gold/20"
                    : "border-line/70 hover:border-gold/50 opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.alt || `${productName} thumbnail ${idx + 1}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

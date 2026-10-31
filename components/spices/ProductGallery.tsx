"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Package } from "lucide-react";

export function ProductGallery({
  images,
  productName,
}: {
  images: { url: string; alt: string }[];
  productName: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = useReducedMotion();

  if (!images || images.length === 0) {
    return (
      <div className="relative flex aspect-square w-full items-center justify-center rounded-[1.5rem] border border-line bg-forest/5 p-8">
        <div className="flex flex-col items-center text-muted">
          <Package aria-hidden className="h-20 w-20 stroke-[1.2] text-gold/40" />
          <p className="mt-3 text-sm">Product photo coming soon</p>
        </div>
      </div>
    );
  }

  const shown = images.slice(0, 4);
  const activeImage = shown[selectedIndex] || shown[0];

  // Arrow keys move between thumbnails, following the standard tab pattern.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (selectedIndex + step + shown.length) % shown.length;
    setSelectedIndex(next);
    thumbs.current[next]?.focus();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main active image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[1.5rem] border border-line bg-white shadow-[0_40px_70px_-40px_rgba(6,47,37,0.45)]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeImage.url}
            initial={reduced ? false : { opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative h-full w-full"
          >
            <Image
              src={activeImage.url}
              alt={activeImage.alt || productName}
              fill
              priority={selectedIndex === 0}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
        {shown.length > 1 && (
          <div aria-hidden className="absolute bottom-3 right-3 rounded-full bg-forest/70 px-3 py-1 text-xs font-medium text-ivory backdrop-blur-md">
            {selectedIndex + 1} / {shown.length}
          </div>
        )}
      </div>

      {/* Thumbnails (up to 4 images) */}
      {shown.length > 1 && (
        <div role="group" aria-label={`Photos of ${productName}`} onKeyDown={onKeyDown} className="grid grid-cols-4 gap-3">
          {shown.map((img, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={img.url}
                ref={(el) => {
                  thumbs.current[idx] = el;
                }}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                aria-label={`View photo ${idx + 1} of ${shown.length}`}
                aria-current={isSelected ? "true" : undefined}
                className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-gold shadow-md ring-2 ring-gold/20"
                    : "border-line/70 opacity-70 hover:border-gold/50 hover:opacity-100"
                }`}
              >
                <Image src={img.url} alt="" fill sizes="(min-width: 1024px) 12vw, 25vw" className="object-cover" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

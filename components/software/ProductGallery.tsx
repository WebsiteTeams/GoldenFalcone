"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ExternalLink, Play } from "lucide-react";
import { videoEmbed } from "@/lib/software/video";
import { cn } from "@/lib/utils";

type Item = { url: string; alt: string };

/** Main preview with thumbnails: product thumbnail first, then screenshots, then the demo video if one is set. */
export function ProductGallery({ name, images, demoVideo }: { name: string; images: Item[]; demoVideo: string }) {
  const reduce = useReducedMotion();
  const video = videoEmbed(demoVideo);
  const [active, setActive] = useState<number | "video">(images.length ? 0 : video ? "video" : 0);

  if (!images.length && !video) {
    return <div className="flex aspect-[16/10] items-center justify-center rounded-[1.5rem] border border-line bg-ivory-dark text-sm text-muted">No preview images yet</div>;
  }

  const current = typeof active === "number" ? images[active] : null;

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem] border border-forest/20 bg-gradient-to-br from-emerald via-forest to-forest-deep shadow-[0_30px_60px_-30px_rgba(6,47,37,0.6)]">
        <AnimatePresence mode="wait" initial={false}>
          {active === "video" && video ? (
            <motion.div key="video" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.3 }}>
              {video.kind === "iframe" ? (
                <iframe
                  src={video.src}
                  title={`${name} demo video`}
                  loading="lazy"
                  allow="encrypted-media; picture-in-picture; fullscreen"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="h-full w-full"
                />
              ) : video.kind === "video" ? (
                <video src={video.src} controls preload="metadata" className="h-full w-full bg-black" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center text-ivory">
                  <Play aria-hidden className="h-10 w-10 text-gold" />
                  <a href={video.src} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-forest">
                    Watch the demo video <ExternalLink aria-hidden className="h-4 w-4" />
                  </a>
                </div>
              )}
            </motion.div>
          ) : current ? (
            <motion.div
              key={current.url}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: reduce ? 1 : 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image src={current.url} alt={current.alt || `${name} screenshot`} fill priority={active === 0} sizes="(min-width: 1024px) 55vw, 92vw" className="object-cover" />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {images.length + (video ? 1 : 0) > 1 ? (
        <ul className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((img, i) => (
            <li key={img.url}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-current={active === i}
                className={cn("relative block aspect-[16/10] w-full overflow-hidden rounded-lg border-2 transition-colors", active === i ? "border-gold" : "border-transparent hover:border-gold/50")}
              >
                <Image src={img.url} alt="" fill sizes="120px" loading="lazy" className="object-cover" />
              </button>
            </li>
          ))}
          {video ? (
            <li>
              <button
                type="button"
                onClick={() => setActive("video")}
                aria-label="Play demo video"
                aria-current={active === "video"}
                className={cn("flex aspect-[16/10] w-full items-center justify-center rounded-lg border-2 bg-forest text-gold transition-colors", active === "video" ? "border-gold" : "border-transparent hover:border-gold/50")}
              >
                <Play aria-hidden className="h-5 w-5" />
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}

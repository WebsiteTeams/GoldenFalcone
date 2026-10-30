"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

type Testimonial = {
  quote: string;
  author: string;
  location: string;
  stars: number;
};

const reviews: Testimonial[] = [
  {
    quote:
      "Freshly ground haldi that smells like home! It reminded me of the turmeric my dadi used to use in her cooking. Pure, fragrant, and full of warmth — just like it should be.",
    author: "Aarti S.",
    location: "Mumbai",
    stars: 5,
  },
  {
    quote:
      "The Tellicherry black pepper and Alleppey cardamom from Goldenfalcone are in a completely different league. The aroma bursts as soon as you open the seal. Authentic quality you can trust.",
    author: "Rohan M.",
    location: "Bengaluru",
    stars: 5,
  },
  {
    quote:
      "We ordered the whole spices gift set for festive corporate gifting and our clients were blown away. The packaging, freshness, and earthy fragrance are truly royal.",
    author: "Meenakshi K.",
    location: "Delhi NCR",
    stars: 5,
  },
];

export function SpiceTestimonials() {
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i === 0 ? reviews.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === reviews.length - 1 ? 0 : i + 1));

  const current = reviews[index];

  return (
    <section className="py-20 sm:py-28 bg-[#FAF7F2] border-b border-line/60">
      <div className="container-lux max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-serif text-3xl sm:text-4xl text-[#2A1E17] font-semibold tracking-tight">
          Testimonials
        </h2>
        <p className="mt-2 font-serif italic text-base text-[#8C6D53]">
          &ldquo;Our Customers Say It Best&rdquo;
        </p>

        {/* Big quote mark decoration */}
        <div className="mt-8 flex justify-center text-[#D4AF37]/50">
          <Quote className="h-10 w-10 rotate-180" />
        </div>

        {/* Testimonial Quote Box with carousel controls */}
        <div className="relative mt-4 flex items-center justify-between gap-4 sm:gap-8">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous testimonial"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#D8CEBF] bg-white text-[#2A1E17] shadow-sm transition-all hover:border-[#D4AF37] hover:bg-[#1E3A2B] hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="max-w-2xl mx-auto px-2 min-h-[160px] flex flex-col justify-center">
            {/* Stars */}
            <div className="flex justify-center gap-1 mb-4 text-[#D4AF37]">
              {Array.from({ length: current.stars }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>

            <p className="font-serif text-lg sm:text-2xl text-[#2A1E17] font-normal leading-relaxed italic">
              &ldquo;{current.quote}&rdquo;
            </p>

            <div className="mt-5">
              <span className="font-serif text-base font-semibold text-[#8C6D53]">
                {current.author}
              </span>
              <span className="text-sm text-[#736357]">, {current.location}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={next}
            aria-label="Next testimonial"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#D8CEBF] bg-white text-[#2A1E17] shadow-sm transition-all hover:border-[#D4AF37] hover:bg-[#1E3A2B] hover:text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Carousel indicators */}
        <div className="mt-8 flex justify-center gap-2">
          {reviews.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === i ? "w-6 bg-[#1E3A2B]" : "w-2 bg-[#D8CEBF]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

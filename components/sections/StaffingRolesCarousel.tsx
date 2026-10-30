"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Brush,
  Hand,
  HeartHandshake,
  Scissors,
  Sparkles,
  Store,
  UserRound,
  Users,
} from "lucide-react";

export type StaffingRole = {
  name: string;
  focus: string;
  text: string;
};

const roleIcons: Record<string, typeof Scissors> = {
  "Hair Stylist": Scissors,
  Beautician: Sparkles,
  "Makeup Artist": Brush,
  "Nail Technician": Hand,
  "Hair Assistant": UserRound,
  "Salon Receptionist": Store,
  "Spa Therapist": HeartHandshake,
  "Spa & Wellness Therapist": HeartHandshake,
  "Salon Manager": Users,
};

const pageNumber = (value: number) => String(value).padStart(2, "0");

/**
 * Editorial role carousel: one role per view on mobile, two on larger screens.
 * Navigation is page-based so the progress rail and arrows always agree with
 * the snapped scroll position.
 */
export function StaffingRolesCarousel({ roles }: { roles: readonly StaffingRole[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(0);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);

  const setCurrentPage = useCallback((value: number) => {
    pageRef.current = value;
    setPage(value);
  }, []);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    const nextPages = Math.max(1, Math.round(track.scrollWidth / track.clientWidth));
    setPages(nextPages);

    const clamped = Math.min(pageRef.current, nextPages - 1);
    if (clamped !== pageRef.current) setCurrentPage(clamped);
    const target = clamped * track.clientWidth;
    if (Math.abs(track.scrollLeft - target) > 2) track.scrollTo({ left: target });
  }, [setCurrentPage]);

  useEffect(() => {
    measure();
    const track = trackRef.current;
    if (!track || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [measure]);

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const next = Math.min(pages - 1, Math.max(0, Math.round(track.scrollLeft / track.clientWidth)));
    if (next !== pageRef.current) setCurrentPage(next);
  };

  const goToPage = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.min(Math.max(index, 0), pages - 1);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({
      left: clamped * track.clientWidth,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToPage(pageRef.current + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPage(pageRef.current - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      goToPage(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goToPage(pages - 1);
    }
  };

  return (
    <div role="region" aria-roledescription="carousel" aria-label="Roles we place" className="mt-2">
      <div
        ref={trackRef}
        role="group"
        aria-label="Role slides"
        tabIndex={0}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        className="flex snap-x snap-mandatory overflow-x-auto pb-2 outline-none [scrollbar-width:none] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold/60 [&::-webkit-scrollbar]:hidden"
      >
        {roles.map((role, index) => {
          const Icon = roleIcons[role.name] ?? Scissors;
          return (
            <article
              key={role.name}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${roles.length}: ${role.name}`}
              className={`group min-w-0 shrink-0 basis-full snap-start border-b border-line py-7 sm:basis-1/2 sm:border-b-0 sm:pr-8 ${
                index % 2 === 0 ? "sm:snap-start" : "sm:snap-align-none"
              } ${index === 0 ? "" : "sm:border-l sm:border-line sm:pl-8"}`}
            >
              <div className="flex items-start gap-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-line bg-white text-emerald transition-colors duration-300 group-hover:border-gold/60 group-hover:text-gold-dark">
                  <Icon aria-hidden className="h-4.5 w-4.5" strokeWidth={1.5} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-serif text-2xl text-forest">{role.name}</h3>
                    <span className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-gold-dark">
                      {pageNumber(index + 1)}
                    </span>
                  </div>
                  <p className="mt-1 text-[0.68rem] uppercase tracking-[0.14em] text-muted">{role.focus}</p>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted">{role.text}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between gap-6 border-t border-line pt-5">
        <div className="flex flex-1 items-center gap-1.5" aria-hidden="true">
          {Array.from({ length: pages }).map((_, index) => (
            <span
              key={index}
              className={`h-px flex-1 transition-colors duration-300 ${index === page ? "bg-gold" : "bg-line"}`}
            />
          ))}
        </div>

        <p aria-live="polite" className="shrink-0 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">
          {pageNumber(page + 1)} / {pageNumber(pages)}
        </p>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
            disabled={page === 0}
            aria-label="Previous roles"
            className="flex h-11 w-11 items-center justify-center border border-line bg-white text-forest transition-colors duration-300 hover:border-gold/60 hover:text-gold-dark disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line disabled:hover:text-forest"
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={page >= pages - 1}
            aria-label="Next roles"
            className="flex h-11 w-11 items-center justify-center border border-line bg-white text-forest transition-colors duration-300 hover:border-gold/60 hover:text-gold-dark disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line disabled:hover:text-forest"
          >
            <ArrowRight aria-hidden className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

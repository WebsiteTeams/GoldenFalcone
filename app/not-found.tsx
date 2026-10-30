import type { Metadata } from "next";
import Image from "next/image";
import { AnimatedButton } from "@/components/animations";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="grain relative isolate flex min-h-[100svh] items-center overflow-hidden bg-forest pb-20 pt-36 text-ivory">
      <Image
        src={site.logo}
        alt=""
        width={520}
        height={520}
        aria-hidden
        className="pointer-events-none absolute -right-32 top-1/2 -z-10 h-[32rem] w-[32rem] -translate-y-1/2 opacity-[0.06]"
      />
      <div className="container-lux max-w-3xl">
        <p className="eyebrow text-gold">Error 404</p>
        <h1 className="mt-6 text-5xl leading-[1.05] sm:text-7xl">
          This page has <span className="italic text-champagne">flown elsewhere.</span>
        </h1>
        <p className="mt-6 max-w-xl leading-relaxed text-ivory/70">
          The page you are looking for may have moved or no longer exists. Let&apos;s get you back on course.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <AnimatedButton href="/">Back to Home</AnimatedButton>
          <AnimatedButton href="/contact" variant="outline-light" arrow={false}>
            Contact Us
          </AnimatedButton>
        </div>
      </div>
    </section>
  );
}

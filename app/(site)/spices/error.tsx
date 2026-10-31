"use client";

import Link from "next/link";

export default function SpicesError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-ivory px-5 pb-16 pt-32 text-center">
      <div className="max-w-md">
        <h1 className="text-4xl text-forest">We couldn&apos;t load the spice store</h1>
        <p className="mt-3 text-muted">Please try again. If the problem continues, come back a little later.</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="rounded-full bg-forest px-7 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-emerald">
            Try again
          </button>
          <Link href="/" className="rounded-full border border-line px-7 py-3 text-sm font-semibold text-forest transition-colors hover:border-gold">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-lg bg-line/70 motion-reduce:animate-none", className)} />;
}

/** Placeholder for admin pages while server data loads. */
export function LoadingSkeleton({ variant = "table" }: { variant?: "table" | "dashboard" | "form" }) {
  return (
    <div role="status" aria-label="Loading">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      {variant === "dashboard" ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : variant === "form" ? (
        <div className="mt-8 space-y-4 rounded-2xl border border-line bg-white p-6">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-line bg-white p-4">
          <Skeleton className="h-11" />
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="mt-3 h-14" />
          ))}
        </div>
      )}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

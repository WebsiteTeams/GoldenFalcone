import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PAGE_SIZE } from "@/lib/admin/constants";
import { cn } from "@/lib/utils";

type PaginationProps = {
  basePath: string;
  params: Record<string, string | undefined>;
  page: number;
  pages: number;
  total: number;
};

/** Link-based pagination that preserves the current search and filters. */
export function Pagination({ basePath, params, page, pages, total }: PaginationProps) {
  const href = (p: number) => {
    const qs = new URLSearchParams(Object.entries({ ...params, page: p > 1 ? String(p) : undefined }).filter(([, v]) => v) as [string, string][]);
    const s = qs.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const link = "inline-flex h-9 items-center gap-1 rounded-lg border border-line bg-white px-3 text-sm transition-colors";

  return (
    <nav aria-label="Pagination" className="mt-5 flex flex-col items-center justify-between gap-3 text-sm text-muted sm:flex-row">
      <p>
        Showing <span className="font-medium text-ink">{from}</span>–<span className="font-medium text-ink">{to}</span> of{" "}
        <span className="font-medium text-ink">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} className={cn(link, "text-ink hover:border-gold/50")} rel="prev">
            <ChevronLeft aria-hidden className="h-4 w-4" /> Previous
          </Link>
        ) : (
          <span aria-disabled className={cn(link, "cursor-not-allowed opacity-50")}>
            <ChevronLeft aria-hidden className="h-4 w-4" /> Previous
          </span>
        )}
        <span className="px-2 tabular-nums">
          {page} / {pages}
        </span>
        {page < pages ? (
          <Link href={href(page + 1)} className={cn(link, "text-ink hover:border-gold/50")} rel="next">
            Next <ChevronRight aria-hidden className="h-4 w-4" />
          </Link>
        ) : (
          <span aria-disabled className={cn(link, "cursor-not-allowed opacity-50")}>
            Next <ChevronRight aria-hidden className="h-4 w-4" />
          </span>
        )}
      </div>
    </nav>
  );
}

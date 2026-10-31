"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2, Search, X } from "lucide-react";
import { catalogueHref, sortOptions, type CatalogueQuery, type SortOption } from "@/lib/spices/catalogue";

/** Store search and sort. State lives in the URL, so results can be shared, bookmarked and crawled. */
export function ShopControls({ query }: { query: CatalogueQuery }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [text, setText] = useState(query.q);
  const firstRun = useRef(true);

  const go = (next: Partial<CatalogueQuery>) => {
    startTransition(() => router.replace(catalogueHref({ ...query, page: 1, ...next }), { scroll: false }));
  };

  // Follows the URL when filters change elsewhere, such as the category tabs or back button.
  useEffect(() => {
    setText(query.q);
  }, [query.q]);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (text.trim() === query.q) return;
    const timer = setTimeout(() => go({ q: text.trim() }), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to typing
  }, [text]);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        go({ q: text.trim() });
      }}
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
      aria-busy={pending}
    >
      <div className="relative min-w-0 flex-1 sm:w-72">
        <label htmlFor="shop-search" className="sr-only">Search products</label>
        <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          id="shop-search"
          type="search"
          value={text}
          maxLength={100}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search name or sourcing"
          className="h-11 w-full rounded-full border border-line bg-white pl-10 pr-10 text-sm text-ink placeholder:text-muted/80 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15 [&::-webkit-search-cancel-button]:hidden"
        />
        {text ? (
          <button
            type="button"
            onClick={() => {
              setText("");
              go({ q: "" });
            }}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-ink/5 hover:text-ink"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="shop-sort" className="whitespace-nowrap text-sm text-muted">Sort by</label>
        <select
          id="shop-sort"
          value={query.sort}
          onChange={(e) => go({ sort: e.target.value as SortOption })}
          className="h-11 min-w-0 flex-1 rounded-full border border-line bg-white px-4 text-sm text-ink focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15 sm:flex-none"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <Loader2 aria-hidden className={`h-4 w-4 shrink-0 animate-spin text-gold-dark ${pending ? "" : "invisible"}`} />
      </div>
    </form>
  );
}

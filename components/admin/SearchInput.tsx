"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useUrlParams } from "./useUrlParams";

/** Debounced search box bound to the `q` URL parameter. */
export function SearchInput({ placeholder = "Search…" }: { placeholder?: string }) {
  const { params, setParams } = useUrlParams();
  const [value, setValue] = useState(params.get("q") ?? "");
  const first = useRef(true);
  const q = params.get("q") ?? "";

  // Follow external changes such as "Clear filters" or browser navigation.
  useEffect(() => {
    if (q !== value.trim()) setValue(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to URL changes
  }, [q]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => setParams({ q: value.trim() || undefined }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to typing
  }, [value]);

  return (
    <div className="relative min-w-0 flex-1">
      <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        maxLength={100}
        className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-9 text-sm text-ink placeholder:text-muted/70 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15 [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-muted hover:text-ink"
        >
          <X aria-hidden className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

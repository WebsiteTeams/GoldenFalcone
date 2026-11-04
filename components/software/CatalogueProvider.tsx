"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { filtersToQuery, parseSoftwareFilters, type SoftwareFilters } from "@/lib/software/filters";
import type { SoftwareFacets, SoftwareListing, PublicSoftware } from "@/lib/software/types";

type Status = "ready" | "loading" | "error";

type CatalogueContextValue = {
  filters: SoftwareFilters;
  items: PublicSoftware[];
  facets: SoftwareFacets | null;
  status: Status;
  activeCount: number;
  setFilters: (patch: Partial<SoftwareFilters>) => void;
  clearFilters: () => void;
  retry: () => void;
};

const CatalogueContext = createContext<CatalogueContextValue | null>(null);

export function useCatalogue() {
  const ctx = useContext(CatalogueContext);
  if (!ctx) throw new Error("useCatalogue must be used inside CatalogueProvider");
  return ctx;
}

const DEFAULT_FILTERS: SoftwareFilters = { sort: "featured" };
const FILTER_KEYS = ["category", "market", "platform", "licence", "min", "max"] as const;

/**
 * Holds the catalogue's filters, results and loading state for every section on the page, so a category card and the
 * filter bar drive the same list. The server renders the unfiltered list; any filter change is fetched from the API,
 * which queries MongoDB, and mirrored into the URL so a filtered view can be shared.
 */
export function CatalogueProvider({ initial, initialError, children }: { initial: SoftwareListing | null; initialError?: boolean; children: ReactNode }) {
  const [filters, setFiltersState] = useState<SoftwareFilters>(DEFAULT_FILTERS);
  const [items, setItems] = useState<PublicSoftware[]>(initial?.items ?? []);
  const [facets, setFacets] = useState<SoftwareFacets | null>(initial?.facets ?? null);
  const [status, setStatus] = useState<Status>(initialError ? "error" : "ready");
  const [attempt, setAttempt] = useState(0);
  const filtersKey = filtersToQuery(filters);
  const isDefault = filtersKey === "";

  // Pick up filters from the URL once on load (for shared links and category links).
  useEffect(() => {
    const fromUrl = parseSoftwareFilters(new URLSearchParams(window.location.search));
    if (filtersToQuery(fromUrl)) setFiltersState(fromUrl);
  }, []);

  useEffect(() => {
    // The server already rendered the unfiltered list, so only fetch when something differs or a retry was requested.
    if (isDefault && initial && !initialError && attempt === 0) {
      setItems(initial.items);
      setFacets(initial.facets);
      setStatus("ready");
      return;
    }
    const controller = new AbortController();
    setStatus("loading");
    fetch(`/api/software${filtersKey ? `?${filtersKey}` : ""}`, { signal: controller.signal })
      .then(async (res) => {
        const json = (await res.json().catch(() => null)) as { ok: boolean; data?: SoftwareListing } | null;
        if (!res.ok || !json?.ok || !json.data) throw new Error("request failed");
        setItems(json.data.items);
        setFacets(json.data.facets);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if ((error as Error).name !== "AbortError") setStatus("error");
      });
    return () => controller.abort();
  }, [filtersKey, isDefault, initial, initialError, attempt]);

  const setFilters = useCallback((patch: Partial<SoftwareFilters>) => {
    setFiltersState((current) => {
      const next = { ...current, ...patch };
      for (const key of Object.keys(next) as (keyof SoftwareFilters)[]) if (next[key] === undefined || next[key] === "") delete next[key];
      const query = filtersToQuery(next);
      window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
      return next as SoftwareFilters;
    });
  }, []);

  const clearFilters = useCallback(() => setFilters({ category: undefined, market: undefined, platform: undefined, licence: undefined, min: undefined, max: undefined }), [setFilters]);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const activeCount = FILTER_KEYS.filter((k) => filters[k] !== undefined).length;

  const value = useMemo(
    () => ({ filters, items, facets, status, activeCount, setFilters, clearFilters, retry }),
    [filters, items, facets, status, activeCount, setFilters, clearFilters, retry],
  );
  return <CatalogueContext.Provider value={value}>{children}</CatalogueContext.Provider>;
}

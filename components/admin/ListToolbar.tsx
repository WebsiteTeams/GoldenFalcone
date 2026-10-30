"use client";

import { RotateCcw } from "lucide-react";
import { FilterDropdown } from "./FilterDropdown";
import { SearchInput } from "./SearchInput";
import { useUrlParams } from "./useUrlParams";

type Option = { value: string; label: string };

type ListToolbarProps = {
  searchPlaceholder: string;
  statuses: readonly Option[];
  filter?: { label: string; options: readonly Option[] };
  dates?: boolean;
};

const dateInput =
  "h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15";

/** Search, filters, date range and sort for admin lists. All state lives in the URL, so views are shareable. */
export function ListToolbar({ searchPlaceholder, statuses, filter, dates }: ListToolbarProps) {
  const { params, setParams, pending } = useUrlParams();
  const active = ["q", "status", "filter", "from", "to", "sort"].some((k) => params.get(k));

  return (
    <div className="mb-5 space-y-3" aria-busy={pending}>
      <div className="flex flex-col gap-3 lg:flex-row">
        <SearchInput placeholder={searchPlaceholder} />
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <FilterDropdown name="status" label="Status" options={statuses} />
          {filter ? <FilterDropdown name="filter" label={filter.label} options={filter.options} /> : null}
          <FilterDropdown
            name="sort"
            label="Sort"
            allLabel="Newest first"
            options={[{ value: "oldest", label: "Oldest first" }]}
          />
        </div>
      </div>
      {dates || active ? (
        <div className="flex flex-wrap items-end gap-3">
          {dates ? (
            <>
              <label className="text-xs text-muted">
                From
                <input type="date" value={params.get("from") ?? ""} onChange={(e) => setParams({ from: e.target.value || undefined })} className={`mt-1 ${dateInput}`} />
              </label>
              <label className="text-xs text-muted">
                To
                <input type="date" value={params.get("to") ?? ""} onChange={(e) => setParams({ to: e.target.value || undefined })} className={`mt-1 ${dateInput}`} />
              </label>
            </>
          ) : null}
          {active ? (
            <button
              type="button"
              onClick={() => setParams({ q: undefined, status: undefined, filter: undefined, from: undefined, to: undefined, sort: undefined })}
              className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-forest hover:bg-ink/5"
            >
              <RotateCcw aria-hidden className="h-4 w-4" /> Clear filters
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

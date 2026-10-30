"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { FilterDropdown } from "./FilterDropdown";
import { SearchInput } from "./SearchInput";
import { useUrlParams } from "./useUrlParams";

type Option = { value: string; label: string };
type DropdownFilter = { name: string; label: string; options: readonly Option[] };
type TextFilter = { name: string; label: string; placeholder?: string };

type ListToolbarProps = {
  searchPlaceholder: string;
  statuses: readonly Option[];
  /** Single dropdown bound to the `filter` param — kept for catalogue lists. */
  filter?: { label: string; options: readonly Option[] };
  /** Additional dropdowns, each bound to its own URL param. */
  filters?: readonly DropdownFilter[];
  /** Free-text filters (location, skills, availability) shown below the main row. */
  textFilters?: readonly TextFilter[];
  dates?: boolean;
};

const input =
  "h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink placeholder:text-muted/70 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15";

/** Debounced free-text filter bound to its own URL parameter. */
function TextFilterInput({ filter }: { filter: TextFilter }) {
  const { params, setParams } = useUrlParams();
  const current = params.get(filter.name) ?? "";
  const [value, setValue] = useState(current);
  const first = useRef(true);

  useEffect(() => {
    if (current !== value.trim()) setValue(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to URL changes
  }, [current]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => setParams({ [filter.name]: value.trim() || undefined }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to typing
  }, [value]);

  return (
    <label className="min-w-[10rem] flex-1 text-xs text-muted sm:max-w-56 sm:flex-none">
      {filter.label}
      <input
        type="text"
        value={value}
        placeholder={filter.placeholder}
        maxLength={120}
        onChange={(e) => setValue(e.target.value)}
        className={`mt-1 ${input}`}
      />
    </label>
  );
}

/** Search, filters, date range and sort for admin lists. All state lives in the URL, so views are shareable. */
export function ListToolbar({ searchPlaceholder, statuses, filter, filters = [], textFilters = [], dates }: ListToolbarProps) {
  const { params, setParams, pending } = useUrlParams();

  const dropdowns: DropdownFilter[] = [
    { name: "status", label: "Status", options: statuses },
    ...(filter ? [{ name: "filter", label: filter.label, options: filter.options }] : []),
    ...filters,
  ];
  const activeKeys = ["q", "from", "to", "sort", ...dropdowns.map((f) => f.name), ...textFilters.map((f) => f.name)];
  const active = activeKeys.some((key) => params.get(key));

  const clear = () => {
    setParams(Object.fromEntries(activeKeys.map((key) => [key, undefined])));
  };

  return (
    <div className="mb-5 space-y-3" aria-busy={pending}>
      <div className="flex flex-col gap-3 xl:flex-row">
        <SearchInput placeholder={searchPlaceholder} />
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
          {dropdowns.map((f) => (
            <div key={f.name} className="min-w-0 sm:w-40">
              <FilterDropdown name={f.name} label={f.label} options={f.options} />
            </div>
          ))}
          <div className="min-w-0 sm:w-36">
            <FilterDropdown
              name="sort"
              label="Sort"
              allLabel="Newest first"
              options={[{ value: "oldest", label: "Oldest first" }]}
            />
          </div>
        </div>
      </div>
      {dates || textFilters.length || active ? (
        <div className="flex flex-wrap items-end gap-3">
          {textFilters.map((f) => (
            <TextFilterInput key={f.name} filter={f} />
          ))}
          {dates ? (
            <>
              <label className="text-xs text-muted">
                From
                <input type="date" value={params.get("from") ?? ""} onChange={(e) => setParams({ from: e.target.value || undefined })} className={`mt-1 ${input}`} />
              </label>
              <label className="text-xs text-muted">
                To
                <input type="date" value={params.get("to") ?? ""} onChange={(e) => setParams({ to: e.target.value || undefined })} className={`mt-1 ${input}`} />
              </label>
            </>
          ) : null}
          {active ? (
            <button
              type="button"
              onClick={clear}
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

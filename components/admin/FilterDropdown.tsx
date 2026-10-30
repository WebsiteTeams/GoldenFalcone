"use client";

import { ChevronDown } from "lucide-react";
import { useUrlParams } from "./useUrlParams";

type FilterDropdownProps = {
  name: string;
  label: string;
  options: readonly { value: string; label: string }[];
  /** Label for the "no filter" option. */
  allLabel?: string;
};

/** Select bound to a URL parameter. */
export function FilterDropdown({ name, label, options, allLabel = "All" }: FilterDropdownProps) {
  const { params, setParams } = useUrlParams();
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        value={params.get(name) ?? ""}
        onChange={(e) => setParams({ [name]: e.target.value || undefined })}
        className="h-10 w-full appearance-none rounded-lg border border-line bg-white pl-3 pr-9 text-sm text-ink focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15"
      >
        <option value="">
          {label}: {allLabel}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
    </label>
  );
}

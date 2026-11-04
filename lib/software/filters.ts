import { z } from "zod";
import { licenceTypeValues, softwareCategoryValues, softwarePlatformValues, tradingMarketValues } from "@/lib/admin/constants";

export const softwareSorts = [
  { value: "featured", label: "Featured" },
  { value: "latest", label: "Latest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
] as const;

const oneOf = <T extends readonly [string, ...string[]]>(values: T) => z.enum(values).optional().catch(undefined);
const price = z.coerce.number().min(0).max(1_000_000_000).optional().catch(undefined);

/** Catalogue filters as they appear in the query string. Unknown or invalid values are ignored rather than rejected. */
export const softwareFiltersSchema = z.object({
  category: oneOf(softwareCategoryValues),
  market: oneOf(tradingMarketValues),
  platform: oneOf(softwarePlatformValues),
  licence: oneOf(licenceTypeValues),
  min: price,
  max: price,
  sort: z.enum(["featured", "latest", "price-asc", "price-desc"]).catch("featured").default("featured"),
});
export type SoftwareFilters = z.output<typeof softwareFiltersSchema>;

export const parseSoftwareFilters = (input: Record<string, string | string[] | undefined> | URLSearchParams): SoftwareFilters => {
  const raw = input instanceof URLSearchParams ? Object.fromEntries(input.entries()) : Object.fromEntries(Object.entries(input).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
  return softwareFiltersSchema.parse(raw);
};

/** Query string for the active filters, leaving out anything unset or at its default. */
export function filtersToQuery(filters: Partial<SoftwareFilters>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === "" || Number.isNaN(value)) continue;
    if (key === "sort" && value === "featured") continue;
    params.set(key, String(value));
  }
  return params.toString();
}

import { listQuerySchema, type ListQuery } from "./schemas";

type SearchParams = Record<string, string | string[] | undefined>;

/** Validated list query from page search params, plus the raw string params for pagination links. */
export function readListQuery(sp: SearchParams): { query: ListQuery; params: Record<string, string | undefined> } {
  const params = Object.fromEntries(
    Object.entries(sp).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  ) as Record<string, string | undefined>;
  return { query: listQuerySchema.parse(params), params };
}

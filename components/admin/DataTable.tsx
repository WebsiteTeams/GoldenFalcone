import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type Column<T> = {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  /** Shown as the card title on small screens. */
  primary?: boolean;
  hideOnMobile?: boolean;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  rowHref: (row: T) => string;
  rowLabel: (row: T) => string;
  caption: string;
};

/** Server-rendered table that becomes a stack of cards on small screens — no horizontal scrolling. */
export function DataTable<T extends { _id: string }>({ columns, rows, rowHref, rowLabel, caption }: DataTableProps<T>) {
  const primary = columns.find((c) => c.primary) ?? columns[0];
  const rest = columns.filter((c) => c !== primary && !c.hideOnMobile);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <table className="hidden w-full text-left text-sm md:table">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-line bg-ivory/60 text-xs uppercase tracking-[0.08em] text-muted">
          <tr>
            {columns.map((c) => (
              <th key={c.header} scope="col" className={cn("px-5 py-3 font-semibold", c.className)}>
                {c.header}
              </th>
            ))}
            <th scope="col" className="w-12 px-5 py-3">
              <span className="sr-only">Open</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row._id} className="group relative transition-colors hover:bg-ivory/60">
              {columns.map((c) => (
                <td key={c.header} className={cn("px-5 py-3.5 align-middle text-ink", c.className)}>
                  {c === primary ? (
                    <Link href={rowHref(row)} className="font-medium text-forest after:absolute after:inset-0 hover:text-gold-dark">
                      {c.cell(row)}
                    </Link>
                  ) : (
                    c.cell(row)
                  )}
                </td>
              ))}
              <td className="relative px-5 py-3.5 text-right">
                <Link href={rowHref(row)} aria-label={`Open ${rowLabel(row)}`} className="inline-flex text-muted group-hover:text-gold-dark">
                  <ChevronRight aria-hidden className="h-4 w-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-line md:hidden" aria-label={caption}>
        {rows.map((row) => (
          <li key={row._id}>
            <Link href={rowHref(row)} className="block px-4 py-4 active:bg-ivory">
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0 font-medium text-forest">{primary.cell(row)}</span>
                <ChevronRight aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
              </span>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {rest.map((c) => (
                  <div key={c.header} className="min-w-0">
                    <dt className="text-[0.68rem] uppercase tracking-[0.08em] text-muted">{c.header}</dt>
                    <dd className="truncate text-ink">{c.cell(row)}</dd>
                  </div>
                ))}
              </dl>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

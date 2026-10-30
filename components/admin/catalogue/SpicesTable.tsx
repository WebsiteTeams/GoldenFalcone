import Link from "next/link";
import {
  ExternalLink,
  Package,
  Pencil,
  Sparkles,
  Tag,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import { formatPrice } from "@/lib/cart/price";
import { formatDate } from "@/lib/admin/client";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

export type SpiceRow = {
  _id: string;
  name: string;
  slug?: string;
  category: string;
  images?: Array<{ mediaId: string; alt?: string }>;
  marketPrice: number;
  ourPrice: number;
  shortDescription?: string;
  sku?: string;
  origin?: string;
  status: string;
  order: number;
  updatedAt: string;
};

type SpicesTableProps = {
  rows: SpiceRow[];
  categoryMap: Map<string, string>;
};

export function SpicesTable({ rows, categoryMap }: SpicesTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      {/* Desktop Table View */}
      <div className="overflow-x-auto">
        <table className="hidden w-full text-left text-sm md:table">
          <caption className="sr-only">Spices Product Catalogue</caption>
          <thead className="border-b border-line bg-ivory/70 text-[0.7rem] uppercase tracking-[0.1em] text-muted">
            <tr>
              <th scope="col" className="w-14 px-4 py-3.5 text-center">
                Image
              </th>
              <th scope="col" className="px-5 py-3.5 font-semibold">
                Product Details
              </th>
              <th scope="col" className="px-4 py-3.5 font-semibold">
                Category
              </th>
              <th scope="col" className="px-4 py-3.5 font-semibold text-right">
                Pricing (INR)
              </th>
              <th scope="col" className="w-20 px-4 py-3.5 text-center font-semibold">
                Order
              </th>
              <th scope="col" className="w-32 px-4 py-3.5 font-semibold">
                Status
              </th>
              <th scope="col" className="w-32 px-4 py-3.5 font-semibold">
                Updated
              </th>
              <th scope="col" className="w-28 px-4 py-3.5 text-right font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => {
              const editHref = `/admin/spices/${row._id}`;
              const firstMedia = row.images?.[0]?.mediaId;
              const imgUrl = firstMedia ? mediaUrl(firstMedia) : null;
              const categoryName = categoryMap.get(String(row.category)) || row.category || "Unassigned";
              const isLive = row.status === "published";
              const hasDiscount = row.marketPrice > row.ourPrice && row.ourPrice > 0;
              const discountPercent = hasDiscount
                ? Math.round(((row.marketPrice - row.ourPrice) / row.marketPrice) * 100)
                : 0;

              return (
                <tr
                  key={row._id}
                  className="group transition-colors duration-150 hover:bg-ivory/50"
                >
                  {/* 1. Thumbnail Image */}
                  <td className="px-4 py-3.5 text-center align-middle">
                    <Link href={editHref} className="relative block shrink-0">
                      <div className="relative mx-auto h-12 w-12 overflow-hidden rounded-xl border border-line bg-ivory shadow-xs">
                        {imgUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={imgUrl}
                            alt={row.images?.[0]?.alt || row.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-108"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted">
                            <Package className="h-5 w-5 text-gold/40" />
                          </div>
                        )}
                        {row.images && row.images.length > 1 ? (
                          <span className="absolute bottom-0.5 right-0.5 rounded-sm bg-forest/90 px-1 text-[9px] font-semibold text-ivory">
                            {row.images.length}
                          </span>
                        ) : null}
                      </div>
                    </Link>
                  </td>

                  {/* 2. Product Name & Metadata */}
                  <td className="px-5 py-3.5 align-middle">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Link
                          href={editHref}
                          className="font-serif text-[0.95rem] font-semibold text-forest hover:text-gold-dark transition-colors duration-200"
                        >
                          {row.name}
                        </Link>
                        {row.sku ? (
                          <span className="rounded bg-line/60 px-1.5 py-0.5 font-mono text-[10px] text-muted uppercase">
                            SKU: {row.sku}
                          </span>
                        ) : null}
                      </div>
                      {row.shortDescription ? (
                        <p className="line-clamp-1 max-w-md text-xs text-muted leading-relaxed">
                          {row.shortDescription}
                        </p>
                      ) : null}
                      {row.origin ? (
                        <div className="flex items-center gap-1 text-[11px] text-muted/80">
                          <Tag className="h-3 w-3 text-gold-dark/60" />
                          <span>Origin: {row.origin}</span>
                        </div>
                      ) : null}
                    </div>
                  </td>

                  {/* 3. Category Pill */}
                  <td className="px-4 py-3.5 align-middle">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-forest/15 bg-forest/8 px-2.5 py-1 text-xs font-medium text-forest">
                      <span className="h-1.5 w-1.5 rounded-full bg-forest/40" />
                      {categoryName}
                    </span>
                  </td>

                  {/* 4. Pricing */}
                  <td className="px-4 py-3.5 align-middle text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-semibold text-base text-forest tabular-nums">
                        {formatPrice(row.ourPrice || 0)}
                      </span>
                      {row.marketPrice > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted line-through tabular-nums">
                            {formatPrice(row.marketPrice)}
                          </span>
                          {hasDiscount ? (
                            <span className="rounded bg-emerald/15 px-1 py-0.2 text-[10px] font-bold text-emerald">
                              {discountPercent}% OFF
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </td>

                  {/* 5. Display Order */}
                  <td className="px-4 py-3.5 text-center align-middle">
                    <span className="inline-block rounded-md border border-line bg-ivory px-2 py-0.5 font-mono text-xs font-medium text-ink/70">
                      #{row.order ?? 0}
                    </span>
                  </td>

                  {/* 6. Visibility Status */}
                  <td className="px-4 py-3.5 align-middle">
                    {isLive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald/30 bg-emerald/10 px-2.5 py-1 text-xs font-semibold text-emerald">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-60" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
                        </span>
                        Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-ink/5 px-2.5 py-1 text-xs font-medium text-muted">
                        <Clock3 className="h-3 w-3 text-muted/70" />
                        Draft
                      </span>
                    )}
                  </td>

                  {/* 7. Updated Date */}
                  <td className="px-4 py-3.5 align-middle text-xs text-muted">
                    {formatDate(row.updatedAt)}
                  </td>

                  {/* 8. Action Buttons */}
                  <td className="px-4 py-3.5 text-right align-middle">
                    <div className="inline-flex items-center gap-1.5">
                      <Link
                        href={editHref}
                        aria-label={`Edit ${row.name}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white text-muted transition-colors hover:border-gold hover:bg-gold/10 hover:text-forest"
                        title="Edit product"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href="/spices"
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`View ${row.name} on public store`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white text-muted transition-colors hover:border-forest hover:bg-forest/10 hover:text-forest"
                        title="View on store"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stack View (< md) */}
      <div className="divide-y divide-line md:hidden">
        {rows.map((row) => {
          const editHref = `/admin/spices/${row._id}`;
          const firstMedia = row.images?.[0]?.mediaId;
          const imgUrl = firstMedia ? mediaUrl(firstMedia) : null;
          const categoryName = categoryMap.get(String(row.category)) || row.category || "Unassigned";
          const isLive = row.status === "published";

          return (
            <div key={row._id} className="p-4 transition-colors hover:bg-ivory/40">
              <div className="flex items-start gap-3.5">
                {/* Thumbnail */}
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-line bg-ivory">
                  {imgUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={imgUrl}
                      alt={row.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted">
                      <Package className="h-6 w-6 text-gold/40" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={editHref}
                      className="font-serif text-base font-semibold text-forest leading-snug line-clamp-1"
                    >
                      {row.name}
                    </Link>
                    {isLive ? (
                      <span className="shrink-0 rounded-full bg-emerald/10 px-2 py-0.5 text-[10px] font-semibold text-emerald">
                        Live
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-medium text-muted">
                        Draft
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-forest/8 px-2 py-0.5 text-[11px] font-medium text-forest">
                      {categoryName}
                    </span>
                    <span className="text-xs font-semibold text-forest">
                      {formatPrice(row.ourPrice || 0)}
                    </span>
                    {row.marketPrice > 0 ? (
                      <span className="text-xs text-muted line-through">
                        {formatPrice(row.marketPrice)}
                      </span>
                    ) : null}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-2 text-xs">
                    <span className="text-muted">Order: #{row.order ?? 0}</span>
                    <Link
                      href={editHref}
                      className="inline-flex items-center gap-1 font-semibold text-forest hover:text-gold-dark"
                    >
                      <Pencil className="h-3 w-3" /> Edit Product
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

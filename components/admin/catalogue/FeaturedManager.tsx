"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, Plus, Save, X } from "lucide-react";
import { adminRequest } from "@/lib/admin/client";
import { formatPrice } from "@/lib/cart/price";
import { Button } from "../Button";
import { useToast } from "../ToastNotification";

export type FeaturedVariantOption = { id: string; label: string; percent: number; sellingPrice: number; active: boolean };

export type FeaturedProductRow = {
  id: string;
  name: string;
  status: string;
  image: string | null;
  isFeatured: boolean;
  featuredOrder: number;
  featuredVariantId: string;
  variants: FeaturedVariantOption[];
};

const control = "h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15";

const variantLabel = (v: FeaturedVariantOption) =>
  `${v.label} · ${v.percent}% · ${formatPrice(v.sellingPrice)}/kg${v.active ? "" : " (inactive)"}`;

/** Why a featured product is not currently showing on the homepage, if anything. */
function hiddenReason(row: FeaturedProductRow) {
  if (row.status !== "published") return "Draft: not shown until published.";
  const selected = row.variants.find((v) => v.id === row.featuredVariantId);
  if (!selected) return "No quality selected: not shown.";
  if (!selected.active || !(selected.sellingPrice > 0)) return "Selected quality is unavailable: not shown.";
  return null;
}

async function saveFeatured(id: string, body: { isFeatured: boolean; featuredOrder?: number; featuredVariantId?: string | null }) {
  return adminRequest(`/api/admin/spices/${id}/featured`, { method: "PATCH", body });
}

function FeaturedRow({ row }: { row: FeaturedProductRow }) {
  const router = useRouter();
  const toast = useToast();
  const [variantId, setVariantId] = useState(row.featuredVariantId);
  const [order, setOrder] = useState(String(row.featuredOrder));
  const [pending, setPending] = useState(false);
  const dirty = variantId !== row.featuredVariantId || order !== String(row.featuredOrder);
  const hidden = hiddenReason(row);

  const run = async (body: Parameters<typeof saveFeatured>[1]) => {
    setPending(true);
    const result = await saveFeatured(row.id, body);
    setPending(false);
    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else toast.error(result.message);
  };

  return (
    <li className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-line bg-ivory">
          {/* eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail */}
          {row.image ? <img src={row.image} alt="" className="h-full w-full object-cover" loading="lazy" /> : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink">{row.name}</p>
          {hidden ? (
            <p className="flex items-center gap-1 text-xs font-medium text-amber-700">
              <AlertTriangle aria-hidden className="h-3.5 w-3.5 shrink-0" /> {hidden}
            </p>
          ) : (
            <p className="text-xs text-emerald">Showing on the homepage</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => run({ isFeatured: false })}
          disabled={pending}
          aria-label={`Remove ${row.name} from featured`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-50 hover:text-red-800 disabled:opacity-50"
        >
          <X aria-hidden className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-[5rem_1fr] items-end gap-2 sm:grid-cols-[1fr_5rem_auto]">
        <label className="col-span-2 min-w-0 text-xs text-muted sm:col-span-1">
          Quality shown
          <select value={variantId} onChange={(e) => setVariantId(e.target.value)} className={`mt-1 ${control}`}>
            <option value="">Select a quality</option>
            {row.variants.map((v) => (
              <option key={v.id} value={v.id}>{variantLabel(v)}</option>
            ))}
          </select>
        </label>
        <label className="text-xs text-muted">
          Order
          <input type="number" min={0} max={9999} inputMode="numeric" value={order} onChange={(e) => setOrder(e.target.value)} className={`mt-1 ${control}`} />
        </label>
        <Button
          variant="secondary"
          pending={pending}
          disabled={!dirty}
          icon={<Save aria-hidden className="h-4 w-4" />}
          aria-label={`Save featured settings for ${row.name}`}
          onClick={() => run({ isFeatured: true, featuredOrder: Number(order), featuredVariantId: variantId || null })}
        >
          Save
        </Button>
      </div>
    </li>
  );
}

function AddFeatured({ candidates, title }: { candidates: FeaturedProductRow[]; title: string }) {
  const router = useRouter();
  const toast = useToast();
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [pending, setPending] = useState(false);
  const product = candidates.find((c) => c.id === productId);

  if (!candidates.length) return <p className="mt-5 border-t border-line pt-4 text-xs text-muted">Every published {title.toLowerCase()} product is already featured.</p>;

  const add = async () => {
    setPending(true);
    const result = await saveFeatured(productId, { isFeatured: true, featuredVariantId: variantId });
    setPending(false);
    if (result.ok) {
      toast.success(result.message);
      setProductId("");
      setVariantId("");
      router.refresh();
    } else toast.error(result.message);
  };

  return (
    <div className="mt-5 grid gap-2 border-t border-line pt-4">
      <label className="text-xs text-muted">
        Add a {title.toLowerCase()} product
        <select
          value={productId}
          onChange={(e) => {
            setProductId(e.target.value);
            setVariantId("");
          }}
          className={`mt-1 ${control}`}
        >
          <option value="">Select a product</option>
          {candidates.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>
      {product ? (
        <label className="text-xs text-muted">
          Quality to show
          <select value={variantId} onChange={(e) => setVariantId(e.target.value)} className={`mt-1 ${control}`}>
            <option value="">Select a quality</option>
            {product.variants.filter((v) => v.active).map((v) => (
              <option key={v.id} value={v.id}>{variantLabel(v)}</option>
            ))}
          </select>
        </label>
      ) : null}
      <Button variant="primary" pending={pending} disabled={!variantId} icon={<Plus aria-hidden className="h-4 w-4" />} onClick={add}>
        Add to featured
      </Button>
    </div>
  );
}

/** Featured settings for one category. Powder and Solid are managed separately and never affect each other. */
export function FeaturedManager({ title, rows }: { title: string; rows: FeaturedProductRow[] }) {
  const featured = rows.filter((r) => r.isFeatured).sort((a, b) => a.featuredOrder - b.featuredOrder || a.name.localeCompare(b.name));
  const candidates = rows.filter((r) => !r.isFeatured && r.status === "published" && r.variants.some((v) => v.active && v.sellingPrice > 0));

  return (
    <section aria-label={`Featured ${title}`} className="rounded-2xl border border-line bg-white p-5">
      <h2 className="font-serif text-2xl text-forest">{title}</h2>
      <p className="mb-5 text-sm text-muted">{featured.length} featured</p>
      {featured.length ? (
        <ul className="divide-y divide-line">
          {/* Remounts after a save, so each row starts from the saved values. */}
          {featured.map((row) => (
            <FeaturedRow key={`${row.id}:${row.featuredVariantId}:${row.featuredOrder}`} row={row} />
          ))}
        </ul>
      ) : (
        <p className="rounded-xl bg-ivory px-4 py-6 text-center text-sm text-muted">Nothing featured in this category. The homepage shows a short placeholder message.</p>
      )}
      <AddFeatured candidates={candidates} title={title} />
    </section>
  );
}

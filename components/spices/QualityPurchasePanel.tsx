"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Download, ExternalLink, FileText, Loader2, MapPin, MessageCircle, ShoppingCart, X } from "lucide-react";
import { useCart } from "@/lib/cart/context";
import { discountPercent, formatPrice, lineTotal } from "@/lib/cart/price";
import type { PublicSpice, PublicVariant } from "@/lib/cms";
import { QuantityInput } from "./QuantityInput";

type PlacedOrder = { orderNumber: string; waHref: string | null };

/** Asks for the two details an order needs, saves it as pending, then hands over to WhatsApp. */
function WhatsAppOrderDialog({
  spice,
  variant,
  quantity,
  open,
  onClose,
}: {
  spice: PublicSpice;
  variant: PublicVariant;
  quantity: number;
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Checked here first so a simple slip does not use up one of the limited order attempts.
    const missing: Record<string, string> = {};
    if (name.trim().length < 2) missing.name = "Enter your name";
    if (phone.trim().length < 7) missing.phone = "Enter your WhatsApp number with country code";
    setErrors(missing);
    if (Object.keys(missing).length) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name: name.trim(), phone: phone.trim() },
          items: [{ productId: spice.id, variantId: variant.id, quantity, expectedPrice: variant.sellingPrice }],
          source: "whatsapp",
        }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setPlaced({ orderNumber: json.data.orderNumber, waHref: json.data.waHref });
        return;
      }
      // Product data on this page is out of date: refresh it so the customer sees what changed.
      if (res.status === 409 || res.status === 422) router.refresh();
      setErrors({
        form: json.message ?? "We could not place your order. Please try again.",
        name: json.errors?.["customer.name"] ?? "",
        phone: json.errors?.["customer.phone"] ?? "",
      });
    } catch {
      setErrors({ form: "Network error. Please check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const input = "h-11 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15";

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby={`${id}-title`}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-[1.25rem] bg-white p-0 text-ink backdrop:bg-forest-deep/60 backdrop:backdrop-blur-sm"
    >
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <h2 id={`${id}-title`} className="text-3xl leading-tight text-forest">
            {placed ? "Order saved" : "Order on WhatsApp"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="-mr-2 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-ink/5 hover:text-ink">
            <X aria-hidden className="h-5 w-5" />
          </button>
        </div>

        {placed ? (
          <>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Your order reference is <strong className="font-mono font-semibold text-forest">{placed.orderNumber}</strong>. It is pending until our team confirms availability, shipping and payment with you.
            </p>
            {placed.waHref ? (
              <a
                href={placed.waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center justify-center gap-2 rounded-full bg-[#0a3d2e] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#062a20]"
              >
                <MessageCircle aria-hidden className="h-4 w-4" /> Send order on WhatsApp <ExternalLink aria-hidden className="h-3.5 w-3.5" />
              </a>
            ) : (
              <p className="mt-6 rounded-xl bg-ivory p-4 text-sm text-muted">WhatsApp is not available right now. Our team will contact you on the number you gave us.</p>
            )}
          </>
        ) : (
          <form onSubmit={submit} noValidate>
            <dl className="mt-4 rounded-xl bg-ivory p-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{spice.name}</dt>
                <dd className="text-right font-medium">{variant.label}</dd>
              </div>
              <div className="mt-1 flex justify-between gap-4">
                <dt className="text-muted">{quantity} kg × {formatPrice(variant.sellingPrice, spice.currency)}</dt>
                <dd className="text-right font-semibold text-forest">{formatPrice(lineTotal(variant.sellingPrice, quantity), spice.currency)}</dd>
              </div>
            </dl>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor={`${id}-name`} className="mb-1.5 block text-sm font-medium">Your name</label>
                <input id={`${id}-name`} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required maxLength={100} aria-invalid={errors.name ? true : undefined} className={input} />
                {errors.name ? <p role="alert" className="mt-1 text-xs font-medium text-red-800">{errors.name}</p> : null}
              </div>
              <div>
                <label htmlFor={`${id}-phone`} className="mb-1.5 block text-sm font-medium">WhatsApp number</label>
                <input id={`${id}-phone`} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" required maxLength={30} placeholder="Include country code, e.g. +91" aria-invalid={errors.phone ? true : undefined} className={input} />
                {errors.phone ? <p role="alert" className="mt-1 text-xs font-medium text-red-800">{errors.phone}</p> : null}
              </div>
            </div>

            {errors.form ? <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{errors.form}</p> : null}

            <button type="submit" disabled={submitting} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-ivory transition-colors hover:bg-emerald disabled:opacity-60">
              {submitting ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : null}
              {submitting ? "Saving your order…" : "Continue"}
            </button>
            <p className="mt-3 text-center text-xs text-muted">No payment is taken online. Shipping and payment are confirmed by our team.</p>
          </form>
        )}
      </div>
    </dialog>
  );
}

/** Quality selection, pricing and ordering. Every figure shown belongs to the selected quality only. */
export function QualityPurchasePanel({ spice, whatsappEnabled, initialLevel }: { spice: PublicSpice; whatsappEnabled: boolean; initialLevel?: string }) {
  const { addItem } = useCart();
  const groupId = useId();
  // Opens on the quality named in the link when it is available, e.g. from a featured card.
  const [variantId, setVariantId] = useState((spice.variants.find((v) => v.level === initialLevel) ?? spice.variants[0]).id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [ordering, setOrdering] = useState(false);

  // If the selected quality was removed by a refresh, fall back to the first one available.
  const variant = spice.variants.find((v) => v.id === variantId) ?? spice.variants[0];
  const total = lineTotal(variant.sellingPrice, quantity);
  const saving = discountPercent(variant.marketPrice, variant.sellingPrice);

  useEffect(() => {
    setAdded(false);
  }, [variant.id]);

  const addToCart = () => {
    addItem({
      productId: spice.id,
      variantId: variant.id,
      name: spice.name,
      slug: spice.slug,
      image: spice.images[0]?.url ?? "",
      category: spice.productTypeLabel,
      quality: variant.label,
      qualityPercent: variant.qualityPercent,
      unitPrice: variant.sellingPrice,
      marketPrice: variant.marketPrice,
      currency: spice.currency,
      quantity,
    });
    setAdded(true);
  };

  return (
    <div className="mt-7">
      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Select quality</legend>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
          {spice.variants.map((v) => (
            <label
              key={v.id}
              className={`relative flex cursor-pointer flex-col rounded-xl border-2 p-3.5 transition-colors focus-within:ring-4 focus-within:ring-gold/25 ${
                v.id === variant.id ? "border-gold bg-champagne/20" : "border-line bg-white hover:border-gold/50"
              }`}
            >
              <input type="radio" name={groupId} value={v.id} checked={v.id === variant.id} onChange={() => setVariantId(v.id)} className="sr-only" />
              <span className="text-sm font-semibold text-forest">{v.label}</span>
              <span className="mt-0.5 text-xs text-muted">{v.qualityPercent}% quality</span>
              {v.id === variant.id ? <Check aria-hidden className="absolute right-2.5 top-2.5 h-4 w-4 text-gold-dark" /> : null}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Announced when the quality changes, so screen reader users hear the new figures. */}
      <div aria-live="polite" className="mt-6 rounded-[1.25rem] border border-line bg-white p-5 shadow-[0_24px_40px_-32px_rgba(6,47,37,0.4)]">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-serif text-4xl font-semibold tabular-nums text-forest">{formatPrice(variant.sellingPrice, spice.currency)}</span>
          <span className="text-sm text-muted">per kg</span>
          {saving > 0 ? <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-xs font-semibold text-forest">{saving}% below market</span> : null}
        </div>
        <dl className="mt-4 grid gap-3 border-t border-line pt-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted">Quality</dt>
            <dd className="mt-0.5 font-medium text-ink">{variant.qualityPercent}%</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Market price</dt>
            <dd className="mt-0.5 font-medium tabular-nums text-ink">{formatPrice(variant.marketPrice, spice.currency)} / kg</dd>
          </div>
          {variant.importArea ? (
            <div>
              <dt className="text-xs text-muted">Import area</dt>
              <dd className="mt-0.5 flex items-start gap-1 font-medium text-ink">
                <MapPin aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-dark" />
                {variant.importArea}
              </dd>
            </div>
          ) : null}
        </dl>
        {variant.specifications ? (
          <p className="mt-4 whitespace-pre-line border-t border-line pt-4 text-sm leading-relaxed text-muted">{variant.specifications}</p>
        ) : null}
      </div>

      {spice.highlights.length ? (
        <div className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Benefits</h2>
          <ul className="mt-3 space-y-2">
            {spice.highlights.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2.5 text-sm text-ink">
                <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-ivory-dark/60 px-4 py-3.5">
        {variant.labReport ? (
          <>
            <p className="flex min-w-0 items-center gap-2.5 text-sm font-medium text-forest">
              <FileText aria-hidden className="h-5 w-5 shrink-0 text-gold-dark" strokeWidth={1.5} />
              {variant.label} lab report
            </p>
            <div className="flex items-center gap-4 text-sm font-semibold text-forest">
              <a href={variant.labReport.previewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 py-1 hover:text-gold-dark">
                <ExternalLink aria-hidden className="h-4 w-4" /> Preview
              </a>
              <a href={variant.labReport.downloadUrl} download={variant.labReport.fileName} className="inline-flex items-center gap-1.5 py-1 hover:text-gold-dark">
                <Download aria-hidden className="h-4 w-4" /> Download
              </a>
            </div>
          </>
        ) : (
          <p className="flex items-center gap-2.5 text-sm text-muted">
            <FileText aria-hidden className="h-5 w-5 shrink-0" strokeWidth={1.5} />
            A lab report for this quality is not available yet.
          </p>
        )}
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Quantity (kg)</p>
          <QuantityInput value={quantity} onChange={setQuantity} />
          <p className="mt-2 text-xs text-muted">Minimum order 1 kg, in whole kilograms.</p>
        </div>
        <div className="text-right" aria-live="polite">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Total</p>
          <p className="font-serif text-4xl font-semibold tabular-nums text-forest">{formatPrice(total, spice.currency)}</p>
          <p className="text-xs text-muted">{quantity} kg × {formatPrice(variant.sellingPrice, spice.currency)}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={addToCart}
          className={`flex flex-1 items-center justify-center gap-2.5 rounded-full px-7 py-4 text-sm font-semibold transition-colors ${
            added ? "bg-emerald text-ivory" : "bg-forest text-ivory hover:bg-emerald"
          }`}
        >
          {added ? <Check aria-hidden className="h-4 w-4" /> : <ShoppingCart aria-hidden className="h-4 w-4" />}
          {added ? "Added to Cart" : "Add to Cart"}
        </button>
        {whatsappEnabled ? (
          <button
            type="button"
            onClick={() => setOrdering(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-forest/25 px-6 py-4 text-sm font-semibold text-forest transition-colors hover:border-gold hover:bg-champagne/20"
          >
            <MessageCircle aria-hidden className="h-4 w-4 text-[#0a3d2e]" /> WhatsApp Order
          </button>
        ) : null}
      </div>

      <div role="status">
        {added ? (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-forest">
            <span>{spice.name} ({variant.label}) is in your cart.</span>
            <Link href="/cart" className="inline-flex shrink-0 items-center gap-1 font-semibold underline underline-offset-2 hover:text-gold-dark">
              View cart <ArrowRight aria-hidden className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : null}
      </div>

      {whatsappEnabled ? (
        <WhatsAppOrderDialog
          // Each opening starts a fresh form, so a saved reference is never shown against different details.
          key={ordering ? "ordering" : "idle"}
          spice={spice}
          variant={variant}
          quantity={quantity}
          open={ordering}
          onClose={() => setOrdering(false)}
        />
      ) : null}
    </div>
  );
}

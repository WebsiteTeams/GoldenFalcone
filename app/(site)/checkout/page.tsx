"use client";

import { useId, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Clock3,
  ExternalLink,
  Loader2,
  MessageCircle,
  Package,
  ShoppingBag,
} from "lucide-react";
import { useCart, useCartValidation, type CartLineUpdate } from "@/lib/cart/context";
import { formatPrice } from "@/lib/cart/price";

type FormState = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  notes: string;
};

type OrderSuccess = {
  orderNumber: string;
  orderId: string;
  waHref: string | null;
  message: string;
};

const inputClass = (error?: string) =>
  `w-full rounded-xl border bg-ivory/50 px-4 py-3 text-sm text-ink transition-all focus:bg-white focus:outline-none focus:ring-2 ${
    error ? "border-red-400 focus:ring-red-200" : "border-line focus:border-gold focus:ring-gold/20"
  }`;

function TextField({
  label,
  name,
  value,
  onChange,
  error,
  hint,
  required,
  type = "text",
  autoComplete,
  placeholder,
  className,
}: {
  label: string;
  name: keyof FormState;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
        {label} {required ? <span className="text-red-800">*</span> : null}
      </label>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-note` : undefined}
        className={inputClass(error)}
      />
      {error ? (
        <p id={`${id}-note`} role="alert" className="mt-1 text-xs font-medium text-red-800">{error}</p>
      ) : hint ? (
        <p id={`${id}-note`} className="mt-1 text-[11px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export default function CheckoutPage() {
  const { items, ready, itemCount, totalKg, subtotal, clearCart, syncLines } = useCart();
  useCartValidation();

  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    postalCode: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<OrderSuccess | null>(null);

  const currency = items[0]?.currency ?? "INR";
  const unavailable = items.filter((i) => i.unavailableReason);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Client-side quick check
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.phone.trim()) newErrors.phone = "WhatsApp phone number is required";
    if (items.length === 0) newErrors.general = "Your cart is empty";
    if (unavailable.length > 0) newErrors.general = "Some items are no longer available. Return to your cart to remove them.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        customer: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          country: form.country.trim(),
          state: form.state.trim(),
          city: form.city.trim(),
          address: form.address.trim(),
          postalCode: form.postalCode.trim(),
        },
        // The price is sent only so the server can detect a change. It is never used to charge.
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          expectedPrice: item.unitPrice,
        })),
        notes: form.notes.trim(),
        source: "website",
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        const next: Record<string, string> = { general: data.message || "Failed to submit order. Please try again." };
        const updates: CartLineUpdate[] = [];
        for (const [key, message] of Object.entries((data.errors ?? {}) as Record<string, string>)) {
          if (key.startsWith("customer.")) next[key.slice("customer.".length)] = message;
          else if (key.startsWith("item_") && res.status === 422) updates.push({ ok: false, variantId: key.slice("item_".length), reason: message });
        }
        if (res.status === 409 && data.data?.lines) updates.push(...(data.data.lines as CartLineUpdate[]));
        if (updates.length) syncLines(updates);
        setErrors(next);
        return;
      }

      // Order saved. It stays pending until the Goldenfalcone team confirms it.
      const orderData: OrderSuccess = data.data;
      setSuccess(orderData);
      clearCart();

      if (orderData.waHref) {
        setTimeout(() => {
          window.location.href = orderData.waHref!;
        }, 500);
      }
    } catch {
      setErrors({ general: "Network error occurred. Please check your connection and try again." });
    } finally {
      setLoading(false);
    }
  };

  // If order was submitted successfully, show the order received screen
  if (success) {
    return (
      <div className="min-h-screen bg-ivory pb-24">
        <div className="h-24 bg-forest-deep" />
        <div className="container-lux mx-auto max-w-2xl pt-12">
          <div className="rounded-3xl border border-line bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gold/15 text-gold-dark">
              <Clock3 aria-hidden className="h-10 w-10" strokeWidth={1.5} />
            </div>

            <p className="eyebrow mb-2 text-gold-dark">Order Received</p>
            <h1 className="font-serif text-3xl text-forest sm:text-4xl">Thank you for your order</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              Your order is saved and pending confirmation. {success.waHref ? "We are opening WhatsApp so you can send it to our sales team." : "Our sales team will contact you on the number you gave us."}
            </p>

            <div className="my-8 space-y-3 rounded-2xl border border-line bg-ivory p-6 text-left">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">Order Reference</span>
                <span className="font-mono text-sm font-bold text-forest sm:text-base">{success.orderNumber}</span>
              </div>
              <p className="text-xs leading-relaxed text-muted">
                Our team will confirm availability, shipping and payment with you before the order goes ahead.
                {success.waHref ? " If WhatsApp did not open automatically, use the button below." : ""}
              </p>
            </div>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              {success.waHref && (
                <a
                  href={success.waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0a3d2e] px-8 py-3.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#062a20]"
                >
                  <MessageCircle aria-hidden className="h-4 w-4" />
                  Send Order on WhatsApp
                  <ExternalLink aria-hidden className="h-3.5 w-3.5" />
                </a>
              )}
              <Link
                href="/spices/shop"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-8 py-3.5 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-ivory"
              >
                Back to Spices Store
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-ivory" aria-busy="true" aria-label="Loading your order">
        <div className="h-24 bg-forest-deep" />
      </div>
    );
  }

  // If cart is empty, show empty cart message
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-ivory">
        <div className="h-24 bg-forest-deep" />
        <div className="flex items-center justify-center px-4 py-24">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-forest text-gold">
              <ShoppingBag aria-hidden className="h-10 w-10 stroke-[1.2]" />
            </div>
            <h1 className="mb-3 font-serif text-3xl text-forest">Your cart is empty</h1>
            <p className="mb-6 text-sm text-muted">Add spice products to your cart before proceeding to checkout.</p>
            <Link
              href="/spices/shop"
              className="inline-flex items-center gap-2 rounded-full bg-forest px-8 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-emerald"
            >
              <ArrowLeft aria-hidden className="h-4 w-4" />
              Browse Spices
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const fieldProps = (name: keyof FormState) => ({ name, value: form[name], onChange: handleChange, error: errors[name] });

  return (
    <div className="min-h-screen bg-ivory pb-24">
      <div className="h-24 bg-forest-deep" />
      <div className="container-lux pt-10">
        {/* Header */}
        <div className="mb-10">
          <Link href="/cart" className="mb-2 inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-forest">
            <ArrowLeft aria-hidden className="h-3.5 w-3.5" /> Back to Cart
          </Link>
          <h1 className="font-serif text-3xl text-forest sm:text-5xl">Review &amp; Checkout</h1>
          <p className="mt-1 text-sm text-muted">Place your order, then send it to Goldenfalcone on WhatsApp.</p>
        </div>

        {errors.general && (
          <div role="alert" className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {errors.general}
            {unavailable.length > 0 ? <> <Link href="/cart" className="font-semibold underline">Return to cart</Link></> : null}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid items-start gap-10 lg:grid-cols-12">
            {/* Left: Customer Information Form */}
            <div className="space-y-8 lg:col-span-7">
              {/* Customer Contact Details */}
              <div className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
                <h2 className="mb-6 font-serif text-xl text-forest sm:text-2xl">1. Contact Information</h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField label="Full Name" required autoComplete="name" className="sm:col-span-2" {...fieldProps("name")} />
                  <TextField label="WhatsApp Phone Number" required type="tel" autoComplete="tel" placeholder="+91 98765 43210" hint="Include country code (e.g. +91, +971, +1)" {...fieldProps("phone")} />
                  <TextField label="Email Address (optional)" type="email" autoComplete="email" {...fieldProps("email")} />
                </div>
              </div>

              {/* Delivery Address */}
              <div className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
                <h2 className="mb-6 font-serif text-xl text-forest sm:text-2xl">2. Delivery Address</h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField label="Street Address / Company / Warehouse" autoComplete="street-address" className="sm:col-span-2" {...fieldProps("address")} />
                  <TextField label="City" autoComplete="address-level2" {...fieldProps("city")} />
                  <TextField label="State / Province" autoComplete="address-level1" {...fieldProps("state")} />
                  <TextField label="Country" autoComplete="country-name" {...fieldProps("country")} />
                  <TextField label="Postal Code / PIN / ZIP" autoComplete="postal-code" {...fieldProps("postalCode")} />
                  <div className="sm:col-span-2">
                    <label htmlFor="order-notes" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
                      Order Notes &amp; Special Requirements
                    </label>
                    <textarea id="order-notes" name="notes" rows={3} maxLength={2000} value={form.notes} onChange={handleChange} className={inputClass()} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Order Summary Sidebar */}
            <div className="lg:sticky lg:top-28 lg:col-span-5">
              <div className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
                <h2 className="mb-5 font-serif text-2xl text-forest">Order Items ({itemCount})</h2>

                {/* Items list */}
                <div className="max-h-72 divide-y divide-line overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex items-center gap-4 py-3.5">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line bg-ivory">
                        {item.image ? (
                          <Image src={item.image} alt="" fill className="object-cover" sizes="56px" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package aria-hidden className="h-6 w-6 text-gold/30" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-serif text-base font-medium text-forest">{item.name}</p>
                        <p className="text-xs text-muted">{item.quality} ({item.qualityPercent}%)</p>
                        {item.unavailableReason ? (
                          <p className="text-xs font-medium text-red-800">{item.unavailableReason}</p>
                        ) : (
                          <p className="text-xs tabular-nums text-muted">{item.quantity} kg × {formatPrice(item.unitPrice, item.currency)}</p>
                        )}
                      </div>
                      {!item.unavailableReason ? (
                        <span className="shrink-0 text-sm font-semibold tabular-nums text-forest">{formatPrice(item.lineTotal, item.currency)}</span>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="my-5 h-px bg-line" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted">
                    <span>Total quantity</span>
                    <span className="font-semibold tabular-nums text-forest">{totalKg} kg</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>Shipping &amp; Handling</span>
                    <span className="text-xs font-medium text-gold-dark">Confirmed by our team</span>
                  </div>
                </div>

                <div className="my-5 h-px bg-line" />

                <div className="mb-6 flex items-baseline justify-between">
                  <span className="font-serif text-lg font-bold text-forest">Total</span>
                  <span className="font-serif text-2xl font-bold tabular-nums text-forest" aria-live="polite">{formatPrice(subtotal, currency)}</span>
                </div>

                <button
                  type="submit"
                  disabled={loading || unavailable.length > 0}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0a3d2e] px-8 py-4 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#062a20] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                      Saving Your Order…
                    </>
                  ) : (
                    <>
                      <MessageCircle aria-hidden className="h-4 w-4" />
                      Place Order via WhatsApp
                    </>
                  )}
                </button>

                <p className="mt-4 text-center text-[11px] leading-relaxed text-muted">
                  Your order is saved with a reference number and a WhatsApp message is prepared for our sales desk. No payment is charged online.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

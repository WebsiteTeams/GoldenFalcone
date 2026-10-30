"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MessageCircle,
  Package,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "@/lib/cart/context";
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

export default function CheckoutPage() {
  const { items, itemCount, subtotal, clearCart } = useCart();

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        notes: form.notes.trim(),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: data.message || "Failed to submit order. Please try again." });
        }
        setLoading(false);
        return;
      }

      // Order created successfully!
      const orderData: OrderSuccess = data.data;
      setSuccess(orderData);
      clearCart();

      // Open WhatsApp to send order to 9790586474
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

  // If order was submitted successfully, show order confirmation screen
  if (success) {
    return (
      <div className="min-h-screen bg-ivory pt-28 pb-24">
        <div className="container-lux max-w-2xl mx-auto">
          <div className="rounded-3xl border border-line bg-white p-8 sm:p-12 text-center shadow-sm">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald/15 text-emerald">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <p className="eyebrow text-gold-dark mb-2">Order Confirmed</p>
            <h1 className="font-serif text-3xl sm:text-4xl text-forest">Thank you for your order!</h1>
            <p className="mt-3 text-muted text-sm sm:text-base leading-relaxed">
              Your order reference has been registered. You are being redirected to WhatsApp to send your order items to our sales team at{" "}
              <strong className="text-forest font-semibold">+91 97905 86474</strong>.
            </p>

            <div className="my-8 rounded-2xl bg-ivory p-6 border border-line text-left space-y-3">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <span className="text-xs uppercase tracking-wider text-muted font-semibold">
                  Order Reference
                </span>
                <span className="font-mono font-bold text-forest text-sm sm:text-base">
                  {success.orderNumber}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">WhatsApp Recipient:</span>
                <span className="font-semibold text-forest">+91 97905 86474</span>
              </div>
              <p className="text-xs text-muted leading-relaxed pt-2 border-t border-line/60">
                If WhatsApp did not open automatically, click the button below to send your ordered items directly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {success.waHref && (
                <a
                  href={success.waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-8 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-[#1EBE5D] transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Send Order on WhatsApp (+91 97905 86474)
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <Link
                href="/spices"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-8 py-3.5 text-sm font-semibold text-forest hover:bg-forest hover:text-ivory transition-colors"
              >
                Back to Spices Store
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty, show empty cart message
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-4 pt-24 pb-16">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-forest text-gold">
            <ShoppingBag className="h-10 w-10 stroke-[1.2]" />
          </div>
          <h1 className="font-serif text-3xl text-forest mb-3">Your cart is empty</h1>
          <p className="text-muted text-sm mb-6">
            Add spice products to your cart before proceeding to checkout.
          </p>
          <Link
            href="/spices"
            className="inline-flex items-center gap-2 rounded-full bg-forest px-8 py-3 text-sm font-semibold text-ivory hover:bg-gold hover:text-forest transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse Spices Catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory pt-28 pb-24">
      <div className="container-lux">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <Link
              href="/cart"
              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-forest transition-colors mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Cart
            </Link>
            <h1 className="font-serif text-3xl sm:text-5xl text-forest">Review & Checkout</h1>
            <p className="mt-1 text-sm text-muted">
              Submit your order enquiry directly to Goldenfalcone via WhatsApp.
            </p>
          </div>
        </div>

        {errors.general && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-10 lg:grid-cols-12 items-start">
            {/* Left: Customer Information Form */}
            <div className="lg:col-span-7 space-y-8">
              {/* Customer Contact Details */}
              <div className="rounded-3xl border border-line bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="font-serif text-xl sm:text-2xl text-forest mb-6">
                  1. Contact Information
                </h2>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Rahul Sharma"
                      required
                      className={`w-full rounded-xl border px-4 py-3 text-sm text-ink bg-ivory/50 focus:bg-white focus:outline-none transition-all ${
                        errors.name
                          ? "border-red-400 focus:ring-2 focus:ring-red-200"
                          : "border-line focus:border-gold focus:ring-2 focus:ring-gold/20"
                      }`}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                      WhatsApp Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      required
                      className={`w-full rounded-xl border px-4 py-3 text-sm text-ink bg-ivory/50 focus:bg-white focus:outline-none transition-all ${
                        errors.phone
                          ? "border-red-400 focus:ring-2 focus:ring-red-200"
                          : "border-line focus:border-gold focus:ring-2 focus:ring-gold/20"
                      }`}
                    />
                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                    <p className="mt-1 text-[11px] text-muted">
                      Include country code (e.g. +91, +971, +1)
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                      Email Address <span className="text-muted/60 font-normal">(optional)</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="rahul@example.com"
                      className="w-full rounded-xl border border-line bg-ivory/50 px-4 py-3 text-sm text-ink focus:bg-white focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="rounded-3xl border border-line bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="font-serif text-xl sm:text-2xl text-forest mb-6">
                  2. Delivery & Destination Address
                </h2>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                      Street Address / Company / Warehouse
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Street name, building, unit, or industrial area"
                      className="w-full rounded-xl border border-line bg-ivory/50 px-4 py-3 text-sm text-ink focus:bg-white focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="e.g. Kochi, Mumbai, Dubai"
                      className="w-full rounded-xl border border-line bg-ivory/50 px-4 py-3 text-sm text-ink focus:bg-white focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                      State / Province
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="e.g. Kerala, Maharashtra"
                      className="w-full rounded-xl border border-line bg-ivory/50 px-4 py-3 text-sm text-ink focus:bg-white focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      placeholder="India, UAE, UK, etc."
                      className="w-full rounded-xl border border-line bg-ivory/50 px-4 py-3 text-sm text-ink focus:bg-white focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                      Postal Code / PIN / ZIP
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={form.postalCode}
                      onChange={handleChange}
                      placeholder="e.g. 682001"
                      className="w-full rounded-xl border border-line bg-ivory/50 px-4 py-3 text-sm text-ink focus:bg-white focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                      Order Notes & Special Requirements
                    </label>
                    <textarea
                      name="notes"
                      rows={3}
                      value={form.notes}
                      onChange={handleChange}
                      placeholder="Specific grading, custom packaging, preferred delivery dates, or export documentation requirements..."
                      className="w-full rounded-xl border border-line bg-ivory/50 px-4 py-3 text-sm text-ink focus:bg-white focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Order Summary Sidebar */}
            <div className="lg:col-span-5 lg:sticky lg:top-28">
              <div className="rounded-3xl border border-line bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="font-serif text-2xl text-forest mb-5">Order Items ({itemCount})</h2>

                {/* Items list */}
                <div className="divide-y divide-line max-h-72 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.productId} className="py-3.5 flex gap-4 items-center">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-ivory border border-line">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="h-6 w-6 text-gold/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-sm font-medium text-forest truncate">{item.name}</p>
                        <p className="text-xs text-muted">
                          Qty: {item.quantity} {item.unit || ""} × {formatPrice(item.unitPrice, item.currency)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-forest shrink-0">
                        {formatPrice(item.unitPrice * item.quantity, item.currency)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="my-5 h-px bg-line" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted">
                    <span>Products Subtotal</span>
                    <span className="font-semibold text-forest">{formatPrice(subtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>Shipping & Handling</span>
                    <span className="text-xs font-medium text-gold-dark">Confirmed via WhatsApp</span>
                  </div>
                </div>

                <div className="my-5 h-px bg-line" />

                <div className="flex justify-between items-baseline mb-6">
                  <span className="font-serif text-lg font-bold text-forest">Estimated Subtotal</span>
                  <span className="font-serif text-2xl font-bold text-forest">
                    {formatPrice(subtotal, currency)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-8 py-4 text-sm font-semibold text-white shadow-md hover:bg-[#1EBE5D] disabled:opacity-50 transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Order & Message...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4" />
                      Submit Order via WhatsApp
                    </>
                  )}
                </button>

                <p className="mt-4 text-[11px] text-center text-muted leading-relaxed">
                  Submitting will securely save your order reference and prepare a WhatsApp message for the Goldenfalcone sales desk. No payment is charged online.
                </p>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted border-t border-line pt-4">
                  <ShieldCheck className="h-4 w-4 text-gold-dark" />
                  <span>Direct Export & Wholesale Verified Supply</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

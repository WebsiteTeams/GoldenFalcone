"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ArrowRight, ShoppingCart, Trash2, Package, ArrowLeft } from "lucide-react";
import { QuantityInput } from "@/components/spices/QuantityInput";
import { useCart, useCartValidation } from "@/lib/cart/context";
import { formatPrice } from "@/lib/cart/price";

export default function CartPage() {
  const { items, ready, itemCount, totalKg, subtotal, updateQty, removeItem, clearCart } = useCart();
  useCartValidation();

  const hasUnavailable = items.some((i) => i.unavailableReason);

  if (!ready) {
    return (
      <div className="min-h-screen bg-ivory" aria-busy="true" aria-label="Loading your cart">
        <div className="h-24 bg-forest-deep" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-ivory">
        <div className="h-24 bg-forest-deep" />
        <div className="flex items-center justify-center px-4 py-24">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-md text-center">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-forest">
              <ShoppingCart aria-hidden className="h-10 w-10 text-gold" strokeWidth={1.2} />
            </div>
            <h1 className="mb-4 font-serif text-4xl text-forest">Your cart is empty</h1>
            <p className="mb-8 text-muted">Choose a product and quality, and it will appear here.</p>
            <Link
              href="/spices/shop"
              className="inline-flex items-center gap-2 rounded-full bg-forest px-8 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-emerald"
            >
              <ArrowLeft aria-hidden className="h-4 w-4" />
              Browse Spices
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const currency = items[0]?.currency ?? "INR";

  return (
    <div className="min-h-screen bg-ivory pb-24">
      <div className="h-24 bg-forest-deep" />
      <div className="container-lux pt-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <p className="eyebrow mb-2 text-gold-dark">Spice Store</p>
            <h1 className="font-serif text-4xl text-forest sm:text-5xl">Your Cart</h1>
            <p className="mt-1 text-muted">{itemCount} item{itemCount !== 1 ? "s" : ""} · {totalKg} kg</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/spices/shop" className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-forest">
              <ArrowLeft aria-hidden className="h-4 w-4" />
              Continue Shopping
            </Link>
            <button
              type="button"
              onClick={clearCart}
              className="flex items-center gap-1.5 text-sm text-red-800 transition-colors hover:text-red-950"
            >
              <Trash2 aria-hidden className="h-4 w-4" />
              Clear Cart
            </button>
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Items */}
          <div className="space-y-4 lg:col-span-2">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.variantId}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40, scale: 0.96 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex gap-4 rounded-2xl border bg-white p-4 sm:gap-5 sm:p-5 ${item.unavailableReason ? "border-red-200" : "border-line"}`}
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ivory-dark">
                    {item.image ? (
                      <Image src={item.image} alt="" fill className="object-cover" sizes="80px" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package aria-hidden className="h-8 w-8 text-gold/30" />
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="font-serif text-xl leading-snug text-forest">
                          {item.slug ? <Link href={`/spices/${item.slug}`} className="hover:text-gold-dark">{item.name}</Link> : item.name}
                        </h2>
                        <p className="text-xs text-muted">
                          {[item.category, `${item.quality} (${item.qualityPercent}%)`].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        aria-label={`Remove ${item.name}, ${item.quality}, from cart`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-red-50 hover:text-red-800"
                      >
                        <Trash2 aria-hidden className="h-4 w-4" />
                      </button>
                    </div>

                    {item.unavailableReason ? (
                      <p role="alert" className="flex items-start gap-2 text-sm text-red-800">
                        <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                        {item.unavailableReason} Remove it to continue.
                      </p>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <QuantityInput
                          value={item.quantity}
                          onChange={(kg) => updateQty(item.variantId, kg)}
                          label={`Quantity of ${item.name}, ${item.quality}, in kilograms`}
                        />
                        <div className="text-right">
                          <p className="font-semibold tabular-nums text-forest">{formatPrice(item.lineTotal, item.currency)}</p>
                          <p className="text-xs tabular-nums text-muted">{formatPrice(item.unitPrice, item.currency)} per kg</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="h-fit rounded-2xl border border-line bg-white p-6 lg:sticky lg:top-28"
          >
            <h2 className="mb-5 font-serif text-2xl text-forest">Order Summary</h2>

            <div className="space-y-3 text-sm">
              {items.filter((i) => !i.unavailableReason).map((item) => (
                <div key={item.variantId} className="flex justify-between gap-3 text-muted">
                  <span className="min-w-0">{item.name}, {item.quality} × {item.quantity} kg</span>
                  <span className="shrink-0 tabular-nums">{formatPrice(item.lineTotal, item.currency)}</span>
                </div>
              ))}
            </div>

            <div className="my-5 h-px bg-line" />

            <div className="flex items-baseline justify-between">
              <span className="font-medium text-forest">Cart total</span>
              <span className="text-xl font-bold tabular-nums text-forest" aria-live="polite">{formatPrice(subtotal, currency)}</span>
            </div>
            <p className="mt-1 text-xs text-muted">Shipping is confirmed by Goldenfalcone after you place your order.</p>

            {hasUnavailable ? (
              <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-800">
                Remove unavailable items to continue.
              </p>
            ) : (
              <Link
                href="/checkout"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-ivory transition-colors hover:bg-emerald"
              >
                Proceed to Checkout
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

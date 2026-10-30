"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Minus, Plus, ShoppingCart, Trash2, Package, ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/cart/context";
import { formatPrice } from "@/lib/cart/price";

export default function CartPage() {
  const { items, itemCount, subtotal, updateQty, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-forest">
            <ShoppingCart className="h-10 w-10 text-gold" strokeWidth={1.2} />
          </div>
          <h1 className="font-serif text-4xl text-forest mb-4">Your cart is empty</h1>
          <p className="text-muted mb-8">Add some spices to your cart and they will appear here.</p>
          <Link
            href="/spices"
            className="inline-flex items-center gap-2 rounded-full bg-forest px-8 py-3 text-sm font-semibold text-ivory hover:bg-gold hover:text-forest transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse Spices
          </Link>
        </motion.div>
      </div>
    );
  }

  const currency = items[0]?.currency ?? "INR";

  return (
    <div className="min-h-screen bg-ivory pt-28 pb-24">
      <div className="container-lux">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-center justify-between flex-wrap gap-4"
        >
          <div>
            <p className="eyebrow text-gold-dark mb-2">Spice Store</p>
            <h1 className="font-serif text-4xl sm:text-5xl text-forest">Your Cart</h1>
            <p className="mt-1 text-muted">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/spices" className="text-sm text-muted hover:text-forest transition-colors flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:text-red-700 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              Clear Cart
            </button>
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40, scale: 0.96 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="flex gap-5 rounded-2xl border border-line bg-white p-5"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ivory-dark">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-8 w-8 text-gold/30" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-2 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-serif text-lg text-forest leading-snug">{item.name}</h3>
                        {item.unit && <p className="text-xs text-muted">{item.unit}</p>}
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        aria-label={`Remove ${item.name} from cart`}
                        className="text-muted hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-3">
                      {/* Qty control */}
                      <div className="flex items-center gap-2 rounded-full border border-line bg-ivory px-1 py-1">
                        <button
                          onClick={() => updateQty(item.productId, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-[2rem] text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.productId, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-bold text-forest">{formatPrice(item.unitPrice * item.quantity, item.currency)}</p>
                        <p className="text-xs text-muted">{formatPrice(item.unitPrice, item.currency)} each</p>
                      </div>
                    </div>
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
            className="rounded-2xl border border-line bg-white p-6 h-fit lg:sticky lg:top-28"
          >
            <h2 className="font-serif text-2xl text-forest mb-5">Order Summary</h2>

            <div className="space-y-3 text-sm">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-muted">
                  <span className="truncate pr-2">{item.name} ×{item.quantity}</span>
                  <span className="shrink-0 tabular-nums">{formatPrice(item.unitPrice * item.quantity, item.currency)}</span>
                </div>
              ))}
            </div>

            <div className="my-5 h-px bg-line" />

            <div className="flex justify-between items-baseline">
              <span className="font-medium text-forest">Subtotal</span>
              <span className="font-bold text-xl text-forest tabular-nums">{formatPrice(subtotal, currency)}</span>
            </div>
            <p className="mt-1 text-xs text-muted">Shipping will be confirmed by Goldenfalcone after you place your order via WhatsApp.</p>

            <Link
              href="/checkout"
              className="mt-6 flex items-center justify-center gap-2 w-full rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-ivory hover:bg-gold hover:text-forest transition-all duration-300"
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/spices"
              className="mt-3 flex items-center justify-center gap-2 w-full rounded-full border border-line px-6 py-3 text-sm text-muted hover:border-forest hover:text-forest transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
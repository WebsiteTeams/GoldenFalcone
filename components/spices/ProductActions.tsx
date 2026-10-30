"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, MessageCircle, Check, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart/context";
import { formatPrice } from "@/lib/cart/price";
import type { PublicSpice } from "@/lib/cms";

export function ProductActions({
  spice,
  whatsappNumber,
}: {
  spice: PublicSpice;
  whatsappNumber: string;
}) {
  const minQty = spice.minimumOrderQuantity && spice.minimumOrderQuantity > 0 ? spice.minimumOrderQuantity : 1;
  const [quantity, setQuantity] = useState(minQty);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const isAvailable = spice.availability !== "unavailable";
  const hasPrice = typeof spice.ourPrice === "number" && spice.ourPrice > 0;

  const handleAddToCart = () => {
    if (!hasPrice || !isAvailable) return;
    addItem({
      productId: spice.id,
      name: spice.name,
      slug: spice.slug,
      image: spice.images[0]?.url,
      unitPrice: spice.ourPrice!,
      currency: spice.currency || "INR",
      unit: spice.unit,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2400);
  };

  // Direct WhatsApp message for single product "Buy Now / Order Enquiry"
  const waOrderMsg = hasPrice
    ? `Hello Goldenfalcone, I would like to order:\n\n*${spice.name}*\nQuantity: ${quantity}${spice.unit ? ` ${spice.unit}` : ""}\nPrice: ${formatPrice(spice.ourPrice! * quantity, spice.currency)}\n\nPlease let me know availability and delivery details.`
    : `Hello Goldenfalcone, I would like to enquire about:\n\n*${spice.name}*\nRequired quantity: ${quantity}${spice.unit ? ` ${spice.unit}` : ""}\n\nPlease share price and terms.`;

  const normalizedWa = (whatsappNumber || "919790586474").replace(/\D/g, "");
  const targetNumber = normalizedWa.length === 10 ? `91${normalizedWa}` : (normalizedWa || "919790586474");
  const waHref = `https://wa.me/${targetNumber}?text=${encodeURIComponent(waOrderMsg)}`;

  return (
    <div className="space-y-5">
      {/* Quantity Selector (if available and has price) */}
      {isAvailable && (
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Quantity
          </span>
          <div className="flex items-center rounded-full border border-line bg-white px-2 py-1 shadow-sm">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(minQty, q - 1))}
              disabled={quantity <= minQty}
              aria-label="Decrease quantity"
              className="flex h-8 w-8 items-center justify-center rounded-full text-forest hover:bg-ivory disabled:opacity-30 transition-colors"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <input
              type="number"
              min={minQty}
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= minQty) setQuantity(val);
              }}
              className="w-14 text-center font-semibold text-ink text-sm bg-transparent focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Increase quantity"
              className="flex h-8 w-8 items-center justify-center rounded-full text-forest hover:bg-ivory transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          {spice.unit && <span className="text-xs text-muted font-medium">{spice.unit}</span>}
          {minQty > 1 && (
            <span className="text-xs text-gold-dark font-medium">
              (Min. order: {minQty})
            </span>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {hasPrice && isAvailable ? (
          <>
            <button
              type="button"
              onClick={handleAddToCart}
              className={`flex-1 inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold transition-all duration-300 shadow-sm ${
                added
                  ? "bg-emerald text-ivory ring-2 ring-emerald/30"
                  : "bg-forest text-ivory hover:bg-gold hover:text-forest"
              }`}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" /> Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" /> Add to Cart
                </>
              )}
            </button>

            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-forest/20 bg-forest/5 px-6 py-3.5 text-sm font-semibold text-forest hover:bg-forest hover:text-ivory transition-all duration-300"
            >
              <MessageCircle className="h-4 w-4 text-[#25D366]" />
              Order on WhatsApp
            </a>
          </>
        ) : (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-forest px-8 py-3.5 text-sm font-semibold text-ivory hover:bg-gold hover:text-forest transition-all duration-300 shadow-sm"
          >
            <MessageCircle className="h-4 w-4 text-[#25D366]" />
            Enquire on WhatsApp
          </a>
        )}
      </div>

      {added && (
        <div className="flex items-center justify-between rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-xs text-forest">
          <span>Item added to your order cart!</span>
          <Link href="/cart" className="font-semibold underline flex items-center gap-1 hover:text-gold-dark">
            View Cart <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}

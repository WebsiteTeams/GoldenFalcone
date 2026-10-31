import { MAX_ORDER_KG, MIN_ORDER_KG } from "@/lib/admin/constants";

/** Currency symbol map and price formatting utilities. */

const SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  AED: "AED ",
  GBP: "£",
  EUR: "€",
  SGD: "S$",
};

export function currencySymbol(currency: string) {
  return SYMBOLS[currency] ?? `${currency} `;
}

export function formatPrice(amount: number, currency = "INR"): string {
  return `${currencySymbol(currency)}${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function discountPercent(market: number, our: number): number {
  if (market <= 0 || our >= market) return 0;
  return Math.round(((market - our) / market) * 100);
}

/** Whole kilograms within the allowed order range. Anything unusable falls back to the minimum. */
export function clampKg(quantity: number): number {
  if (!Number.isFinite(quantity)) return MIN_ORDER_KG;
  return Math.min(MAX_ORDER_KG, Math.max(MIN_ORDER_KG, Math.floor(quantity)));
}

// Amounts are worked out in paise so totals do not pick up floating-point noise.
const toMinor = (amount: number) => Math.round(amount * 100);

export const lineTotal = (pricePerKg: number, quantity: number) => (toMinor(pricePerKg) * quantity) / 100;

export const sumMoney = (amounts: number[]) => amounts.reduce((sum, amount) => sum + toMinor(amount), 0) / 100;

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
"use client";

import { createContext, useCallback, useContext, useEffect, useReducer, type ReactNode } from "react";
import { clampKg, lineTotal, sumMoney } from "./price";

/** One selected quality of a product. Prices here are for display only: the server reprices every order. */
export type CartItem = {
  productId: string;
  variantId: string;
  name: string;
  slug?: string;
  image: string;
  category: string;
  quality: string;
  qualityPercent: number;
  unit: "kg";
  unitPrice: number;
  marketPrice?: number | null;
  currency: string;
  quantity: number;
  lineTotal: number;
  /** Set when the server reports this line can no longer be bought. */
  unavailableReason?: string;
};

export type NewCartItem = Omit<CartItem, "lineTotal" | "unit" | "unavailableReason">;

/** Current values from the server for a cart line. */
export type CartLineUpdate =
  | { ok: true; variantId: string; line: { name: string; image: string; category: string; quality: string; qualityPercent: number; unitPrice: number; marketPrice: number; currency: string } }
  | { ok: false; variantId: string; reason: string };

type CartState = { items: CartItem[]; ready: boolean };

type CartAction =
  | { type: "ADD"; item: NewCartItem }
  | { type: "UPDATE_QTY"; variantId: string; quantity: number }
  | { type: "REMOVE"; variantId: string }
  | { type: "CLEAR" }
  | { type: "LOAD"; items: CartItem[] }
  | { type: "SYNC"; updates: CartLineUpdate[] };

const withTotal = (item: CartItem): CartItem => {
  const quantity = clampKg(item.quantity);
  return { ...item, quantity, lineTotal: lineTotal(item.unitPrice, quantity) };
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const existing = state.items.find((i) => i.variantId === action.item.variantId);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.variantId === action.item.variantId
              ? withTotal({ ...i, ...action.item, unit: "kg", quantity: i.quantity + action.item.quantity, unavailableReason: undefined })
              : i,
          ),
        };
      }
      return { ...state, items: [...state.items, withTotal({ ...action.item, unit: "kg", lineTotal: 0 })] };
    }
    case "UPDATE_QTY":
      return { ...state, items: state.items.map((i) => (i.variantId === action.variantId ? withTotal({ ...i, quantity: action.quantity }) : i)) };
    case "REMOVE":
      return { ...state, items: state.items.filter((i) => i.variantId !== action.variantId) };
    case "CLEAR":
      return { ...state, items: [] };
    case "LOAD":
      return { items: action.items.map(withTotal), ready: true };
    case "SYNC":
      return {
        ...state,
        items: state.items.map((item) => {
          const update = action.updates.find((u) => u.variantId === item.variantId);
          if (!update) return item;
          if (!update.ok) return { ...item, unavailableReason: update.reason };
          // Field by field: the customer's quantity must survive, whatever quantity the check was run with.
          const { name, image, category, quality, qualityPercent, unitPrice, marketPrice, currency } = update.line;
          return withTotal({ ...item, name, image, category, quality, qualityPercent, unitPrice, marketPrice, currency, unavailableReason: undefined });
        }),
      };
    default:
      return state;
  }
}

// v1 carts held a single product price with no quality, so they cannot be priced and are dropped.
const STORAGE_KEY = "gf_cart_v2";
const LEGACY_STORAGE_KEY = "gf_cart_v1";

const isCartItem = (item: Partial<CartItem>) =>
  /^[a-f0-9]{24}$/i.test(item.productId ?? "") && /^[a-f0-9]{24}$/i.test(item.variantId ?? "") && typeof item.unitPrice === "number";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]).filter(isCartItem) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage quota exceeded — ignore
  }
}

type CartContextValue = {
  items: CartItem[];
  /** False until the saved cart has been read, so pages do not flash an empty state. */
  ready: boolean;
  /** Number of lines in the cart. */
  itemCount: number;
  totalKg: number;
  subtotal: number;
  addItem: (item: NewCartItem) => void;
  updateQty: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  syncLines: (updates: CartLineUpdate[]) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], ready: false });

  // Hydrate from localStorage on mount
  useEffect(() => {
    dispatch({ type: "LOAD", items: loadCart() });
  }, []);

  // Persist on every change (after hydration)
  useEffect(() => {
    if (state.ready) saveCart(state.items);
  }, [state.items, state.ready]);

  const addItem = useCallback((item: NewCartItem) => dispatch({ type: "ADD", item }), []);
  const updateQty = useCallback((variantId: string, quantity: number) => dispatch({ type: "UPDATE_QTY", variantId, quantity }), []);
  const removeItem = useCallback((variantId: string) => dispatch({ type: "REMOVE", variantId }), []);
  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);
  const syncLines = useCallback((updates: CartLineUpdate[]) => dispatch({ type: "SYNC", updates }), []);

  const purchasable = state.items.filter((i) => !i.unavailableReason);
  const itemCount = state.items.length;
  const totalKg = purchasable.reduce((s, i) => s + i.quantity, 0);
  const subtotal = sumMoney(purchasable.map((i) => i.lineTotal));

  return (
    <CartContext.Provider value={{ items: state.items, ready: state.ready, itemCount, totalKg, subtotal, addItem, updateQty, removeItem, clearCart, syncLines }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

/** Fetches current prices and availability for the cart once it has loaded, and whenever its lines change. */
export function useCartValidation() {
  const { items, ready, syncLines } = useCart();
  const signature = items.map((i) => `${i.productId}:${i.variantId}`).join(",");

  useEffect(() => {
    if (!ready || !signature) return;
    const controller = new AbortController();
    const payload = signature.split(",").map((entry) => {
      const [productId, variantId] = entry.split(":");
      return { productId, variantId, quantity: 1 };
    });
    fetch("/api/cart/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: payload }),
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((json) => {
        if (json?.ok) syncLines(json.data.lines as CartLineUpdate[]);
      })
      .catch(() => undefined); // offline: the order endpoint still revalidates everything
    return () => controller.abort();
  }, [ready, signature, syncLines]);
}

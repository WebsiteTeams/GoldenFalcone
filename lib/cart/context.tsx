"use client";

import { createContext, useCallback, useContext, useEffect, useReducer, type ReactNode } from "react";

export type CartItem = {
  productId: string;
  name: string;
  slug?: string;
  image: string;
  unit: string;
  unitPrice: number;
  marketPrice?: number | null;
  currency: string;
  quantity: number;
};

type CartState = { items: CartItem[] };

type CartAction =
  | { type: "ADD"; item: CartItem }
  | { type: "UPDATE_QTY"; productId: string; quantity: number }
  | { type: "REMOVE"; productId: string }
  | { type: "CLEAR" }
  | { type: "LOAD"; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const existing = state.items.find((i) => i.productId === action.item.productId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === action.item.productId
              ? { ...i, quantity: i.quantity + action.item.quantity, unitPrice: action.item.unitPrice, marketPrice: action.item.marketPrice }
              : i,
          ),
        };
      }
      return { items: [...state.items, action.item] };
    }
    case "UPDATE_QTY":
      if (action.quantity <= 0) return { items: state.items.filter((i) => i.productId !== action.productId) };
      return { items: state.items.map((i) => (i.productId === action.productId ? { ...i, quantity: action.quantity } : i)) };
    case "REMOVE":
      return { items: state.items.filter((i) => i.productId !== action.productId) };
    case "CLEAR":
      return { items: [] };
    case "LOAD":
      return { items: action.items };
    default:
      return state;
  }
}

const STORAGE_KEY = "gf_cart_v1";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
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
  itemCount: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  updateQty: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = loadCart();
    if (saved.length > 0) dispatch({ type: "LOAD", items: saved });
  }, []);

  // Persist on every change (after hydration)
  useEffect(() => {
    saveCart(state.items);
  }, [state.items]);

  const addItem = useCallback((item: CartItem) => dispatch({ type: "ADD", item }), []);
  const updateQty = useCallback((productId: string, quantity: number) => dispatch({ type: "UPDATE_QTY", productId, quantity }), []);
  const removeItem = useCallback((productId: string) => dispatch({ type: "REMOVE", productId }), []);
  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const itemCount = state.items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = state.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items: state.items, itemCount, subtotal, addItem, updateQty, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
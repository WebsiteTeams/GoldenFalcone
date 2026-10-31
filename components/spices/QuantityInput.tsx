"use client";

import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { MAX_ORDER_KG, MIN_ORDER_KG } from "@/lib/admin/constants";
import { clampKg } from "@/lib/cart/price";

/** Whole-kilogram stepper. Typing may pass through invalid values, which settle to a valid quantity when the field loses focus. */
export function QuantityInput({ value, onChange, label = "Quantity in kilograms" }: { value: number; onChange: (kg: number) => void; label?: string }) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  const button = "flex h-10 w-10 items-center justify-center rounded-full text-forest transition-colors hover:bg-ivory-dark disabled:cursor-not-allowed disabled:opacity-30";

  return (
    <div className="inline-flex items-center rounded-full border border-line bg-white p-0.5">
      <button type="button" onClick={() => onChange(clampKg(value - 1))} disabled={value <= MIN_ORDER_KG} aria-label="Decrease quantity by 1 kg" className={button}>
        <Minus aria-hidden className="h-4 w-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={MIN_ORDER_KG}
        max={MAX_ORDER_KG}
        step={1}
        value={text}
        aria-label={label}
        onChange={(e) => {
          setText(e.target.value);
          const typed = Number(e.target.value);
          if (Number.isInteger(typed) && typed >= MIN_ORDER_KG && typed <= MAX_ORDER_KG) onChange(typed);
        }}
        onBlur={() => {
          const settled = clampKg(Number(text));
          setText(String(settled));
          onChange(settled);
        }}
        className="w-14 bg-transparent text-center text-sm font-semibold tabular-nums text-ink focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button type="button" onClick={() => onChange(clampKg(value + 1))} disabled={value >= MAX_ORDER_KG} aria-label="Increase quantity by 1 kg" className={button}>
        <Plus aria-hidden className="h-4 w-4" />
      </button>
    </div>
  );
}

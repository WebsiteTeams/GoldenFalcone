"use client";

import { useEffect, useId, useState } from "react";

type LinesFieldProps = {
  label: string;
  value: string[] | undefined;
  onChange: (lines: string[]) => void;
  hint?: string;
  error?: string;
  rows?: number;
};

/** Edits a list of short strings as one entry per line. */
export function LinesField({ label, value = [], onChange, hint = "One per line.", error, rows = 4 }: LinesFieldProps) {
  const id = useId();
  const [text, setText] = useState(value.join("\n"));

  // Re-sync when the form is reset with new values.
  const joined = value.join("\n");
  useEffect(() => {
    if (joined !== text.split("\n").map((l) => l.trim()).filter(Boolean).join("\n")) setText(joined);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only follow external resets
  }, [joined]);

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-ink">
        {label} <span className="font-normal text-muted">(optional)</span>
      </label>
      <textarea
        id={id}
        value={text}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${id}-hint`}
        onChange={(e) => {
          setText(e.target.value);
          onChange(e.target.value.split("\n").map((l) => l.trim()).filter(Boolean));
        }}
        className="w-full resize-y rounded-xl border border-line bg-white px-4 py-3 text-[0.95rem] text-ink focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15"
      />
      <p id={`${id}-hint`} className={error ? "mt-1.5 text-xs font-medium text-red-800" : "mt-1.5 text-xs text-muted"} role={error ? "alert" : undefined}>
        {error ?? hint}
      </p>
    </div>
  );
}

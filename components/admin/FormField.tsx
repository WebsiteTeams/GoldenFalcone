/**
 * Admin form controls reuse the public site's accessible field components (labels, hints,
 * inline errors and aria wiring), so both share one tested implementation.
 */
export { Field as FormField, Input, Textarea, Select, Checkbox } from "@/components/forms/fields";

import type { ReactNode } from "react";

/** Titled group of related fields inside an admin form card. */
export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 sm:p-7">
      <h2 className="font-serif text-2xl text-forest">{title}</h2>
      {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

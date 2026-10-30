import type { ReactNode } from "react";

/** Label/value pairs for record detail views. Empty values render as an em dash. */
export function DetailList({ items }: { items: { label: string; value: ReactNode; wide?: boolean }[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
      {items.map(({ label, value, wide }) => (
        <div key={label} className={wide ? "sm:col-span-2" : undefined}>
          <dt className="text-xs uppercase tracking-[0.08em] text-muted">{label}</dt>
          <dd className="mt-1 whitespace-pre-line break-words text-sm text-ink">{value === "" || value == null ? "—" : value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Card({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="font-serif text-2xl text-forest">{title}</h2>
        {actions}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

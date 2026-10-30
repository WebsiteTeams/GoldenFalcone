import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

type StatCardProps = { label: string; value: number; hint?: string; href: string; icon: LucideIcon };

export function StatCard({ label, value, hint, href, icon: Icon }: StatCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-line bg-white p-5 transition-[border-color,box-shadow] duration-300 hover:border-gold/50 hover:shadow-[0_18px_36px_-24px_rgba(6,47,37,0.35)]"
    >
      <span className="flex items-center justify-between">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-forest/5 text-emerald">
          <Icon aria-hidden className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <ArrowUpRight aria-hidden className="h-4 w-4 text-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold-dark" />
      </span>
      <span className="mt-4 font-serif text-4xl leading-none text-forest tabular-nums">{value.toLocaleString("en-GB")}</span>
      <span className="mt-2 text-sm font-medium text-ink">{label}</span>
      {hint ? <span className="mt-0.5 text-xs text-muted">{hint}</span> : null}
    </Link>
  );
}

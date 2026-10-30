import type { ReactNode } from "react";
import { Inbox, type LucideIcon } from "lucide-react";

type EmptyStateProps = { title: string; description?: string; icon?: LucideIcon; action?: ReactNode };

export function EmptyState({ title, description, icon: Icon = Inbox, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-forest/5 text-emerald">
        <Icon aria-hidden className="h-5 w-5" strokeWidth={1.5} />
      </span>
      <p className="mt-4 font-serif text-2xl text-forest">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

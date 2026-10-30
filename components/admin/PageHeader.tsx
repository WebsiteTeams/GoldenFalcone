import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  back?: { href: string; label: string };
};

export function PageHeader({ title, description, actions, back }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {back ? (
        <Link href={back.href} className="mb-3 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-forest">
          <ChevronLeft aria-hidden className="h-4 w-4" />
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl leading-tight text-forest sm:text-4xl">{title}</h1>
          {description ? <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

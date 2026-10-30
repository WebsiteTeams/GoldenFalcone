"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { adminNav, type BadgeKey } from "./nav";

type AdminSidebarProps = { badges: Record<BadgeKey, number>; logo: string; onNavigate?: () => void };

/** Forest-green navigation used by the desktop sidebar and the mobile drawer. */
export function AdminSidebar({ badges, logo, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="grain flex h-full flex-col bg-forest text-ivory">
      <div className="flex h-16 shrink-0 items-center border-b border-ivory/10 px-5">
        <Logo size={34} src={logo} href="/admin/dashboard" className="[&>span]:text-[1rem]" />
      </div>

      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-5">
        {adminNav.map(({ group, items }) => (
          <div key={group} className="mb-6">
            <p className="eyebrow mb-2 px-3 text-[0.62rem] text-champagne/50">{group}</p>
            <ul className="space-y-0.5">
              {items.map(({ label, href, icon: Icon, badge }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                const count = badge ? badges[badge] : 0;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-200",
                        active ? "bg-ivory/10 text-ivory" : "text-ivory/70 hover:bg-ivory/5 hover:text-ivory",
                      )}
                    >
                      {active ? <span aria-hidden className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-gold" /> : null}
                      <Icon aria-hidden className={cn("h-4 w-4 shrink-0", active ? "text-gold" : "text-champagne/60 group-hover:text-champagne")} strokeWidth={1.75} />
                      <span className="flex-1">{label}</span>
                      {count > 0 ? (
                        <span className="rounded-full bg-gold px-2 py-0.5 text-[0.68rem] font-semibold text-forest" aria-label={`${count} new`}>
                          {count > 99 ? "99+" : count}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-ivory/10 p-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ivory/70 transition-colors hover:bg-ivory/5 hover:text-ivory"
        >
          <ExternalLink aria-hidden className="h-4 w-4 text-champagne/60" strokeWidth={1.75} />
          View website
        </a>
      </div>
    </div>
  );
}

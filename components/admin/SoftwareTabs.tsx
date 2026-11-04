"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Products", href: "/admin/trading-software", exact: true },
  { label: "Orders", href: "/admin/trading-software/orders" },
  { label: "Demo requests", href: "/admin/trading-software/enquiries" },
];

/** Switches between the three trading software areas. */
export function SoftwareTabs() {
  const pathname = usePathname();
  const isProductPage = pathname === "/admin/trading-software" || pathname.startsWith("/admin/trading-software/new") || /^\/admin\/trading-software\/[a-f0-9]{24}/.test(pathname);
  return (
    <nav aria-label="Trading software" className="mb-6 flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((t) => {
        const active = t.exact ? isProductPage : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              active ? "border-gold text-forest" : "border-transparent text-muted hover:text-forest",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

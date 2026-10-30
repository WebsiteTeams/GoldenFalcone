"use client";

import { useCallback, useState, type ReactNode } from "react";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";
import { MobileAdminNavigation } from "./MobileAdminNavigation";
import type { BadgeKey } from "./nav";
import { ToastProvider } from "./ToastNotification";

type AdminShellProps = {
  admin: { name: string; email: string; role: string };
  badges: Record<BadgeKey, number>;
  logo: string;
  children: ReactNode;
};

export function AdminShell({ admin, badges, logo, children }: AdminShellProps) {
  const [navOpen, setNavOpen] = useState(false);
  const closeNav = useCallback(() => setNavOpen(false), []);

  return (
    <ToastProvider>
      <div className="min-h-svh bg-ivory">
        <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 lg:block">
          <AdminSidebar badges={badges} logo={logo} />
        </aside>
        <MobileAdminNavigation open={navOpen} onClose={closeNav} badges={badges} logo={logo} />
        <div className="lg:pl-64">
          <AdminHeader {...admin} onOpenNav={() => setNavOpen(true)} />
          <main id="main" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

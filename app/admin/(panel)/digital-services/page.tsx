import type { Metadata } from "next";
import Link from "next/link";
import { FolderKanban, MonitorSmartphone, Plus } from "lucide-react";
import { ButtonLink } from "@/components/admin/Button";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata: Metadata = { title: "Digital Services" };

export default function DigitalServicesAdminPage() {
  return (
    <>
      <PageHeader
        title="Digital Services"
        description="This section has been removed."
        actions={
          <ButtonLink href="/">
            <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 3h2v9h-2zm-6 0h2v12h-2zm6 6h2v6h-2zm-6 0h2v6h-2z" />
            </svg>
            Back to Home
          </ButtonLink>
        }
      />
      <p className="mt-6 text-center text-muted">The digital solutions section has been removed.</p>
    </>
  );
}
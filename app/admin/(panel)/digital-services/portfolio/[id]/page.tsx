import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioEditor } from "@/components/admin/catalogue/PortfolioEditor";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { isObjectId } from "@/lib/admin/api";
import { formatDate } from "@/lib/admin/client";
import { editorValues } from "@/lib/admin/editor";
import { getRecord, resources } from "@/lib/admin/resources";
import { portfolioProjectSchema } from "@/lib/admin/schemas";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Edit portfolio project" };

export default async function EditPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  if (!isObjectId(id)) notFound();
  const doc = await getRecord(resources.portfolio, id);
  if (!doc) notFound();

  return (
    <>
      <PageHeader
        back={{ href: "/admin/digital-services?tab=portfolio", label: "Portfolio" }}
        title={doc.title}
        description={`Last updated ${formatDate(doc.updatedAt, true)}`}
        actions={<StatusBadge status={doc.status} className="text-sm" />}
      />
      <PortfolioEditor key={doc.updatedAt} id={id} canDelete={admin.role === "admin"} initial={editorValues(portfolioProjectSchema, doc) as never} />
    </>
  );
}

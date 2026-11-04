import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SoftwareEditor } from "@/components/admin/catalogue/SoftwareEditor";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { isObjectId } from "@/lib/admin/api";
import { formatDate } from "@/lib/admin/client";
import { softwareEditorValues } from "@/lib/admin/editor";
import { getRecord, resources } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Edit software" };

export default async function EditSoftwarePage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  if (!isObjectId(id)) notFound();
  const doc = await getRecord(resources.software, id);
  if (!doc) notFound();

  return (
    <>
      <PageHeader
        back={{ href: "/admin/trading-software", label: "Trading software" }}
        title={doc.name}
        description={`Last updated ${formatDate(doc.updatedAt, true)}`}
        actions={<StatusBadge status={doc.status} className="text-sm" />}
      />
      <SoftwareEditor key={doc.updatedAt} id={id} canDelete={admin.role === "admin"} initial={softwareEditorValues(doc) as never} />
    </>
  );
}

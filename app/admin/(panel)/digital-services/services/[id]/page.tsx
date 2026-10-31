import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DigitalServiceEditor } from "@/components/admin/catalogue/DigitalServiceEditor";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { isObjectId } from "@/lib/admin/api";
import { formatDate } from "@/lib/admin/client";
import { editorValues } from "@/lib/admin/editor";
import { getRecord, resources } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Edit service" };

export default async function EditDigitalServicePage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  if (!isObjectId(id)) notFound();
  const doc = await getRecord(resources.enquiries, id);
  if (!doc) notFound();

  return (
    <>
      <PageHeader
        back={{ href: "/admin/enquiries", label: "Enquiries" }}
        title={doc.title}
        description={`Last updated ${formatDate(doc.updatedAt, true)}`}
        actions={<StatusBadge status={doc.status} className="text-sm" />}
      />
      <DigitalServiceEditor key={doc.updatedAt} id={id} canDelete={admin.role === "admin"} initial={editorValues(enquirySchema, doc) as never} />
    </>
  );
}
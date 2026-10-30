import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgramEditor } from "@/components/admin/catalogue/ProgramEditor";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { isObjectId } from "@/lib/admin/api";
import { formatDate } from "@/lib/admin/client";
import { editorValues } from "@/lib/admin/editor";
import { getRecord, resources } from "@/lib/admin/resources";
import { mentorshipProgramSchema } from "@/lib/admin/schemas";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Edit mentorship programme" };

export default async function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  if (!isObjectId(id)) notFound();
  const doc = await getRecord(resources.mentorship, id);
  if (!doc) notFound();

  return (
    <>
      <PageHeader
        back={{ href: "/admin/mentorship", label: "Mentorship programmes" }}
        title={doc.title}
        description={`Last updated ${formatDate(doc.updatedAt, true)}`}
        actions={<StatusBadge status={doc.status} className="text-sm" />}
      />
      <ProgramEditor key={doc.updatedAt} id={id} canDelete={admin.role === "admin"} initial={editorValues(mentorshipProgramSchema, doc) as never} />
    </>
  );
}

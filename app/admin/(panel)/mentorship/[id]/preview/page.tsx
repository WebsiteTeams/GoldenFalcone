import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PreviewFrame } from "@/components/admin/PreviewFrame";
import { ProgrammeCard } from "@/components/services/CatalogueItems";
import { isObjectId } from "@/lib/admin/api";
import { previewProgram } from "@/lib/admin/editor";
import { getRecord, resources } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Preview mentorship programme" };

export default async function PreviewProgramPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isObjectId(id)) notFound();
  const doc = await getRecord(resources.mentorship, id);
  if (!doc) notFound();
  const program = previewProgram(doc);

  return (
    <PreviewFrame
      title={program.title}
      status={doc.status}
      editHref={`/admin/mentorship/${id}`}
      listHref="/admin/mentorship"
      listLabel="Mentorship programmes"
      publicHref={`/trading-mentorship#${program.slug}`}
    >
      <div className="max-w-xl">
        <ProgrammeCard program={program} />
      </div>
    </PreviewFrame>
  );
}

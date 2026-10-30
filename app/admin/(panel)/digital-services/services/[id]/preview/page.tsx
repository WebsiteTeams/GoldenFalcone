import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PreviewFrame } from "@/components/admin/PreviewFrame";
import { DigitalServiceCard } from "@/components/services/CatalogueItems";
import { isObjectId } from "@/lib/admin/api";
import { previewDigitalService } from "@/lib/admin/editor";
import { getRecord, resources } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Preview digital service" };

export default async function PreviewDigitalServicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isObjectId(id)) notFound();
  const doc = await getRecord(resources["digital-services"], id);
  if (!doc) notFound();

  return (
    <PreviewFrame
      title={doc.title}
      status={doc.status}
      editHref={`/admin/digital-services/services/${id}`}
      listHref="/admin/digital-services"
      listLabel="Digital services"
      publicHref="/digital-solutions#services"
      tone="dark"
    >
      <div className="max-w-md overflow-hidden rounded-[1.5rem] border border-ivory/10">
        <DigitalServiceCard service={previewDigitalService(doc)} />
      </div>
    </PreviewFrame>
  );
}

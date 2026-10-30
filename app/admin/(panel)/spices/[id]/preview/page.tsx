import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PreviewFrame } from "@/components/admin/PreviewFrame";
import { SpiceArticle, SpiceCard } from "@/components/services/CatalogueItems";
import { isObjectId } from "@/lib/admin/api";
import { previewSpice } from "@/lib/admin/editor";
import { getRecord, resources } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Preview spice product" };

export default async function PreviewSpicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isObjectId(id)) notFound();
  const doc = await getRecord(resources.spices, id);
  if (!doc) notFound();
  const spice = previewSpice(doc);

  return (
    <PreviewFrame
      title={spice.name}
      status={doc.status}
      editHref={`/admin/spices/${id}`}
      listHref="/admin/spices"
      listLabel="Spices catalogue"
      publicHref={`/spices#${spice.slug}`}
    >
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="rounded-[1.75rem] bg-forest p-5">
          <p className="eyebrow mb-4 text-gold">Catalogue card</p>
          <SpiceCard spice={spice} />
        </div>
        <div className="lg:col-span-2">
          <p className="eyebrow mb-6 text-gold-dark">Product details</p>
          <SpiceArticle spice={spice} index={0} interactive={false} />
        </div>
      </div>
    </PreviewFrame>
  );
}

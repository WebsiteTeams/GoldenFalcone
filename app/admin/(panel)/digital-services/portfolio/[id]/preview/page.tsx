import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PreviewFrame } from "@/components/admin/PreviewFrame";
import { PortfolioCard } from "@/components/services/CatalogueItems";
import { isObjectId } from "@/lib/admin/api";
import { previewPortfolio } from "@/lib/admin/editor";
import { getRecord, resources } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Preview portfolio project" };

export default async function PreviewPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isObjectId(id)) notFound();
  const doc = await getRecord(resources.portfolio, id);
  if (!doc) notFound();

  return (
    <PreviewFrame
      title={doc.title}
      status={doc.status}
      editHref={`/admin/digital-services/portfolio/${id}`}
      listHref="/admin/digital-services?tab=portfolio"
      listLabel="Portfolio"
      publicHref="/digital-solutions"
    >
      <div className="max-w-sm">
        <PortfolioCard project={previewPortfolio(doc)} />
      </div>
    </PreviewFrame>
  );
}

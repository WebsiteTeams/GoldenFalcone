import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryEditor } from "@/components/admin/catalogue/CategoryEditor";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { isObjectId } from "@/lib/admin/api";
import { formatDate } from "@/lib/admin/client";
import { editorValues } from "@/lib/admin/editor";
import { getRecord, resources } from "@/lib/admin/resources";
import { spiceCategorySchema } from "@/lib/admin/schemas";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Edit spice category" };

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdmin();
  const { id } = await params;
  if (!isObjectId(id)) notFound();

  const doc = await getRecord(resources.categories, id);
  if (!doc) notFound();

  return (
    <>
      <PageHeader
        back={{ href: "/admin/categories", label: "Spice categories" }}
        title={doc.name}
        description={`Last updated ${formatDate(doc.updatedAt, true)}`}
        actions={<StatusBadge status={doc.status} className="text-sm" />}
      />
      <CategoryEditor
        key={doc.updatedAt}
        id={id}
        canDelete={admin.role === "admin"}
        initial={editorValues(spiceCategorySchema, doc) as never}
      />
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SpiceEditor } from "@/components/admin/catalogue/SpiceEditor";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { isObjectId } from "@/lib/admin/api";
import { formatDate } from "@/lib/admin/client";
import { editorValues } from "@/lib/admin/editor";
import { getRecord, resources } from "@/lib/admin/resources";
import { spiceProductSchema } from "@/lib/admin/schemas";
import { requireAdmin } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import { SpiceCategory } from "@/models/SpiceCategory";

export const metadata: Metadata = { title: "Edit spice product" };

export default async function EditSpicePage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  if (!isObjectId(id)) notFound();

  await connectToDatabase();
  const [doc, categoryDocs] = await Promise.all([
    getRecord(resources.spices, id),
    SpiceCategory.find().sort({ order: 1, name: 1 }).lean(),
  ]);

  if (!doc) notFound();

  const categories = categoryDocs.map((c) => ({ value: String(c._id), label: c.name }));

  return (
    <>
      <PageHeader
        back={{ href: "/admin/spices", label: "Spices catalogue" }}
        title={doc.name}
        description={`Last updated ${formatDate(doc.updatedAt, true)}`}
        actions={<StatusBadge status={doc.status} className="text-sm" />}
      />
      <SpiceEditor
        key={doc.updatedAt}
        id={id}
        categories={categories}
        canDelete={admin.role === "admin"}
        initial={editorValues(spiceProductSchema, doc) as never}
      />
    </>
  );
}

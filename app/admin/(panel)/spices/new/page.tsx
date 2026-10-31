import type { Metadata } from "next";
import { SpiceEditor } from "@/components/admin/catalogue/SpiceEditor";
import { PageHeader } from "@/components/admin/PageHeader";
import { newItemStatus } from "@/lib/admin/editor";
import { normalizeVariants } from "@/lib/admin/schemas";
import { requireAdmin } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import { SpiceCategory } from "@/models/SpiceCategory";

export const metadata: Metadata = { title: "New spice product" };

export default async function NewSpicePage() {
  const admin = await requireAdmin();
  await connectToDatabase();

  const categoryDocs = await SpiceCategory.find().sort({ order: 1, name: 1 }).lean();
  const categories = categoryDocs.map((c) => ({ value: String(c._id), label: c.name }));

  return (
    <>
      <PageHeader back={{ href: "/admin/spices", label: "Spices catalogue" }} title="New spice product" />
      <SpiceEditor
        canDelete={admin.role === "admin"}
        categories={categories}
        initial={
          {
            name: "",
            slug: "",
            productType: "",
            category: "",
            shortDescription: "",
            images: [],
            highlights: [],
            isFeatured: false,
            featuredOrder: 0,
            featuredLevel: "",
            variants: normalizeVariants(null),
            description: "",
            status: await newItemStatus(),
            order: 0,
            seo: { title: "", description: "" },
          } as never
        }
      />
    </>
  );
}

import type { Metadata } from "next";
import { CategoryEditor } from "@/components/admin/catalogue/CategoryEditor";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Add spice category" };

export default async function NewCategoryPage() {
  const admin = await requireAdmin();

  return (
    <>
      <PageHeader
        back={{ href: "/admin/categories", label: "Categories" }}
        title="New Spice Category"
        description="Add a new category with a name, photo, and short description."
      />
      <CategoryEditor
        canDelete={admin.role === "admin"}
        initial={{
          name: "",
          slug: "",
          image: null as never,
          shortDescription: "",
          status: "published",
          order: 0,
        }}
      />
    </>
  );
}

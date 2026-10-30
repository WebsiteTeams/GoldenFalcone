import type { Metadata } from "next";
import { PortfolioEditor } from "@/components/admin/catalogue/PortfolioEditor";
import { PageHeader } from "@/components/admin/PageHeader";
import { newItemStatus } from "@/lib/admin/editor";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "New portfolio project" };

export default async function NewPortfolioPage() {
  const admin = await requireAdmin();
  return (
    <>
      <PageHeader back={{ href: "/admin/digital-services?tab=portfolio", label: "Portfolio" }} title="New portfolio project" />
      <PortfolioEditor
        canDelete={admin.role === "admin"}
        initial={{
          title: "",
          slug: "",
          category: "",
          description: "",
          image: null,
          projectUrl: "",
          isConcept: true,
          status: await newItemStatus(),
          order: 0,
        }}
      />
    </>
  );
}

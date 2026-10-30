import type { Metadata } from "next";
import { ProgramEditor } from "@/components/admin/catalogue/ProgramEditor";
import { PageHeader } from "@/components/admin/PageHeader";
import { newItemStatus } from "@/lib/admin/editor";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "New mentorship programme" };

export default async function NewProgramPage() {
  const admin = await requireAdmin();
  return (
    <>
      <PageHeader back={{ href: "/admin/mentorship", label: "Mentorship programmes" }} title="New programme" />
      <ProgramEditor
        canDelete={admin.role === "admin"}
        initial={{
          title: "",
          slug: "",
          description: "",
          topics: [],
          format: "",
          duration: "",
          availability: "",
          ctaLabel: "",
          status: await newItemStatus(),
          order: 0,
          seo: { title: "", description: "" },
        }}
      />
    </>
  );
}

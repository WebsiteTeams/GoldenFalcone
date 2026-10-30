import type { Metadata } from "next";
import { DigitalServiceEditor } from "@/components/admin/catalogue/DigitalServiceEditor";
import { PageHeader } from "@/components/admin/PageHeader";
import { newItemStatus } from "@/lib/admin/editor";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "New digital service" };

export default async function NewDigitalServicePage() {
  const admin = await requireAdmin();
  return (
    <>
      <PageHeader back={{ href: "/admin/digital-services", label: "Digital services" }} title="New service" />
      <DigitalServiceEditor
        canDelete={admin.role === "admin"}
        initial={{
          title: "",
          slug: "",
          category: "",
          description: "",
          image: null,
          startingPrice: "",
          features: [],
          status: await newItemStatus(),
          order: 0,
          seo: { title: "", description: "" },
        }}
      />
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DigitalServiceEditor } from "@/components/admin/catalogue/DigitalServiceEditor";
import { PageHeader } from "@/components/admin/PageHeader";
import { newItemStatus } from "@/lib/admin/editor";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "New service" };

export default async function NewDigitalServicePage() {
  const admin = await requireAdmin();
  return (
    <>
      <PageHeader back={{ href: "/admin/enquiries", label: "Enquiries" }} title="New service" />
      <DigitalServiceEditor
        canDelete={admin.role === "admin"}
        initial={{
          title: "",
          slug: "",
          serviceType: "",
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
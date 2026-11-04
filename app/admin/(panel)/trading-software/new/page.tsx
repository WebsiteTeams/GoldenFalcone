import type { Metadata } from "next";
import { SoftwareEditor } from "@/components/admin/catalogue/SoftwareEditor";
import { PageHeader } from "@/components/admin/PageHeader";
import { newItemStatus } from "@/lib/admin/editor";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "New software" };

export default async function NewSoftwarePage() {
  const admin = await requireAdmin();
  return (
    <>
      <PageHeader back={{ href: "/admin/trading-software", label: "Trading software" }} title="New software" />
      <SoftwareEditor
        canDelete={admin.role === "admin"}
        initial={{
          name: "",
          slug: "",
          category: "" as never,
          markets: [],
          shortDescription: "",
          description: "",
          thumbnail: null,
          screenshots: [],
          demoVideo: "",
          features: [],
          supportedPlatforms: [],
          systemRequirements: "",
          installationNotes: "",
          supportInfo: "",
          licenceTerms: "",
          faqs: [],
          licenceOptions: [],
          currency: "INR",
          availability: "available",
          featured: false,
          featuredOrder: 0,
          status: await newItemStatus(),
          order: 0,
          seo: { title: "", description: "" },
        }}
      />
    </>
  );
}

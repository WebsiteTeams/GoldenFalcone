import type { Metadata } from "next";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { PageHeader } from "@/components/admin/PageHeader";
import { getContentState } from "@/lib/admin/content";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Pages & Content" };

export default async function PagesAdminPage() {
  await requireAdmin();
  const state = await getContentState();
  return (
    <>
      <PageHeader
        title="Pages & Content"
        description="Edit website copy as a draft, preview it on the real pages, then publish. The live site only changes when you publish."
      />
      <ContentEditor initial={state} />
    </>
  );
}

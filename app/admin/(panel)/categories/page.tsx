import type { Metadata } from "next";
import Image from "next/image";
import { FolderTree, Plus, Tags } from "lucide-react";
import { ButtonLink } from "@/components/admin/Button";
import { CatalogueList, type CatalogueRow } from "@/components/admin/catalogue/CatalogueList";
import { PageHeader } from "@/components/admin/PageHeader";
import { readListQuery } from "@/lib/admin/query";
import { listRecords, resources } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Spice Categories" };

type CategoryRow = CatalogueRow & {
  name: string;
  image?: { mediaId: string; alt?: string };
  shortDescription: string;
};

export default async function CategoriesAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const { query, params } = readListQuery(await searchParams);
  const result = await listRecords<CategoryRow>(resources.categories, query);

  return (
    <>
      <PageHeader
        title="Spice Categories"
        description="Categories for organizing Goldenfalcone whole spices. Each product must be assigned to one category."
        actions={
          <ButtonLink href="/admin/categories/new" icon={<Plus aria-hidden className="h-4 w-4" />}>
            Add category
          </ButtonLink>
        }
      />
      <CatalogueList
        result={result}
        query={query}
        params={params}
        basePath="/admin/categories"
        editPath="/admin/categories"
        newHref="/admin/categories/new"
        newLabel="Add category"
        noun="categories"
        icon={Tags}
        title={(r) => r.name}
        searchPlaceholder="Search categories by name"
        emptyText="No categories found. Create a category to start organizing your spice products."
        extraColumns={[
          {
            header: "Image",
            cell: (r) => (
              <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-line bg-ivory">
                {r.image?.mediaId ? (
                  <Image
                    src={`/api/media/${r.image.mediaId}`}
                    alt={r.image.alt || r.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted">
                    <FolderTree className="h-5 w-5 text-gold/40" />
                  </div>
                )}
              </div>
            ),
            className: "w-16",
          },
          {
            header: "Short Description",
            cell: (r) => (
              <p className="line-clamp-2 max-w-md text-xs text-muted">
                {r.shortDescription}
              </p>
            ),
          },
        ]}
      />
    </>
  );
}

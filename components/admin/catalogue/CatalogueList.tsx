import { Plus, type LucideIcon } from "lucide-react";
import { ButtonLink } from "../Button";
import { DataTable, type Column } from "../DataTable";
import { EmptyState } from "../EmptyState";
import { ListToolbar } from "../ListToolbar";
import { Pagination } from "../Pagination";
import { StatusBadge } from "../StatusBadge";
import { formatDate } from "@/lib/admin/client";
import { toOptions } from "@/lib/admin/constants";
import type { ListQuery } from "@/lib/admin/schemas";
import type { ListResult } from "@/lib/admin/resources";

export type CatalogueRow = { _id: string; status: string; order: number; updatedAt: string };

type CatalogueListProps<T extends CatalogueRow> = {
  result: ListResult<T>;
  query: ListQuery;
  params: Record<string, string | undefined>;
  basePath: string;
  editPath: string;
  newHref: string;
  newLabel: string;
  noun: string;
  title: (row: T) => string;
  extraColumns?: Column<T>[];
  filter?: { label: string; options: readonly { value: string; label: string }[] };
  searchPlaceholder: string;
  icon: LucideIcon;
  emptyText: string;
};

/** Shared list view for publishable catalogue items. */
export function CatalogueList<T extends CatalogueRow>(props: CatalogueListProps<T>) {
  const { result, query, params, basePath, editPath, newHref, newLabel, noun, title, extraColumns = [], filter, searchPlaceholder, icon, emptyText } = props;
  const filtered = Boolean(query.q || query.status || query.filter);

  const columns: Column<T>[] = [
    { header: "Title", primary: true, cell: title },
    ...extraColumns,
    { header: "Order", cell: (r) => <span className="tabular-nums text-muted">{r.order}</span>, className: "w-20", hideOnMobile: true },
    { header: "Updated", cell: (r) => formatDate(r.updatedAt), hideOnMobile: true },
    { header: "Visibility", cell: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <>
      <ListToolbar searchPlaceholder={searchPlaceholder} statuses={toOptions(["draft", "published"])} filter={filter} />
      {result.items.length ? (
        <>
          <DataTable caption={noun} columns={columns} rows={result.items} rowHref={(r) => `${editPath}/${r._id}`} rowLabel={title} />
          <Pagination basePath={basePath} params={params} page={result.page} pages={result.pages} total={result.total} />
        </>
      ) : (
        <EmptyState
          icon={icon}
          title={filtered ? `No matching ${noun}` : `No ${noun} yet`}
          description={filtered ? "Try a different search or clear the filters." : emptyText}
          action={
            filtered ? null : (
              <ButtonLink href={newHref} icon={<Plus aria-hidden className="h-4 w-4" />}>
                {newLabel}
              </ButtonLink>
            )
          }
        />
      )}
    </>
  );
}

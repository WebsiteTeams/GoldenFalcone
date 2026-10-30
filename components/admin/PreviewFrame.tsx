import type { ReactNode } from "react";
import { Eye, Pencil } from "lucide-react";
import { ButtonLink } from "./Button";
import { PageHeader } from "./PageHeader";
import { StatusBadge } from "./StatusBadge";

type PreviewFrameProps = {
  title: string;
  status: string;
  editHref: string;
  listHref: string;
  listLabel: string;
  publicHref?: string;
  tone?: "light" | "dark";
  children: ReactNode;
};

/** Shows a catalogue item exactly as the public site renders it, framed with its draft/published state. */
export function PreviewFrame({ title, status, editHref, listHref, listLabel, publicHref, tone = "light", children }: PreviewFrameProps) {
  return (
    <>
      <PageHeader
        back={{ href: listHref, label: listLabel }}
        title={`Preview: ${title}`}
        description={
          status === "published"
            ? "This is how the item appears on the live website."
            : "This item is a draft and is not visible on the website until it is published."
        }
        actions={
          <>
            <StatusBadge status={status} className="self-center text-sm" />
            {status === "published" && publicHref ? (
              <ButtonLink href={publicHref} variant="secondary" icon={<Eye aria-hidden className="h-4 w-4" />}>
                View live
              </ButtonLink>
            ) : null}
            <ButtonLink href={editHref} icon={<Pencil aria-hidden className="h-4 w-4" />}>
              Edit
            </ButtonLink>
          </>
        }
      />
      <div className={`overflow-hidden rounded-2xl border border-line p-6 sm:p-10 ${tone === "dark" ? "bg-forest" : "bg-ivory"}`}>{children}</div>
    </>
  );
}

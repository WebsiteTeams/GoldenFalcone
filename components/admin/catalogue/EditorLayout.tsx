"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Eye, Save, Trash2 } from "lucide-react";
import { adminRequest } from "@/lib/admin/client";
import { Button, buttonClass } from "../Button";
import { ConfirmDialog } from "../ConfirmDialog";
import { FormField, Input, Select } from "../FormField";
import { useToast } from "../ToastNotification";

type EditorLayoutProps = {
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  submitting: boolean;
  dirty: boolean;
  main: ReactNode;
  /** Status and order inputs are rendered by the layout from these registrations. */
  statusField: UseFormRegisterReturn;
  orderField: UseFormRegisterReturn;
  orderError?: string;
  entity: string;
  endpoint: string;
  listHref: string;
  id?: string;
  previewHref?: string;
  canDelete: boolean;
  sidebarExtra?: ReactNode;
};

/** Two-column editor: content fields on the left; publishing, ordering and actions on the right. */
export function EditorLayout(props: EditorLayoutProps) {
  const { onSubmit, submitting, dirty, main, statusField, orderField, orderError, entity, endpoint, listHref, id, previewHref, canDelete, sidebarExtra } = props;
  const router = useRouter();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    setDeleting(true);
    const result = await adminRequest(`${endpoint}/${id}`, { method: "DELETE" });
    setDeleting(false);
    if (result.ok) {
      toast.success(result.message);
      router.replace(listHref);
      router.refresh();
    } else {
      setConfirming(false);
      toast.error(result.message);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">{main}</div>

      <div className="space-y-6">
        <section className="rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-24">
          <h2 className="font-serif text-2xl text-forest">Publishing</h2>
          <div className="mt-5 space-y-5">
            <FormField label="Visibility" required>
              {(p) => (
                <Select
                  id={p.id}
                  options={[
                    { value: "draft", label: "Draft — hidden from the website" },
                    { value: "published", label: "Published — visible on the website" },
                  ]}
                  placeholder="Select visibility"
                  {...statusField}
                />
              )}
            </FormField>
            <FormField label="Display order" hint="Lower numbers appear first." error={orderError}>
              {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} type="number" min={0} max={9999} inputMode="numeric" {...orderField} />}
            </FormField>
            {sidebarExtra}
            <Button type="submit" pending={submitting} icon={<Save aria-hidden className="h-4 w-4" />} className="w-full">
              {id ? (dirty ? "Save changes" : "Saved") : `Create ${entity}`}
            </Button>
            {previewHref ? (
              <Link href={previewHref} className={buttonClass("secondary", "w-full")}>
                <Eye aria-hidden className="h-4 w-4" /> Preview
              </Link>
            ) : null}
            {id && canDelete ? (
              <Button variant="danger" onClick={() => setConfirming(true)} icon={<Trash2 aria-hidden className="h-4 w-4" />} className="w-full">
                Delete {entity}
              </Button>
            ) : null}
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirming}
        title={`Delete this ${entity}?`}
        description="It will be removed from the website immediately, along with its uploaded images. This cannot be undone."
        pending={deleting}
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      />
    </form>
  );
}

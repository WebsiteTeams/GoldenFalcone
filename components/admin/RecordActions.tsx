"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { adminRequest } from "@/lib/admin/client";
import { toOptions } from "@/lib/admin/constants";
import { Button } from "./Button";
import { ConfirmDialog } from "./ConfirmDialog";
import { Select } from "./FormField";
import { useToast } from "./ToastNotification";

type RecordActionsProps = {
  endpoint: string;
  status: string;
  statuses: readonly string[];
  canDelete: boolean;
  entity: string;
  listHref: string;
  deleteWarning?: string;
};

/** Status update and (for full admins) deletion with confirmation, for inbox records. */
export function RecordActions({ endpoint, status, statuses, canDelete, entity, listHref, deleteWarning }: RecordActionsProps) {
  const router = useRouter();
  const toast = useToast();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const save = async () => {
    setSaving(true);
    const result = await adminRequest(endpoint, { method: "PATCH", body: { status: value } });
    setSaving(false);
    if (result.ok) {
      toast.success("Status updated.");
      router.refresh();
    } else toast.error(result.message);
  };

  const remove = async () => {
    setDeleting(true);
    const result = await adminRequest(endpoint, { method: "DELETE" });
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
    <div className="space-y-4">
      <div>
        <label htmlFor="record-status" className="mb-2 block text-sm font-medium text-ink">
          Status
        </label>
        <Select id="record-status" value={value} onChange={(e) => setValue(e.target.value)} options={toOptions(statuses)} placeholder="Select a status" />
      </div>
      <Button onClick={save} pending={saving} disabled={value === status || !value} icon={<Save aria-hidden className="h-4 w-4" />} className="w-full">
        Update status
      </Button>

      {canDelete ? (
        <>
          <div className="border-t border-line pt-4">
            <Button variant="danger" onClick={() => setConfirming(true)} icon={<Trash2 aria-hidden className="h-4 w-4" />} className="w-full">
              Delete {entity}
            </Button>
          </div>
          <ConfirmDialog
            open={confirming}
            title={`Delete this ${entity}?`}
            description={deleteWarning ?? "This permanently removes the record and its internal notes. This cannot be undone."}
            pending={deleting}
            onConfirm={remove}
            onCancel={() => setConfirming(false)}
          />
        </>
      ) : null}
    </div>
  );
}

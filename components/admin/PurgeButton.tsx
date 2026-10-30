"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eraser } from "lucide-react";
import { adminRequest } from "@/lib/admin/client";
import { Button } from "./Button";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./ToastNotification";

/** Applies the candidate data-retention policy on demand. */
export function PurgeButton({ months }: { months: number }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const purge = async () => {
    setPending(true);
    const result = await adminRequest("/api/admin/candidates/purge", { method: "POST" });
    setPending(false);
    setOpen(false);
    if (result.ok) {
      toast.success(result.message);
      router.refresh();
    } else toast.error(result.message);
  };

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)} icon={<Eraser aria-hidden className="h-4 w-4" />}>
        Apply retention policy
      </Button>
      <ConfirmDialog
        open={open}
        title="Delete expired applications?"
        description={`Every candidate application older than ${months} months, including any uploaded CV, will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete expired"
        pending={pending}
        onConfirm={purge}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

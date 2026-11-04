"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { adminRequest } from "@/lib/admin/client";
import { deliveryMethods, deliveryStatuses, orderStatuses, paymentStatuses, toOptions } from "@/lib/admin/constants";
import { Button } from "./Button";
import { ConfirmDialog } from "./ConfirmDialog";
import { FormField, Input, Select, Textarea } from "./FormField";
import { useToast } from "./ToastNotification";

export type SoftwareOrderState = {
  status: string;
  paymentStatus: string;
  deliveryMethod: string;
  deliveryStatus: string;
  licenceKey: string;
  activationInstructions: string;
  downloadUrl: string;
};

/**
 * Order status, payment and delivery for one software order. The licence key, activation instructions and download
 * link live only on the order record and are shared with the customer directly, never through a public page.
 */
export function SoftwareOrderPanel({ id, initial, canDelete }: { id: string; initial: SoftwareOrderState; canDelete: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const set = (key: keyof SoftwareOrderState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));
  const dirty = (Object.keys(values) as (keyof SoftwareOrderState)[]).some((k) => values[k] !== initial[k]);

  const save = async () => {
    setSaving(true);
    setErrors({});
    const result = await adminRequest(`/api/admin/trading-software/orders/${id}`, { method: "PATCH", body: values });
    setSaving(false);
    if (result.ok) {
      toast.success("Order updated.");
      router.refresh();
    } else {
      setErrors(result.errors ?? {});
      toast.error(result.message);
    }
  };

  const remove = async () => {
    setDeleting(true);
    const result = await adminRequest(`/api/admin/trading-software/orders/${id}`, { method: "DELETE" });
    setDeleting(false);
    if (result.ok) {
      toast.success(result.message);
      router.replace("/admin/trading-software/orders");
      router.refresh();
    } else {
      setConfirming(false);
      toast.error(result.message);
    }
  };

  return (
    <div className="space-y-5">
      <FormField label="Order status" required>
        {(p) => <Select id={p.id} options={toOptions(orderStatuses)} value={values.status} onChange={set("status")} />}
      </FormField>
      <FormField label="Payment" hint="Record payment once you have received it. Nothing is charged on the website.">
        {(p) => <Select id={p.id} options={toOptions(paymentStatuses)} value={values.paymentStatus} onChange={set("paymentStatus")} />}
      </FormField>

      <div className="space-y-5 border-t border-line pt-5">
        <h3 className="font-serif text-xl text-forest">Delivery</h3>
        <FormField label="Delivery method">
          {(p) => <Select id={p.id} options={deliveryMethods} value={values.deliveryMethod} onChange={set("deliveryMethod")} placeholder="Not set" />}
        </FormField>
        <FormField label="Delivery status">
          {(p) => <Select id={p.id} options={toOptions(deliveryStatuses)} value={values.deliveryStatus} onChange={set("deliveryStatus")} />}
        </FormField>
        <FormField label="Licence key" hint="Visible to admins only." error={errors.licenceKey}>
          {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} autoComplete="off" value={values.licenceKey} onChange={set("licenceKey")} maxLength={500} />}
        </FormField>
        <FormField label="Activation instructions" error={errors.activationInstructions}>
          {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={4} value={values.activationInstructions} onChange={set("activationInstructions")} maxLength={3000} />}
        </FormField>
        <FormField label="Private download link" hint="An https:// link you control. Share it with the customer directly." error={errors.downloadUrl}>
          {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} type="url" inputMode="url" value={values.downloadUrl} onChange={set("downloadUrl")} maxLength={500} />}
        </FormField>
      </div>

      <Button onClick={save} pending={saving} disabled={!dirty} icon={<Save aria-hidden className="h-4 w-4" />} className="w-full">
        Save changes
      </Button>

      {canDelete ? (
        <div className="border-t border-line pt-5">
          <Button variant="danger" onClick={() => setConfirming(true)} icon={<Trash2 aria-hidden className="h-4 w-4" />} className="w-full">
            Delete order
          </Button>
          <ConfirmDialog
            open={confirming}
            title="Delete this order?"
            description="This permanently removes the order, its delivery details and internal notes. This cannot be undone."
            pending={deleting}
            onConfirm={remove}
            onCancel={() => setConfirming(false)}
          />
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Lock, Save } from "lucide-react";
import { adminRequest } from "@/lib/admin/client";
import { settingsSchema } from "@/lib/admin/schemas";
import { Button } from "./Button";
import { Checkbox, FormField, FormSection, Input, Textarea } from "./FormField";
import { ImageUploader } from "./ImageUploader";
import { useToast } from "./ToastNotification";

type Values = z.input<typeof settingsSchema>;

const socials = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "x", label: "X (Twitter)" },
  { key: "youtube", label: "YouTube" },
] as const;

export function SettingsForm({ initial, canEdit, emailConfigured }: { initial: Values; canEdit: boolean; emailConfigured: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Values, unknown, z.output<typeof settingsSchema>>({ resolver: zodResolver(settingsSchema), defaultValues: initial });

  const onSubmit = handleSubmit(
    async (values) => {
      const result = await adminRequest<Values>("/api/admin/settings", { method: "PUT", body: values });
      if (!result.ok) {
        for (const [field, message] of Object.entries(result.errors ?? {})) setError(field as never, { message });
        return toast.error(result.message);
      }
      reset(result.data);
      toast.success("Settings saved. The website has been updated.");
      router.refresh();
    },
    () => toast.error("Please fix the highlighted fields."),
  );

  return (
    <form onSubmit={onSubmit} noValidate>
      {!canEdit ? (
        <p className="mb-6 flex items-center gap-2 rounded-xl border border-gold/40 bg-champagne/25 px-4 py-3 text-sm text-ink/80">
          <Lock aria-hidden className="h-4 w-4 text-gold-dark" /> Business settings can only be changed by a full administrator.
        </p>
      ) : null}
      <fieldset disabled={!canEdit || isSubmitting} className="space-y-6 disabled:opacity-80">
        <FormSection title="Business" description="Shown across the public website.">
          <FormField label="Business name" required error={errors.businessName?.message}>
            {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} {...register("businessName")} />}
          </FormField>
          <Controller
            control={control}
            name="logo"
            render={({ field }) => (
              <ImageUploader
                value={field.value ? [field.value] : []}
                onChange={(imgs) => field.onChange(imgs[0] ?? null)}
                max={1}
                label="Logo"
                hint="Optional replacement for the built-in emblem. Supports all image formats (PNG, WebP, SVG, AVIF, JPEG, etc.), up to 4 MB."
              />
            )}
          />
        </FormSection>

        <FormSection title="Contact details" description="Only enter details the business has confirmed. Blank fields are hidden on the website.">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Contact email" error={errors.contactEmail?.message}>
              {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} type="email" {...register("contactEmail")} />}
            </FormField>
            <FormField label="Contact phone" error={errors.contactPhone?.message}>
              {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} type="tel" {...register("contactPhone")} />}
            </FormField>
            <FormField label="WhatsApp number" hint="International format, digits only — e.g. 919876543210." error={errors.whatsappNumber?.message}>
              {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} inputMode="numeric" {...register("whatsappNumber")} />}
            </FormField>
          </div>
          <FormField label="Address" error={errors.address?.message}>
            {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={2} {...register("address")} />}
          </FormField>
        </FormSection>

        <FormSection title="Social links" description="Full https:// links. Blank links are hidden.">
          <div className="grid gap-5 sm:grid-cols-2">
            {socials.map(({ key, label }) => (
              <FormField key={key} label={label} error={errors.social?.[key]?.message}>
                {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} type="url" inputMode="url" placeholder="https://" {...register(`social.${key}`)} />}
              </FormField>
            ))}
          </div>
        </FormSection>

        <FormSection title="Default SEO" description="Used for pages without their own title or description.">
          <FormField label="Default title" hint="Up to 70 characters." error={errors.seo?.defaultTitle?.message}>
            {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} maxLength={70} {...register("seo.defaultTitle")} />}
          </FormField>
          <FormField label="Default description" hint="Up to 170 characters." error={errors.seo?.defaultDescription?.message}>
            {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={2} maxLength={170} {...register("seo.defaultDescription")} />}
          </FormField>
        </FormSection>

        <FormSection title="Preferences">
          <Checkbox label="Create new catalogue items as drafts (recommended)" {...register("publishing.newItemsAsDraft")} />
          <div>
            <Checkbox label="Email me when a new enquiry, staffing request or application arrives" {...register("notifications.emailOnSubmission")} />
            {!emailConfigured ? (
              <p className="mt-1.5 pl-8 text-xs text-muted">No email provider is configured yet, so no emails are sent. This preference takes effect once one is set up.</p>
            ) : null}
          </div>
          <FormField label="Candidate data retention (months)" hint="Applications older than this can be purged from the Candidates page." error={errors.retentionMonths?.message}>
            {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} type="number" min={1} max={120} inputMode="numeric" className="max-w-[10rem]" {...register("retentionMonths")} />}
          </FormField>
        </FormSection>

        {canEdit ? (
          <div className="flex justify-end">
            <Button type="submit" pending={isSubmitting} disabled={!isDirty} icon={<Save aria-hidden className="h-4 w-4" />}>
              Save settings
            </Button>
          </div>
        ) : null}
      </fieldset>
    </form>
  );
}

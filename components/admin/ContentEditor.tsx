"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Eye, Plus, Rocket, Save, Trash2, Undo2 } from "lucide-react";
import { adminRequest, formatDate } from "@/lib/admin/client";
import type { ContentState } from "@/lib/admin/content";
import { contentPageKeys, siteContentSchema, type ContentPageKey } from "@/lib/admin/schemas";
import { Button } from "./Button";
import { ConfirmDialog } from "./ConfirmDialog";
import { FormField, FormSection, Input, Select, Textarea } from "./FormField";
import { useToast } from "./ToastNotification";

type Values = z.input<typeof siteContentSchema>;

const pageLabels: Record<ContentPageKey, { label: string; path: string }> = {
  home: { label: "Home", path: "/" },
  about: { label: "About", path: "/about" },
  spices: { label: "Spices", path: "/spices" },
  mentorship: { label: "Trading Mentorship", path: "/trading-mentorship" },
  digital: { label: "Digital Solutions", path: "/digital-solutions" },
  staffing: { label: "Salon Staffing", path: "/salon-staffing" },
  contact: { label: "Contact", path: "/contact" },
};

const divisionLabels = { spices: "Spices Export & Import", mentorship: "Trading Mentorship", digital: "Digital Solutions", staffing: "Salon Staffing" } as const;

/** Draft → preview → publish workflow for the editable website copy. */
export function ContentEditor({ initial }: { initial: ContentState }) {
  const toast = useToast();
  const [state, setState] = useState(initial);
  const [busy, setBusy] = useState<"save" | "preview" | "publish" | "discard" | null>(null);
  const [previewPath, setPreviewPath] = useState("/");
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const form = useForm<Values, unknown, z.output<typeof siteContentSchema>>({
    resolver: zodResolver(siteContentSchema),
    defaultValues: initial.draft,
  });
  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors, isDirty },
  } = form;
  const values = useFieldArray({ control, name: "values" });

  const applyState = (next?: ContentState) => {
    if (!next) return;
    setState(next);
    reset(next.draft);
  };

  const saveDraft = async (data: Values) => {
    const result = await adminRequest<ContentState>("/api/admin/pages", { method: "PUT", body: data });
    if (!result.ok) {
      for (const [field, message] of Object.entries(result.errors ?? {})) form.setError(field as never, { message });
      toast.error(result.message);
      return false;
    }
    applyState(result.data);
    return true;
  };

  const invalid = () => toast.error("Please fix the highlighted fields.");

  const onSave = handleSubmit(async (data) => {
    setBusy("save");
    if (await saveDraft(data)) toast.success("Draft saved. The live site is unchanged.");
    setBusy(null);
  }, invalid);

  const onPreview = handleSubmit(async (data) => {
    setBusy("preview");
    // Open the tab synchronously (avoids popup blockers), then point it at the preview once the draft is saved.
    const tab = window.open("about:blank", "_blank");
    const ok = !isDirty || (await saveDraft(data));
    setBusy(null);
    if (ok && tab) tab.location.href = `/api/admin/preview?path=${encodeURIComponent(previewPath)}`;
    else tab?.close();
  }, invalid);

  const onPublish = handleSubmit(async (data) => {
    setBusy("publish");
    if (isDirty && !(await saveDraft(data))) return setBusy(null);
    const result = await adminRequest<ContentState>("/api/admin/pages", { method: "POST", body: { action: "publish" } });
    setBusy(null);
    if (result.ok) {
      applyState(result.data);
      toast.success(result.message);
    } else toast.error(result.message);
  }, invalid);

  const onDiscard = async () => {
    setBusy("discard");
    const result = await adminRequest<ContentState>("/api/admin/pages", { method: "POST", body: { action: "discard" } });
    setBusy(null);
    setConfirmDiscard(false);
    if (result.ok) {
      applyState(result.data);
      toast.success(result.message);
    } else toast.error(result.message);
  };

  const pending = state.hasUnpublishedChanges || isDirty;
  const e = errors;

  return (
    <form onSubmit={onSave} noValidate className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <FormSection title="Homepage hero">
          <FormField label="Heading" required hint="Each line of text becomes a line of the heading; the last line is set in gold italic." error={e.home?.heroTitle?.message}>
            {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={3} {...register("home.heroTitle")} />}
          </FormField>
          <FormField label="Description" required error={e.home?.heroDescription?.message}>
            {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={3} {...register("home.heroDescription")} />}
          </FormField>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Primary button" required error={e.home?.heroPrimaryCta?.message}>
              {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} {...register("home.heroPrimaryCta")} />}
            </FormField>
            <FormField label="Secondary button" required error={e.home?.heroSecondaryCta?.message}>
              {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} {...register("home.heroSecondaryCta")} />}
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Brand introduction">
          <FormField label="Heading" required hint="One line per heading line." error={e.home?.introTitle?.message}>
            {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={2} {...register("home.introTitle")} />}
          </FormField>
          <FormField label="Lead paragraph" required error={e.home?.introLead?.message}>
            {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={4} {...register("home.introLead")} />}
          </FormField>
          <FormField label="Second paragraph" error={e.home?.introBody?.message}>
            {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={3} {...register("home.introBody")} />}
          </FormField>
        </FormSection>

        <FormSection title="Company values" description="Shown on the homepage, the About page and in the hero eyebrow. Between 3 and 7 values.">
          {values.fields.map((field, i) => (
            <div key={field.id} className="grid gap-4 rounded-xl border border-line p-4 sm:grid-cols-[10rem_1fr_auto] sm:items-start">
              <FormField label={`Value ${i + 1}`} required error={e.values?.[i]?.name?.message}>
                {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} {...register(`values.${i}.name`)} />}
              </FormField>
              <FormField label="Description" required error={e.values?.[i]?.text?.message}>
                {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={2} {...register(`values.${i}.text`)} />}
              </FormField>
              <Button
                variant="ghost"
                onClick={() => values.remove(i)}
                disabled={values.fields.length <= 3}
                aria-label={`Remove value ${i + 1}`}
                className="sm:mt-7"
                icon={<Trash2 aria-hidden className="h-4 w-4" />}
              />
            </div>
          ))}
          {e.values?.root?.message || e.values?.message ? (
            <p role="alert" className="text-xs font-medium text-red-800">
              {e.values?.root?.message ?? e.values?.message}
            </p>
          ) : null}
          {values.fields.length < 7 ? (
            <Button variant="secondary" onClick={() => values.append({ name: "", text: "" })} icon={<Plus aria-hidden className="h-4 w-4" />}>
              Add value
            </Button>
          ) : null}
        </FormSection>

        <FormSection title="Service descriptions" description="Short descriptions used on the division cards across the site.">
          {(Object.keys(divisionLabels) as (keyof typeof divisionLabels)[]).map((key) => (
            <FormField key={key} label={divisionLabels[key]} required error={e.divisions?.[key]?.message}>
              {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={2} {...register(`divisions.${key}`)} />}
            </FormField>
          ))}
        </FormSection>

        <FormSection title="Call to action" description="The closing “Start a Conversation” band on the homepage and About page.">
          <FormField label="Heading" required hint="One line per heading line." error={e.cta?.title?.message}>
            {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={2} {...register("cta.title")} />}
          </FormField>
          <FormField label="Text" required error={e.cta?.text?.message}>
            {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={3} {...register("cta.text")} />}
          </FormField>
          <FormField label="Button label" required error={e.cta?.buttonLabel?.message}>
            {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} {...register("cta.buttonLabel")} />}
          </FormField>
        </FormSection>

        <FormSection title="Footer">
          <FormField label="Tagline" required error={e.footer?.tagline?.message}>
            {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} {...register("footer.tagline")} />}
          </FormField>
          <FormField label="Description" required error={e.footer?.description?.message}>
            {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={3} {...register("footer.description")} />}
          </FormField>
        </FormSection>

        <FormSection title="SEO titles & descriptions" description="Optional per-page overrides. Leave blank to keep each page's built-in title and description.">
          {contentPageKeys.map((key) => (
            <div key={key} className="grid gap-4 rounded-xl border border-line p-4 sm:grid-cols-2">
              <FormField label={`${pageLabels[key].label} — title`} hint="Up to 70 characters." error={e.seo?.[key]?.title?.message}>
                {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} maxLength={70} {...register(`seo.${key}.title`)} />}
              </FormField>
              <FormField label="Description" hint="Up to 170 characters." error={e.seo?.[key]?.description?.message}>
                {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={2} maxLength={170} {...register(`seo.${key}.description`)} />}
              </FormField>
            </div>
          ))}
        </FormSection>
      </div>

      <div>
        <section className="space-y-5 rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-24">
          <h2 className="font-serif text-2xl text-forest">Publishing</h2>
          <div className="rounded-xl bg-ivory px-4 py-3 text-sm">
            <p className="font-medium text-ink">
              {isDirty ? "Unsaved edits" : state.hasUnpublishedChanges ? "Draft has unpublished changes" : state.isPublished ? "Live site is up to date" : "Live site uses the built-in copy"}
            </p>
            <p className="mt-1 text-xs text-muted">
              {state.publishedAt ? `Last published ${formatDate(state.publishedAt, true)}${state.publishedBy ? ` by ${state.publishedBy}` : ""}` : "Nothing published from the admin yet."}
            </p>
          </div>

          <Button type="submit" variant="secondary" pending={busy === "save"} disabled={!!busy || !isDirty} icon={<Save aria-hidden className="h-4 w-4" />} className="w-full">
            Save draft
          </Button>

          <div className="space-y-2">
            <label htmlFor="preview-page" className="block text-sm font-medium text-ink">
              Preview page
            </label>
            <Select
              id="preview-page"
              value={previewPath}
              onChange={(ev) => setPreviewPath(ev.target.value)}
              options={contentPageKeys.map((k) => ({ value: pageLabels[k].path, label: pageLabels[k].label }))}
              placeholder="Choose a page"
            />
            <Button variant="secondary" onClick={() => void onPreview()} pending={busy === "preview"} disabled={!!busy} icon={<Eye aria-hidden className="h-4 w-4" />} className="w-full">
              Preview draft on site
            </Button>
          </div>

          <Button onClick={() => void onPublish()} pending={busy === "publish"} disabled={!!busy || !pending} icon={<Rocket aria-hidden className="h-4 w-4" />} className="w-full">
            Publish changes
          </Button>
          {state.hasUnpublishedChanges ? (
            <Button variant="ghost" onClick={() => setConfirmDiscard(true)} disabled={!!busy} icon={<Undo2 aria-hidden className="h-4 w-4" />} className="w-full">
              Discard draft
            </Button>
          ) : null}
          <p className="text-xs leading-relaxed text-muted">
            Content is shown as plain text — HTML and scripts are never rendered. Contact details and social links are managed in Settings.
          </p>
        </section>
      </div>

      <ConfirmDialog
        open={confirmDiscard}
        title="Discard the draft?"
        description="All unpublished changes will be lost and the editor will return to the live version."
        confirmLabel="Discard draft"
        pending={busy === "discard"}
        onConfirm={onDiscard}
        onCancel={() => setConfirmDiscard(false)}
      />
    </form>
  );
}

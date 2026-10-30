"use client";

import { Controller } from "react-hook-form";
import type { z } from "zod";
import { mentorshipProgramSchema } from "@/lib/admin/schemas";
import { FormField, FormSection, Input, Textarea } from "../FormField";
import { EditorLayout } from "./EditorLayout";
import { LinesField } from "./LinesField";
import { SeoFields } from "./SeoFields";
import { useCatalogueForm } from "./useCatalogueForm";

type Values = z.input<typeof mentorshipProgramSchema>;

export function ProgramEditor({ id, initial, canDelete }: { id?: string; initial: Values; canDelete: boolean }) {
  const { form, onSubmit } = useCatalogueForm({
    schema: mentorshipProgramSchema,
    endpoint: "/api/admin/mentorship",
    base: "/admin/mentorship",
    id,
    defaultValues: initial,
  });
  const {
    register,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  return (
    <EditorLayout
      onSubmit={onSubmit}
      submitting={isSubmitting}
      dirty={isDirty}
      entity="programme"
      endpoint="/api/admin/mentorship"
      listHref="/admin/mentorship"
      id={id}
      previewHref={id ? `/admin/mentorship/${id}/preview` : undefined}
      canDelete={canDelete}
      statusField={register("status")}
      orderField={register("order")}
      orderError={errors.order?.message}
      main={
        <>
          <p className="rounded-xl border border-gold/40 bg-champagne/25 px-4 py-3 text-sm leading-relaxed text-ink/80">
            Mentorship is educational only. Do not publish guaranteed returns, performance figures or anything that reads as
            financial advice. The site&apos;s risk disclosure is shown alongside every programme.
          </p>
          <FormSection title="Programme">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Programme title" required error={errors.title?.message}>
                {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} {...register("title")} />}
              </FormField>
              <FormField label="URL slug" hint="Leave blank to generate from the title." error={errors.slug?.message}>
                {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} {...register("slug")} />}
              </FormField>
            </div>
            <FormField label="Description" required error={errors.description?.message}>
              {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={6} {...register("description")} />}
            </FormField>
            <Controller
              control={control}
              name="topics"
              render={({ field, fieldState }) => (
                <LinesField label="Learning topics" hint="e.g. Trading Fundamentals, Market Basics, Risk Management Education — one per line." value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
              )}
            />
          </FormSection>
          <FormSection title="Format & availability" description="Only include details that are confirmed. Blank fields are hidden.">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Mentorship format" hint="e.g. One-to-one, online" error={errors.format?.message}>
                {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} {...register("format")} />}
              </FormField>
              <FormField label="Duration" error={errors.duration?.message}>
                {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} {...register("duration")} />}
              </FormField>
              <FormField label="Availability" hint="e.g. Limited places each month" error={errors.availability?.message}>
                {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} {...register("availability")} />}
              </FormField>
              <FormField label="Enquiry button text" hint="Defaults to “Enquire about this programme”." error={errors.ctaLabel?.message}>
                {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} {...register("ctaLabel")} />}
              </FormField>
            </div>
          </FormSection>
          <SeoFields title={register("seo.title")} description={register("seo.description")} errors={errors.seo} />
        </>
      }
    />
  );
}

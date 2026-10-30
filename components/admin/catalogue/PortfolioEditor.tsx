"use client";

import { Controller } from "react-hook-form";
import type { z } from "zod";
import { portfolioProjectSchema } from "@/lib/admin/schemas";
import { Checkbox, FormField, FormSection, Input, Textarea } from "../FormField";
import { ImageUploader } from "../ImageUploader";
import { EditorLayout } from "./EditorLayout";
import { useCatalogueForm } from "./useCatalogueForm";

type Values = z.input<typeof portfolioProjectSchema>;

export function PortfolioEditor({ id, initial, canDelete }: { id?: string; initial: Values; canDelete: boolean }) {
  const { form, onSubmit } = useCatalogueForm({
    schema: portfolioProjectSchema,
    endpoint: "/api/admin/portfolio",
    base: "/admin/digital-services/portfolio",
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
      entity="project"
      endpoint="/api/admin/portfolio"
      listHref="/admin/digital-services?tab=portfolio"
      id={id}
      previewHref={id ? `/admin/digital-services/portfolio/${id}/preview` : undefined}
      canDelete={canDelete}
      statusField={register("status")}
      orderField={register("order")}
      orderError={errors.order?.message}
      sidebarExtra={
        <Checkbox
          label="Concept piece — label it “Concept” on the website (untick only for real, client-approved work)"
          error={errors.isConcept?.message}
          {...register("isConcept")}
        />
      }
      main={
        <>
          <FormSection title="Project" description="Only list real client work with the client's permission. Otherwise keep it marked as a concept.">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Project title" required error={errors.title?.message}>
                {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} {...register("title")} />}
              </FormField>
              <FormField label="Category" hint="e.g. Business website" error={errors.category?.message}>
                {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} {...register("category")} />}
              </FormField>
              <FormField label="URL slug" hint="Leave blank to generate from the title." error={errors.slug?.message}>
                {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} {...register("slug")} />}
              </FormField>
              <FormField label="Project link" hint="Full https:// address." error={errors.projectUrl?.message}>
                {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} type="url" inputMode="url" {...register("projectUrl")} />}
              </FormField>
            </div>
            <FormField label="Short description" error={errors.description?.message}>
              {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={3} {...register("description")} />}
            </FormField>
          </FormSection>
          <FormSection title="Image">
            <Controller
              control={control}
              name="image"
              render={({ field }) => (
                <ImageUploader value={field.value ? [field.value] : []} onChange={(imgs) => field.onChange(imgs[0] ?? null)} max={1} label="Project image" />
              )}
            />
          </FormSection>
        </>
      }
    />
  );
}

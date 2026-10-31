"use client";

import { Controller } from "react-hook-form";
import type { z } from "zod";
import { serviceTypeLabels } from "@/lib/admin/constants";
import { enquirySchema } from "@/lib/validations";
import { FormField, FormSection, Input, Select, Textarea } from "../FormField";
import { ImageUploader } from "../ImageUploader";
import { EditorLayout } from "./EditorLayout";
import { LinesField } from "./LinesField";
import { SeoFields } from "./SeoFields";
import { useCatalogueForm } from "./useCatalogueForm";

type Values = z.input<typeof enquirySchema>;

export function DigitalServiceEditor({ id, initial, canDelete }: { id?: string; initial: Values; canDelete: boolean }) {
  const { form, onSubmit } = useCatalogueForm({
    schema: enquirySchema,
    endpoint: "/api/admin/enquiries",
    base: "/admin/enquiries",
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
      entity="service"
      endpoint="/api/admin/enquiries"
      listHref="/admin/enquiries"
      id={id}
      previewHref={id ? `/admin/enquiries/${id}/preview` : undefined}
      canDelete={canDelete}
      statusField={register("serviceType")}
      orderField={register("order")}
      orderError={errors.order?.message}
      main={
        <>
          <FormSection title="Service">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Service title" required error={errors.title?.message}>
                {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} {...register("title")} />}
              </FormField>
              <FormField label="Service type" error={errors.serviceType?.message}>
                {(p) => (
                  <Select
                    id={p.id}
                    invalid={p.invalid}
                    describedBy={p.describedBy}
                    options={[
                      { value: "spices", label: "Spices Export & Import" },
                      { value: "mentorship", label: "Trading Mentorship" },
                      { value: "staffing", label: "Salon Staffing" },
                      { value: "general", label: "General Enquiry" },
                    ]}
                    placeholder="Select service type"
                    {...register("serviceType")}
                  />
                )}
              </FormField>
              <FormField label="URL slug" hint="Leave blank to generate from the title." error={errors.slug?.message}>
                {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} {...register("slug")} />}
              </FormField>
              <FormField label="Starting price" hint="Only if confirmed, e.g. &quot;From ₹25,000&quot;. Blank hides pricing." error={errors.startingPrice?.message}>
                {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} {...register("startingPrice")} />}
              </FormField>
            </div>
            <FormField label="Description" required error={errors.description?.message}>
              {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={4} {...register("description")} />}
            </FormField>
            <Controller
              control={control}
              name="features"
              render={({ field, fieldState }) => (
                <LinesField label="Features" hint="What's included, one per line (up to 10)." value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
              )}
            />
          </FormSection>
          <FormSection title="Featured image">
            <Controller
              control={control}
              name="image"
              render={({ field }) => (
                <ImageUploader value={field.value ? [field.value] : []} onChange={(imgs) => field.onChange(imgs[0] ?? null)} max={1} label="Image" />
              )}
            />
          </FormSection>
          <SeoFields title={register("seo.title")} description={register("seo.description")} errors={errors.seo} />
        </>
      }
    />
  );
}
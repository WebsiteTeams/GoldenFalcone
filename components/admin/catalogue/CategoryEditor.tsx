"use client";

import { Controller } from "react-hook-form";
import type { z } from "zod";
import { spiceCategorySchema } from "@/lib/admin/schemas";
import { FormField, FormSection, Input, Textarea } from "../FormField";
import { ImageUploader } from "../ImageUploader";
import { EditorLayout } from "./EditorLayout";
import { useCatalogueForm } from "./useCatalogueForm";

type Values = z.input<typeof spiceCategorySchema>;

export function CategoryEditor({
  id,
  initial,
  canDelete,
}: {
  id?: string;
  initial: Values;
  canDelete: boolean;
}) {
  const { form, onSubmit } = useCatalogueForm({
    schema: spiceCategorySchema,
    endpoint: "/api/admin/categories",
    base: "/admin/categories",
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
      entity="category"
      endpoint="/api/admin/categories"
      listHref="/admin/categories"
      id={id}
      canDelete={canDelete}
      statusField={register("status")}
      orderField={register("order")}
      orderError={errors.order?.message}
      main={
        <>
          <FormSection
            title="Category Details"
            description="Enter the core information for this spice category."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormField label="Category Name" required error={errors.name?.message}>
                  {(p) => (
                    <Input
                      id={p.id}
                      invalid={p.invalid}
                      describedBy={p.describedBy}
                      placeholder="e.g. Whole Spices, Premium Spices, Dried Spices"
                      {...register("name")}
                    />
                  )}
                </FormField>
              </div>

              <div className="sm:col-span-2">
                <FormField
                  label="URL Slug"
                  hint="Leave blank to generate automatically from the category name."
                  error={errors.slug?.message}
                >
                  {(p) => (
                    <Input
                      id={p.id}
                      invalid={p.invalid}
                      describedBy={p.describedBy}
                      placeholder="whole-spices"
                      {...register("slug")}
                    />
                  )}
                </FormField>
              </div>
            </div>

            <FormField
              label="Short Description"
              required
              hint="A concise description of this spice category."
              error={errors.shortDescription?.message}
            >
              {(p) => (
                <Textarea
                  id={p.id}
                  invalid={p.invalid}
                  describedBy={p.describedBy}
                  rows={3}
                  placeholder="Describe the collection of spices in this category..."
                  {...register("shortDescription")}
                />
              )}
            </FormField>
          </FormSection>

          <FormSection
            title="Category Image"
            description="Upload a photo representing this spice category. Single image."
          >
            <Controller
              control={control}
              name="image"
              render={({ field }) => (
                <ImageUploader
                  value={field.value ? [field.value] : []}
                  onChange={(images) => field.onChange(images[0] || null)}
                  max={1}
                  label="Category image"
                />
              )}
            />
            {errors.image && (
              <p className="mt-2 text-xs text-red-500 font-medium">
                {errors.image.message as string}
              </p>
            )}
          </FormSection>
        </>
      }
    />
  );
}

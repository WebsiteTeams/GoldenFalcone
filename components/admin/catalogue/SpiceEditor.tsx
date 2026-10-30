"use client";

import { Controller } from "react-hook-form";
import type { z } from "zod";
import { spiceProductSchema } from "@/lib/admin/schemas";
import { FormField, FormSection, Input, Select, Textarea } from "../FormField";
import { ImageUploader } from "../ImageUploader";
import { EditorLayout } from "./EditorLayout";
import { useCatalogueForm } from "./useCatalogueForm";

type Values = z.input<typeof spiceProductSchema>;

export type CategoryOption = { value: string; label: string };

export function SpiceEditor({
  id,
  initial,
  canDelete,
  categories = [],
}: {
  id?: string;
  initial: Values;
  canDelete: boolean;
  categories: CategoryOption[];
}) {
  const { form, onSubmit } = useCatalogueForm({
    schema: spiceProductSchema,
    endpoint: "/api/admin/spices",
    base: "/admin/spices",
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
      entity="product"
      endpoint="/api/admin/spices"
      listHref="/admin/spices"
      id={id}
      previewHref={id ? `/admin/spices/${id}/preview` : undefined}
      canDelete={canDelete}
      statusField={register("status")}
      orderField={register("order")}
      orderError={errors.order?.message}
      main={
        <>
          <FormSection
            title="Product Details"
            description="Enter the core information for this spice product."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormField label="Product Name" required error={errors.name?.message}>
                  {(p) => (
                    <Input
                      id={p.id}
                      invalid={p.invalid}
                      describedBy={p.describedBy}
                      placeholder="e.g. Green Cardamom, Black Pepper, Cinnamon, Cloves, Dry Ginger"
                      {...register("name")}
                    />
                  )}
                </FormField>
              </div>

              <div>
                <FormField
                  label="Category"
                  required
                  hint="Select a category from MongoDB."
                  error={errors.category?.message}
                >
                  {(p) => (
                    <Select
                      id={p.id}
                      invalid={p.invalid}
                      describedBy={p.describedBy}
                      options={categories}
                      placeholder={categories.length ? "Select a category" : "No categories available"}
                      {...register("category")}
                    />
                  )}
                </FormField>
              </div>

              <div>
                <FormField
                  label="URL Slug"
                  hint="Leave blank to generate automatically from name."
                  error={errors.slug?.message}
                >
                  {(p) => (
                    <Input
                      id={p.id}
                      invalid={p.invalid}
                      describedBy={p.describedBy}
                      placeholder="green-cardamom"
                      {...register("slug")}
                    />
                  )}
                </FormField>
              </div>
            </div>

            <FormField
              label="Short Description"
              required
              hint="A concise description of the product."
              error={errors.shortDescription?.message}
            >
              {(p) => (
                <Textarea
                  id={p.id}
                  invalid={p.invalid}
                  describedBy={p.describedBy}
                  rows={4}
                  placeholder="Enter a concise description of this spice product..."
                  {...register("shortDescription")}
                />
              )}
            </FormField>
          </FormSection>

          <FormSection
            title="Pricing"
            description="Market reference price and Goldenfalcone selling price."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Market Price"
                required
                hint="Original / reference price (shown crossed out on cards)."
                error={errors.marketPrice?.message}
              >
                {(p) => (
                  <Input
                    id={p.id}
                    invalid={p.invalid}
                    describedBy={p.describedBy}
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    {...register("marketPrice")}
                  />
                )}
              </FormField>

              <FormField
                label="Our Price"
                required
                hint="Goldenfalcone selling price."
                error={errors.ourPrice?.message}
              >
                {(p) => (
                  <Input
                    id={p.id}
                    invalid={p.invalid}
                    describedBy={p.describedBy}
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    {...register("ourPrice")}
                  />
                )}
              </FormField>
            </div>
          </FormSection>

          <FormSection
            title="Product Images"
            description="Exactly four image slots. All four images must be uploaded before publishing."
          >
            <Controller
              control={control}
              name="images"
              render={({ field }) => (
                <ImageUploader
                  value={field.value ?? []}
                  onChange={field.onChange}
                  max={4}
                  label="Product images (4 slots)"
                />
              )}
            />
            {errors.images && (
              <p className="mt-2 text-xs text-red-500 font-medium">
                {errors.images.message as string}
              </p>
            )}
          </FormSection>
        </>
      }
    />
  );
}

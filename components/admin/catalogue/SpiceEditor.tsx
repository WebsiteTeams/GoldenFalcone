"use client";

import { Controller } from "react-hook-form";
import type { z } from "zod";
import { productTypeLabels, productTypes, qualityLabels, qualityLevels } from "@/lib/admin/constants";
import { spiceProductSchema } from "@/lib/admin/schemas";
import { Checkbox, FormField, FormSection, Input, Select, Textarea } from "../FormField";
import { ImageUploader } from "../ImageUploader";
import { EditorLayout } from "./EditorLayout";
import { LabReportUploader } from "./LabReportUploader";
import { LinesField } from "./LinesField";
import { useCatalogueForm } from "./useCatalogueForm";

type Values = z.input<typeof spiceProductSchema>;

export type CategoryOption = { value: string; label: string };

const productTypeOptions = productTypes.map((value) => ({ value, label: productTypeLabels[value] }));

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
    watch,
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
                      placeholder="e.g. Chilli Powder, Turmeric Powder, Cardamom, Black Pepper"
                      {...register("name")}
                    />
                  )}
                </FormField>
              </div>

              <div>
                <FormField label="Category" required error={errors.productType?.message}>
                  {(p) => (
                    <Select
                      id={p.id}
                      invalid={p.invalid}
                      describedBy={p.describedBy}
                      options={productTypeOptions}
                      placeholder="Select Powder or Solid"
                      {...register("productType")}
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
                      placeholder="chilli-powder"
                      {...register("slug")}
                    />
                  )}
                </FormField>
              </div>

              {categories.length ? (
                <div>
                  <FormField
                    label="Collection"
                    hint="Optional grouping from the Categories page."
                    error={errors.category?.message}
                  >
                    {(p) => (
                      <Select
                        id={p.id}
                        invalid={p.invalid}
                        describedBy={p.describedBy}
                        options={categories}
                        placeholder="No collection"
                        {...register("category")}
                      />
                    )}
                  </FormField>
                </div>
              ) : null}
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

            <Controller
              control={control}
              name="highlights"
              render={({ field, fieldState }) => (
                <LinesField
                  label="Product Benefits"
                  hint="One benefit per line (up to 12)."
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
          </FormSection>

          <FormSection
            title="Quality Levels"
            description="Prices are per kilogram. Everything customers see for a quality comes from its section below, so enter only figures you can verify. Required fields, including the lab report, must be complete to publish. Inactive qualities are hidden from the store and can be left incomplete."
          >
            {errors.variants?.message || errors.variants?.root?.message ? (
              <p role="alert" className="text-sm font-medium text-red-800">
                {errors.variants?.message ?? errors.variants?.root?.message}
              </p>
            ) : null}

            {qualityLevels.map((level, i) => {
              const variantErrors = errors.variants?.[i];
              const active = watch(`variants.${i}.active`);
              return (
                <fieldset key={level} className="rounded-xl border border-line p-4 sm:p-5">
                  <legend className="px-2 font-serif text-xl text-forest">{qualityLabels[level]}</legend>
                  <input type="hidden" {...register(`variants.${i}.level`)} />
                  <div className="mb-5">
                    <Checkbox label="Active: available for customers to buy" {...register(`variants.${i}.active`)} />
                  </div>

                  <div className={active === false ? "space-y-5 opacity-60" : "space-y-5"}>
                    <div className="grid gap-5 sm:grid-cols-3">
                      <FormField label="Quality %" required={active !== false} error={variantErrors?.qualityPercent?.message}>
                        {(p) => (
                          <Input
                            id={p.id}
                            invalid={p.invalid}
                            describedBy={p.describedBy}
                            type="number"
                            min={0}
                            max={100}
                            step="0.01"
                            inputMode="decimal"
                            {...register(`variants.${i}.qualityPercent`)}
                          />
                        )}
                      </FormField>
                      <FormField label="Market Price / kg" required={active !== false} error={variantErrors?.marketPrice?.message}>
                        {(p) => (
                          <Input
                            id={p.id}
                            invalid={p.invalid}
                            describedBy={p.describedBy}
                            type="number"
                            min={0}
                            step="0.01"
                            inputMode="decimal"
                            {...register(`variants.${i}.marketPrice`)}
                          />
                        )}
                      </FormField>
                      <FormField label="Selling Price / kg" required={active !== false} error={variantErrors?.sellingPrice?.message}>
                        {(p) => (
                          <Input
                            id={p.id}
                            invalid={p.invalid}
                            describedBy={p.describedBy}
                            type="number"
                            min={0}
                            step="0.01"
                            inputMode="decimal"
                            {...register(`variants.${i}.sellingPrice`)}
                          />
                        )}
                      </FormField>
                    </div>

                    <FormField label="Import Area" required={active !== false} hint="Where this quality is sourced from." error={variantErrors?.importArea?.message}>
                      {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} maxLength={200} {...register(`variants.${i}.importArea`)} />}
                    </FormField>

                    <FormField label="Quality Specifications" hint="Optional. Shown only for this quality." error={variantErrors?.specifications?.message}>
                      {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={2} maxLength={1000} {...register(`variants.${i}.specifications`)} />}
                    </FormField>

                    <Controller
                      control={control}
                      name={`variants.${i}.labReport`}
                      render={({ field, fieldState }) => (
                        <LabReportUploader
                          label={`${qualityLabels[level]} lab report`}
                          value={field.value}
                          onChange={field.onChange}
                          error={fieldState.error?.message}
                        />
                      )}
                    />
                  </div>
                </fieldset>
              );
            })}
          </FormSection>

          <FormSection
            title="Homepage Feature"
            description="Featured products appear on the spices homepage in their category's section once published. The card shows the quality you select here."
          >
            <Checkbox label="Feature this product on the homepage" {...register("isFeatured")} />
            {watch("isFeatured") ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Quality to show" required error={errors.featuredLevel?.message as string | undefined}>
                  {(p) => (
                    <Select
                      id={p.id}
                      invalid={p.invalid}
                      describedBy={p.describedBy}
                      options={qualityLevels.map((level, i) => ({
                        value: level,
                        label: `${qualityLabels[level]}${watch(`variants.${i}.active`) === false ? " (inactive)" : ""}`,
                      }))}
                      placeholder="Select a quality"
                      {...register("featuredLevel")}
                    />
                  )}
                </FormField>
                <FormField label="Homepage order" hint="Lower numbers appear first within the category." error={errors.featuredOrder?.message}>
                  {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} type="number" min={0} max={9999} inputMode="numeric" {...register("featuredOrder")} />}
                </FormField>
              </div>
            ) : null}
          </FormSection>

          <FormSection
            title="Product Images"
            description="Four image slots. All four images must be uploaded before publishing."
          >
            <Controller
              control={control}
              name="images"
              render={({ field }) => (
                <ImageUploader
                  value={field.value ?? []}
                  onChange={field.onChange}
                  max={4}
                  label="Product images"
                  requirement="4 required to publish"
                />
              )}
            />
            {errors.images && (
              <p role="alert" className="mt-2 text-xs font-medium text-red-800">
                {errors.images.message as string}
              </p>
            )}
          </FormSection>
        </>
      }
    />
  );
}

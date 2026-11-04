"use client";

import { Controller, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import type { z } from "zod";
import {
  availabilityOptions,
  licenceTypes,
  softwareCategories,
  softwarePlatforms,
  SUPPORTED_CURRENCIES,
  tradingMarkets,
} from "@/lib/admin/constants";
import { tradingSoftwareSchema } from "@/lib/admin/schemas";
import { Button } from "../Button";
import { Checkbox, FormField, FormSection, Input, Select, Textarea } from "../FormField";
import { ImageUploader } from "../ImageUploader";
import { EditorLayout } from "./EditorLayout";
import { LinesField } from "./LinesField";
import { SeoFields } from "./SeoFields";
import { useCatalogueForm } from "./useCatalogueForm";

type Values = z.input<typeof tradingSoftwareSchema>;

const categoryOptions = softwareCategories.map(({ value, label }) => ({ value, label }));
const currencyOptions = SUPPORTED_CURRENCIES.map((value) => ({ value, label: value }));
const licenceTypeOptions = licenceTypes.map(({ value, label }) => ({ value, label }));

/** A set of checkboxes bound to one array field. */
function OptionGroup({
  legend,
  options,
  value = [],
  onChange,
  hint,
}: {
  legend: string;
  options: readonly { value: string; label: string }[];
  value: string[] | undefined;
  onChange: (next: string[]) => void;
  hint?: string;
}) {
  const toggle = (v: string, on: boolean) => onChange(on ? [...value, v] : value.filter((x) => x !== v));
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-ink">
        {legend} <span className="font-normal text-muted">(optional)</span>
      </legend>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((o) => (
          <Checkbox key={o.value} label={o.label} checked={value.includes(o.value)} onChange={(e) => toggle(o.value, e.target.checked)} />
        ))}
      </div>
      {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
    </fieldset>
  );
}

export function SoftwareEditor({ id, initial, canDelete }: { id?: string; initial: Values; canDelete: boolean }) {
  const { form, onSubmit } = useCatalogueForm({
    schema: tradingSoftwareSchema,
    endpoint: "/api/admin/trading-software",
    base: "/admin/trading-software",
    id,
    defaultValues: initial,
  });
  const {
    register,
    control,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = form;
  const licences = useFieldArray({ control, name: "licenceOptions" });
  const faqs = useFieldArray({ control, name: "faqs" });
  const licenceErrors = errors.licenceOptions as Array<Record<string, { message?: string }> | undefined> | undefined;
  const faqErrors = errors.faqs as Array<Record<string, { message?: string }> | undefined> | undefined;

  return (
    <EditorLayout
      onSubmit={onSubmit}
      submitting={isSubmitting}
      dirty={isDirty}
      entity="software"
      endpoint="/api/admin/trading-software"
      listHref="/admin/trading-software"
      id={id}
      canDelete={canDelete}
      statusField={register("status")}
      orderField={register("order")}
      orderError={errors.order?.message}
      sidebarExtra={
        <div className="space-y-5 border-t border-line pt-5">
          <FormField label="Availability" hint="Customers can only place an order while a product is Available or Limited." error={errors.availability?.message}>
            {(p) => <Select id={p.id} invalid={p.invalid} describedBy={p.describedBy} options={availabilityOptions} {...register("availability")} />}
          </FormField>
          <Checkbox label="Feature on the software page" {...register("featured")} />
          {watch("featured") ? (
            <FormField label="Featured order" hint="Lower numbers appear first." error={errors.featuredOrder?.message}>
              {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} type="number" min={0} max={9999} inputMode="numeric" {...register("featuredOrder")} />}
            </FormField>
          ) : null}
        </div>
      }
      main={
        <>
          <p className="rounded-xl border border-gold/40 bg-champagne/25 px-4 py-3 text-sm leading-relaxed text-ink/80">
            Only enter features, platforms and requirements that the product owner has confirmed. Do not publish trading performance figures, profit claims or compatibility
            that has not been verified.
          </p>

          <FormSection title="Software details">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Software name" required error={errors.name?.message}>
                {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} {...register("name")} />}
              </FormField>
              <FormField label="URL slug" hint="Leave blank to generate from the name." error={errors.slug?.message}>
                {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} {...register("slug")} />}
              </FormField>
              <FormField label="Category" required error={errors.category?.message}>
                {(p) => <Select id={p.id} invalid={p.invalid} describedBy={p.describedBy} options={categoryOptions} placeholder="Select a category" {...register("category")} />}
              </FormField>
              <FormField label="Currency" error={errors.currency?.message}>
                {(p) => <Select id={p.id} invalid={p.invalid} describedBy={p.describedBy} options={currencyOptions} {...register("currency")} />}
              </FormField>
            </div>
            <Controller
              control={control}
              name="markets"
              render={({ field }) => <OptionGroup legend="Trading markets" options={tradingMarkets} value={field.value} onChange={field.onChange} />}
            />
            <FormField label="Short description" required hint="Shown on cards. Up to 400 characters." error={errors.shortDescription?.message}>
              {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={3} maxLength={400} {...register("shortDescription")} />}
            </FormField>
            <FormField label="Full description" error={errors.description?.message}>
              {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={8} {...register("description")} />}
            </FormField>
            <Controller
              control={control}
              name="features"
              render={({ field, fieldState }) => (
                <LinesField label="Key features" hint="One confirmed feature per line (up to 20)." rows={6} value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
              )}
            />
          </FormSection>

          <FormSection title="Images & video" description="The thumbnail is required to publish. Screenshots should be real screenshots of the product.">
            <Controller
              control={control}
              name="thumbnail"
              render={({ field }) => (
                <ImageUploader
                  label="Thumbnail"
                  requirement="required to publish"
                  value={field.value ? [field.value] : []}
                  onChange={(images) => field.onChange(images[0] ?? null)}
                  max={1}
                />
              )}
            />
            {errors.thumbnail ? (
              <p role="alert" className="text-xs font-medium text-red-800">
                {errors.thumbnail.message as string}
              </p>
            ) : null}
            <Controller
              control={control}
              name="screenshots"
              render={({ field }) => <ImageUploader label="Screenshots" value={field.value ?? []} onChange={field.onChange} max={8} />}
            />
            <FormField label="Demo video link" hint="A full https:// link: YouTube, Vimeo or a direct .mp4 / .webm file." error={errors.demoVideo?.message}>
              {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} type="url" inputMode="url" {...register("demoVideo")} />}
            </FormField>
          </FormSection>

          <FormSection title="Platforms & requirements">
            <Controller
              control={control}
              name="supportedPlatforms"
              render={({ field }) => <OptionGroup legend="Supported platforms" options={softwarePlatforms} value={field.value} onChange={field.onChange} />}
            />
            <FormField label="Technical requirements" error={errors.systemRequirements?.message}>
              {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={4} {...register("systemRequirements")} />}
            </FormField>
            <FormField label="Installation & setup" hint="Requirements, supported versions and setup steps." error={errors.installationNotes?.message}>
              {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={4} {...register("installationNotes")} />}
            </FormField>
            <FormField label="Support information" error={errors.supportInfo?.message}>
              {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={3} {...register("supportInfo")} />}
            </FormField>
            <FormField label="Licence & usage conditions" error={errors.licenceTerms?.message}>
              {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={4} {...register("licenceTerms")} />}
            </FormField>
          </FormSection>

          <FormSection
            title="Licence options & pricing"
            description="Each active licence with a price can be ordered online. Leave this empty for a product that is available by demo request or on enquiry only."
          >
            {licences.fields.map((field, i) => {
              const e = licenceErrors?.[i];
              return (
                <fieldset key={field.id} className="rounded-xl border border-line p-4 sm:p-5">
                  <legend className="px-2 font-serif text-lg text-forest">Licence {i + 1}</legend>
                  <input type="hidden" {...register(`licenceOptions.${i}.id`)} />
                  <div className="grid gap-5 sm:grid-cols-3">
                    <FormField label="Name" required error={e?.name?.message}>
                      {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} placeholder="e.g. Annual licence" {...register(`licenceOptions.${i}.name`)} />}
                    </FormField>
                    <FormField label="Licence type" required error={e?.licenceType?.message}>
                      {(p) => <Select id={p.id} invalid={p.invalid} describedBy={p.describedBy} options={licenceTypeOptions} placeholder="Select a type" {...register(`licenceOptions.${i}.licenceType`)} />}
                    </FormField>
                    <FormField label="Price" required error={e?.price?.message}>
                      {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} type="number" min={0} step="0.01" inputMode="decimal" {...register(`licenceOptions.${i}.price`)} />}
                    </FormField>
                  </div>
                  <div className="mt-5">
                    <FormField label="What is included" error={e?.description?.message}>
                      {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} maxLength={300} {...register(`licenceOptions.${i}.description`)} />}
                    </FormField>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <Checkbox label="Active: customers can order this licence" {...register(`licenceOptions.${i}.active`)} />
                    <Button variant="ghost" onClick={() => licences.remove(i)} icon={<Trash2 aria-hidden className="h-4 w-4" />}>
                      Remove
                    </Button>
                  </div>
                </fieldset>
              );
            })}
            {typeof errors.licenceOptions?.message === "string" ? (
              <p role="alert" className="text-xs font-medium text-red-800">
                {errors.licenceOptions.message}
              </p>
            ) : null}
            {licences.fields.length < 8 ? (
              <Button variant="secondary" onClick={() => licences.append({ name: "", licenceType: "" as never, price: 0, description: "", active: true })} icon={<Plus aria-hidden className="h-4 w-4" />}>
                Add licence option
              </Button>
            ) : null}
          </FormSection>

          <FormSection title="Frequently asked questions" description="Optional. Only answers the product owner has confirmed.">
            {faqs.fields.map((field, i) => {
              const e = faqErrors?.[i];
              return (
                <fieldset key={field.id} className="rounded-xl border border-line p-4 sm:p-5">
                  <legend className="px-2 font-serif text-lg text-forest">Question {i + 1}</legend>
                  <div className="space-y-5">
                    <FormField label="Question" required error={e?.question?.message}>
                      {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} {...register(`faqs.${i}.question`)} />}
                    </FormField>
                    <FormField label="Answer" required error={e?.answer?.message}>
                      {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={3} {...register(`faqs.${i}.answer`)} />}
                    </FormField>
                    <Button variant="ghost" onClick={() => faqs.remove(i)} icon={<Trash2 aria-hidden className="h-4 w-4" />}>
                      Remove question
                    </Button>
                  </div>
                </fieldset>
              );
            })}
            {faqs.fields.length < 12 ? (
              <Button variant="secondary" onClick={() => faqs.append({ question: "", answer: "" })} icon={<Plus aria-hidden className="h-4 w-4" />}>
                Add question
              </Button>
            ) : null}
          </FormSection>

          <SeoFields title={register("seo.title")} description={register("seo.description")} errors={errors.seo} />
        </>
      }
    />
  );
}

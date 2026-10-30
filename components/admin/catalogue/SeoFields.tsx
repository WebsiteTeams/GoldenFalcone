"use client";

import type { UseFormRegisterReturn } from "react-hook-form";
import { FormField, FormSection, Input, Textarea } from "../FormField";

type SeoFieldsProps = {
  title: UseFormRegisterReturn;
  description: UseFormRegisterReturn;
  errors?: { title?: { message?: string }; description?: { message?: string } };
};

export function SeoFields({ title, description, errors }: SeoFieldsProps) {
  return (
    <FormSection title="Search engines" description="Optional. Leave blank to use the name and description.">
      <FormField label="SEO title" hint="Up to 70 characters." error={errors?.title?.message}>
        {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} maxLength={70} {...title} />}
      </FormField>
      <FormField label="SEO description" hint="Up to 170 characters." error={errors?.description?.message}>
        {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={3} maxLength={170} {...description} />}
      </FormField>
    </FormSection>
  );
}

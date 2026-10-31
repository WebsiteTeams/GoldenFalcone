"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, type UseFormSetValue } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { serviceProjectType, type ServiceKey } from "@/components/digital/content";
import {
  digitalBudgetRanges,
  digitalContactMethods,
  digitalIndustries,
  digitalProjectTypes,
  digitalTimelines,
} from "@/lib/admin/constants";
import { digitalProjectEnquirySchema, type DigitalProjectEnquiryInput } from "@/lib/validations";
import { Checkbox, Field, Honeypot, Input, Select, Textarea } from "./fields";
import { FormError, FormSuccess, PrivacyConsentLabel, SubmitButton, type SubmitState } from "./FormFeedback";
import { submitToApi } from "./submit";

const opts = (values: readonly string[]) => values.map((v) => ({ value: v, label: v }));

/** Pre-selects the project type when a visitor arrives from one of the service sections. */
function ProjectTypeFromUrl({ setValue }: { setValue: UseFormSetValue<DigitalProjectEnquiryInput> }) {
  const service = useSearchParams().get("service");

  useEffect(() => {
    const projectType = serviceProjectType[service as ServiceKey];
    if (projectType) setValue("projectType", projectType);
  }, [service, setValue]);

  return null;
}

export function DigitalEnquiryForm() {
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const [startedAt] = useState(() => Date.now());

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DigitalProjectEnquiryInput, unknown, z.output<typeof digitalProjectEnquirySchema>>({
    resolver: zodResolver(digitalProjectEnquirySchema),
    defaultValues: { startedAt, website: "", preferredContactMethod: "Any" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setState({ status: "idle" });
    const result = await submitToApi("/api/digital-enquiries", JSON.stringify(values), setError, {
      headers: { "Content-Type": "application/json" },
    });
    setState(result);
    if (result.status === "success") reset({ startedAt: Date.now(), website: "", preferredContactMethod: "Any" });
  });

  if (state.status === "success") {
    return <FormSuccess message={state.message} onReset={() => setState({ status: "idle" })} />;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-6" aria-busy={isSubmitting}>
      <Suspense fallback={null}>
        <ProjectTypeFromUrl setValue={setValue} />
      </Suspense>
      <Honeypot {...register("website")} />

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Full name" required error={errors.fullName?.message}>
          {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} autoComplete="name" {...register("fullName")} />}
        </Field>
        <Field label="Business / company name" error={errors.companyName?.message}>
          {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} autoComplete="organization" {...register("companyName")} />}
        </Field>
        <Field label="Email address" required error={errors.email?.message}>
          {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} type="email" autoComplete="email" {...register("email")} />}
        </Field>
        <Field label="Phone number" required error={errors.mobile?.message}>
          {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} type="tel" autoComplete="tel" {...register("mobile")} />}
        </Field>
        <Field label="Industry / business type" required error={errors.industry?.message}>
          {(p) => (
            <Select id={p.id} invalid={p.invalid} describedBy={p.describedBy} options={opts(digitalIndustries)} placeholder="Select an industry" {...register("industry")} />
          )}
        </Field>
        <Field label="Project type" required error={errors.projectType?.message}>
          {(p) => (
            <Select id={p.id} invalid={p.invalid} describedBy={p.describedBy} options={opts(digitalProjectTypes)} placeholder="Select a project type" {...register("projectType")} />
          )}
        </Field>
      </div>

      <Field label="Project description" required error={errors.projectDescription?.message}>
        {(p) => (
          <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={4} placeholder="What would you like to build, and what should it achieve?" {...register("projectDescription")} />
        )}
      </Field>
      <Field label="Required features" error={errors.requiredFeatures?.message}>
        {(p) => (
          <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={2} placeholder="e.g. User login, dashboard, online booking" {...register("requiredFeatures")} />
        )}
      </Field>
      <Field label="Target users" error={errors.targetUsers?.message}>
        {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} placeholder="e.g. Customers, staff, branch managers" {...register("targetUsers")} />}
      </Field>

      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="Estimated budget" error={errors.estimatedBudget?.message}>
          {(p) => (
            <Select id={p.id} invalid={p.invalid} describedBy={p.describedBy} options={opts(digitalBudgetRanges)} placeholder="Select range" {...register("estimatedBudget")} />
          )}
        </Field>
        <Field label="Expected timeline" error={errors.expectedTimeline?.message}>
          {(p) => (
            <Select id={p.id} invalid={p.invalid} describedBy={p.describedBy} options={opts(digitalTimelines)} placeholder="Select timeline" {...register("expectedTimeline")} />
          )}
        </Field>
        <Field label="Preferred contact" error={errors.preferredContactMethod?.message}>
          {(p) => (
            <Select
              id={p.id}
              invalid={p.invalid}
              describedBy={p.describedBy}
              options={opts(digitalContactMethods)}
              placeholder="No preference"
              {...register("preferredContactMethod", { setValueAs: (v) => v || undefined })}
            />
          )}
        </Field>
      </div>

      <Checkbox label={<PrivacyConsentLabel />} error={errors.consent?.message} {...register("consent")} />

      <FormError state={state} />
      <SubmitButton pending={isSubmitting} label="Submit Project Enquiry" />
    </form>
  );
}

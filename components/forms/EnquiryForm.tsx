"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { serviceOptions, spices } from "@/lib/content";
import { enquirySchema, type EnquiryInput, type ServiceType } from "@/lib/validations";
import { Checkbox, Field, Honeypot, Input, Select, Textarea } from "./fields";
import { FormError, FormSuccess, PrivacyConsentLabel, SubmitButton, type SubmitState } from "./FormFeedback";
import { submitToApi } from "./submit";

type Variant = "general" | "spices" | "mentorship" | "digital";

const variantService: Record<Exclude<Variant, "general">, ServiceType> = {
  spices: "spices",
  mentorship: "mentorship",
  digital: "digital",
};

const opts = (values: string[]) => values.map((v) => ({ value: v, label: v }));

const productOptions = opts([...spices.map((s) => s.name), "Multiple spices", "Other whole spices"]);
const levelOptions = opts(["Complete beginner", "Some self-study", "Some trading experience", "Experienced, looking to refine"]);
const projectOptions = opts([
  "Corporate / business website",
  "Landing page or portfolio",
  "E-commerce website",
  "Web application",
  "Booking or management system",
  "Custom business software",
  "Maintenance / SEO",
  "Not sure yet",
]);
const timelineOptions = opts(["As soon as possible", "Within 1 month", "1–3 months", "3+ months", "Flexible"]);

const copy: Record<Variant, { message: string; placeholder: string; submit: string }> = {
  general: { message: "How can we help?", placeholder: "Tell us a little about your enquiry…", submit: "Send Enquiry" },
  spices: {
    message: "Requirement details",
    placeholder: "Spices required, preferred grade or form, packaging, destination and expected timeline…",
    submit: "Send Bulk Enquiry",
  },
  mentorship: {
    message: "Your learning goals",
    placeholder: "What would you like to learn, and how do you prefer to learn (one-to-one, online, schedule)?",
    submit: "Request a Consultation",
  },
  digital: {
    message: "Project overview",
    placeholder: "What are you building, who is it for, and what should it achieve?",
    submit: "Send Project Enquiry",
  },
};

type EnquiryFormProps = { variant?: Variant; defaultService?: ServiceType };

export function EnquiryForm({ variant = "general", defaultService }: EnquiryFormProps) {
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const [startedAt] = useState(() => Date.now());
  const fixedService = variant === "general" ? undefined : variantService[variant];

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryInput, unknown, z.output<typeof enquirySchema>>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      serviceType: fixedService ?? defaultService ?? ("" as ServiceType),
      startedAt,
      website: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setState({ status: "idle" });
    const result = await submitToApi("/api/enquiries", JSON.stringify(values), setError, {
      headers: { "Content-Type": "application/json" },
    });
    setState(result);
    if (result.status === "success") reset({ serviceType: fixedService ?? defaultService, startedAt: Date.now(), website: "" });
  });

  if (state.status === "success") {
    return <FormSuccess message={state.message} onReset={() => setState({ status: "idle" })} />;
  }

  const c = copy[variant];

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-6" aria-busy={isSubmitting}>
      <Honeypot {...register("website")} />

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Full name" required error={errors.name?.message}>
          {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} autoComplete="name" {...register("name")} />}
        </Field>
        <Field label="Email" required error={errors.email?.message}>
          {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} type="email" autoComplete="email" {...register("email")} />}
        </Field>
        <Field label="Phone / WhatsApp" error={errors.phone?.message}>
          {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} type="tel" autoComplete="tel" {...register("phone")} />}
        </Field>

        {variant === "general" ? (
          <Field label="Service of interest" required error={errors.serviceType?.message}>
            {(p) => (
              <Select id={p.id} invalid={p.invalid} describedBy={p.describedBy} options={serviceOptions} placeholder="Select a service" {...register("serviceType")} />
            )}
          </Field>
        ) : null}

        {variant === "spices" || variant === "digital" || variant === "general" ? (
          <Field label="Company / business" error={errors.company?.message}>
            {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} autoComplete="organization" {...register("company")} />}
          </Field>
        ) : null}

        {variant === "spices" ? (
          <>
            <Field label="Country / region" error={errors.country?.message}>
              {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} autoComplete="country-name" {...register("country")} />}
            </Field>
            <Field label="Spice of interest" error={errors.product?.message}>
              {(p) => <Select id={p.id} invalid={p.invalid} describedBy={p.describedBy} options={productOptions} {...register("product")} />}
            </Field>
            <Field label="Approximate quantity" hint="e.g. 500 kg, 2 tonnes, monthly supply" error={errors.quantity?.message}>
              {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} {...register("quantity")} />}
            </Field>
          </>
        ) : null}

        {variant === "mentorship" ? (
          <Field label="Current experience" error={errors.experienceLevel?.message}>
            {(p) => <Select id={p.id} invalid={p.invalid} describedBy={p.describedBy} options={levelOptions} {...register("experienceLevel")} />}
          </Field>
        ) : null}

        {variant === "digital" ? (
          <>
            <Field label="Project type" error={errors.projectType?.message}>
              {(p) => <Select id={p.id} invalid={p.invalid} describedBy={p.describedBy} options={projectOptions} {...register("projectType")} />}
            </Field>
            <Field label="Approximate budget" hint="Any currency — a rough range is fine" error={errors.budget?.message}>
              {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} {...register("budget")} />}
            </Field>
            <Field label="Timeline" error={errors.timeline?.message}>
              {(p) => <Select id={p.id} invalid={p.invalid} describedBy={p.describedBy} options={timelineOptions} {...register("timeline")} />}
            </Field>
          </>
        ) : null}
      </div>

      <Field label={c.message} required error={errors.message?.message}>
        {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} placeholder={c.placeholder} {...register("message")} />}
      </Field>

      {variant === "mentorship" ? (
        <p className="rounded-xl border border-gold/30 bg-champagne/20 px-4 py-3 text-xs leading-relaxed text-ink/80">
          Mentorship is educational only and is not financial advice. Trading involves significant risk of loss.
        </p>
      ) : null}

      <Checkbox label={<PrivacyConsentLabel />} error={errors.consent?.message} {...register("consent")} />

      <FormError state={state} />
      <SubmitButton pending={isSubmitting} label={c.submit} />
    </form>
  );
}

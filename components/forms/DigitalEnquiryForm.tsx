"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { enquirySchema, type EnquiryInput } from "@/lib/validations";
import { Checkbox, Field, Honeypot, Input, Select, Textarea } from "./fields";
import { FormError, FormSuccess, SubmitButton, type SubmitState } from "./FormFeedback";
import { submitToApi } from "./submit";

export function DigitalEnquiryForm() {
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const [startedAt] = useState(() => Date.now());

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryInput, unknown, z.output<typeof enquirySchema>>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      serviceType: "",
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
    if (result.status === "success") {
      reset({ serviceType: "", startedAt: Date.now(), website: "" });
    }
  });

  if (state.status === "success") {
    return <FormSuccess message={state.message} onReset={() => setState({ status: "idle" })} />;
  }

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
      </div>

      <Field label="Service of interest" required error={errors.serviceType?.message}>
        {(p) => (
          <Select id={p.id} invalid={p.invalid} describedBy={p.describedBy} options={[
            { value: "spices", label: "Whole Spices Export & Import" },
            { value: "mentorship", label: "Trading Mentorship" },
            { value: "staffing", label: "Salon Staffing" },
            { value: "general", label: "General Enquiry" },
          ]} placeholder="Select a service" {...register("serviceType")} />
        )}
      </Field>

      <Field label="Message" required error={errors.message?.message}>
        {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} placeholder="How can we help?" {...register("message")} />}
      </Field>

      <Checkbox label={<PrivacyConsentLabel />} error={errors.consent?.message} {...register("consent")} />

      <FormError state={state} />
      <SubmitButton pending={isSubmitting} label="Send Enquiry" />
    </form>
  );
}
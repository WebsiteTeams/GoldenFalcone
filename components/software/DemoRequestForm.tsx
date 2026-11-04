"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Checkbox, Field, Honeypot, Input, Select, Textarea } from "@/components/forms/fields";
import { FormError, FormSuccess, PrivacyConsentLabel, SubmitButton, type SubmitState } from "@/components/forms/FormFeedback";
import { submitToApi } from "@/components/forms/submit";
import { contactMethods, tradingMarkets } from "@/lib/admin/constants";
import { softwareDemoRequestSchema, type SoftwareDemoRequestInput } from "@/lib/admin/schemas";

const methodOptions = contactMethods.map((m) => ({ value: m, label: m }));

type Props = { software: { id: string; name: string }[]; defaultSoftwareId?: string };

/** Demo request. Validated here and again on the server, with a honeypot and a minimum fill time for spam protection. */
export function DemoRequestForm({ software, defaultSoftwareId }: Props) {
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const [startedAt] = useState(() => Date.now());
  const defaults = { software: defaultSoftwareId ?? "", tradingMarket: "", preferredContactMethod: "Email", startedAt, website: "" } as const;
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SoftwareDemoRequestInput, unknown, z.output<typeof softwareDemoRequestSchema>>({
    resolver: zodResolver(softwareDemoRequestSchema),
    defaultValues: defaults as unknown as SoftwareDemoRequestInput,
  });

  const onSubmit = handleSubmit(async (values) => {
    setState({ status: "idle" });
    const result = await submitToApi("/api/software/enquiries", JSON.stringify(values), setError, { headers: { "Content-Type": "application/json" } });
    setState(result);
    if (result.status === "success") reset({ ...defaults, startedAt: Date.now() } as unknown as SoftwareDemoRequestInput);
  });

  if (state.status === "success") {
    return <FormSuccess message={state.message} onReset={() => setState({ status: "idle" })} resetLabel="Send another request" />;
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
        <Field label="Phone number" required error={errors.phone?.message}>
          {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} type="tel" autoComplete="tel" {...register("phone")} />}
        </Field>
        <Field label="Company name" error={errors.company?.message}>
          {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} autoComplete="organization" {...register("company")} />}
        </Field>
        <Field label="Software of interest" error={errors.software?.message}>
          {(p) => (
            <Select
              id={p.id}
              invalid={p.invalid}
              describedBy={p.describedBy}
              options={software.map((s) => ({ value: s.id, label: s.name }))}
              placeholder="No specific product"
              {...register("software")}
            />
          )}
        </Field>
        <Field label="Intended trading market" error={errors.tradingMarket?.message}>
          {(p) => <Select id={p.id} invalid={p.invalid} describedBy={p.describedBy} options={tradingMarkets} placeholder="Not sure yet" {...register("tradingMarket")} />}
        </Field>
        <Field label="Preferred contact method" required error={errors.preferredContactMethod?.message} className="sm:col-span-2">
          {(p) => <Select id={p.id} invalid={p.invalid} describedBy={p.describedBy} options={methodOptions} placeholder="Select a method" {...register("preferredContactMethod")} />}
        </Field>
      </div>
      <Field label="Message" required error={errors.message?.message}>
        {(p) => (
          <Textarea
            id={p.id}
            invalid={p.invalid}
            describedBy={p.describedBy}
            placeholder="Tell us what you would like to see in the demo, or any question about the software."
            {...register("message")}
          />
        )}
      </Field>
      <Checkbox label={<PrivacyConsentLabel />} error={errors.consent?.message} {...register("consent")} />
      <FormError state={state} />
      <SubmitButton pending={isSubmitting} label="Request a Demo" />
    </form>
  );
}

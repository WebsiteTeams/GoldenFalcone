"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  Globe,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { businessTypes, employmentTypes, experienceRequired, salonRoles } from "@/lib/content";
import { staffingRequestSchema, type StaffingRequestInput } from "@/lib/validations";
import { Checkbox, Field, Honeypot, Input, Select, Textarea } from "./fields";
import { FormError, FormSuccess, PrivacyConsentLabel, SubmitButton, type SubmitState } from "./FormFeedback";
import { submitToApi } from "./submit";

const roleOptions = salonRoles.map((r) => ({ value: r, label: r }));
const businessTypeOptions = businessTypes.map((t) => ({ value: t, label: t }));
const experienceRequiredOptions = experienceRequired.map((e) => ({ value: e, label: e }));
const employmentTypeOptions = employmentTypes.map((e) => ({ value: e, label: e }));

export function StaffingRequestForm() {
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const [startedAt] = useState(() => Date.now());

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StaffingRequestInput, unknown, z.output<typeof staffingRequestSchema>>({
    resolver: zodResolver(staffingRequestSchema),
    defaultValues: { startedAt, website: "", quantity: 1 },
  });

  const onSubmit = handleSubmit(async (values) => {
    setState({ status: "idle" });
    const result = await submitToApi("/api/staffing-requests", JSON.stringify(values), setError, {
      "Content-Type": "application/json",
    });
    setState(result);
    if (result.status === "success") reset({ startedAt: Date.now(), website: "", quantity: 1 });
  });

  if (state.status === "success") {
    return (
      <FormSuccess
        message={state.message}
        onReset={() => setState({ status: "idle" })}
        resetLabel="Submit another staffing requirement"
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-10" aria-busy={isSubmitting}>
      <Honeypot {...register("website")} />

      {/* ── Section 1: Business Information ── */}
      <div className="rounded-2xl border border-line/80 bg-white p-6 shadow-xs sm:p-8">
        <div className="mb-6 flex items-center justify-between border-b border-line/60 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-xs font-bold text-gold">
              01
            </span>
            <div>
              <h4 className="font-serif text-2xl text-forest">Business Information</h4>
              <p className="text-xs text-muted">Details about your establishment and primary contact</p>
            </div>
          </div>
          <Building2 className="hidden h-5 w-5 text-gold-dark/60 sm:block" aria-hidden />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label="Business / Salon Name"
            required
            error={errors.salonName?.message}
            className="sm:col-span-2"
          >
            {(p) => (
              <Input
                id={p.id}
                invalid={p.invalid}
                describedBy={p.describedBy}
                autoComplete="organization"
                placeholder="e.g. Aurelia Hair Studio & Spa"
                {...register("salonName")}
              />
            )}
          </Field>

          <Field label="Contact Person Name" required error={errors.contactName?.message}>
            {(p) => (
              <Input
                id={p.id}
                invalid={p.invalid}
                describedBy={p.describedBy}
                autoComplete="name"
                placeholder="e.g. Ramesh Kumar"
                {...register("contactName")}
              />
            )}
          </Field>

          <Field label="Business Location" required hint="City, Area / District" error={errors.location?.message}>
            {(p) => (
              <Input
                id={p.id}
                invalid={p.invalid}
                describedBy={p.describedBy}
                autoComplete="address-level2"
                placeholder="e.g. Indiranagar, Bengaluru"
                {...register("location")}
              />
            )}
          </Field>

          <Field label="Mobile Number" required error={errors.phone?.message}>
            {(p) => (
              <Input
                id={p.id}
                invalid={p.invalid}
                describedBy={p.describedBy}
                type="tel"
                autoComplete="tel"
                placeholder="+91 98765 43210"
                {...register("phone")}
              />
            )}
          </Field>

          <Field label="WhatsApp Number" error={errors.whatsapp?.message}>
            {(p) => (
              <Input
                id={p.id}
                invalid={p.invalid}
                describedBy={p.describedBy}
                type="tel"
                autoComplete="tel"
                placeholder="For instant coordination"
                {...register("whatsapp")}
              />
            )}
          </Field>

          <Field label="Email Address" error={errors.email?.message}>
            {(p) => (
              <Input
                id={p.id}
                invalid={p.invalid}
                describedBy={p.describedBy}
                type="email"
                autoComplete="email"
                placeholder="info@yourbrand.com"
                {...register("email")}
              />
            )}
          </Field>

          <Field label="Business Type" required error={errors.businessType?.message}>
            {(p) => (
              <Select
                id={p.id}
                invalid={p.invalid}
                describedBy={p.describedBy}
                options={businessTypeOptions}
                placeholder="Select business format"
                {...register("businessType")}
              />
            )}
          </Field>

          <Field
            label="Website or Social Media Link"
            hint="Instagram page, Google Maps, or salon website"
            error={errors.websiteOrSocial?.message}
            className="sm:col-span-2"
          >
            {(p) => (
              <Input
                id={p.id}
                invalid={p.invalid}
                describedBy={p.describedBy}
                type="url"
                placeholder="https://instagram.com/yoursalon"
                {...register("websiteOrSocial")}
              />
            )}
          </Field>
        </div>
      </div>

      {/* ── Section 2: Staffing Requirement ── */}
      <div className="rounded-2xl border border-line/80 bg-white p-6 shadow-xs sm:p-8">
        <div className="mb-6 flex items-center justify-between border-b border-line/60 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-xs font-bold text-gold">
              02
            </span>
            <div>
              <h4 className="font-serif text-2xl text-forest">Staffing Requirement</h4>
              <p className="text-xs text-muted">Role specifications, qualifications, and vacancy details</p>
            </div>
          </div>
          <Users className="hidden h-5 w-5 text-gold-dark/60 sm:block" aria-hidden />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Required Job Role" required error={errors.professionalCategory?.message}>
            {(p) => (
              <Select
                id={p.id}
                invalid={p.invalid}
                describedBy={p.describedBy}
                options={roleOptions}
                placeholder="Select job role"
                {...register("professionalCategory")}
              />
            )}
          </Field>

          <Field label="Number of Vacancies" required error={errors.quantity?.message}>
            {(p) => (
              <Input
                id={p.id}
                invalid={p.invalid}
                describedBy={p.describedBy}
                type="number"
                inputMode="numeric"
                min={1}
                max={100}
                placeholder="1"
                {...register("quantity")}
              />
            )}
          </Field>

          <Field label="Experience Required" error={errors.experienceRequired?.message}>
            {(p) => (
              <Select
                id={p.id}
                invalid={p.invalid}
                describedBy={p.describedBy}
                options={experienceRequiredOptions}
                placeholder="Select experience tier"
                {...register("experienceRequired")}
              />
            )}
          </Field>

          <Field label="Employment Type" error={errors.employmentType?.message}>
            {(p) => (
              <Select
                id={p.id}
                invalid={p.invalid}
                describedBy={p.describedBy}
                options={employmentTypeOptions}
                placeholder="Select engagement type"
                {...register("employmentType")}
              />
            )}
          </Field>

          <Field label="Expected Salary Range" hint="Monthly compensation bracket" error={errors.salaryRange?.message}>
            {(p) => (
              <Input
                id={p.id}
                invalid={p.invalid}
                describedBy={p.describedBy}
                placeholder="e.g. ₹25,000 – ₹35,000 / month + incentive"
                {...register("salaryRange")}
              />
            )}
          </Field>

          <Field label="Preferred Joining Date" error={errors.preferredJoiningDate?.message}>
            {(p) => (
              <Input
                id={p.id}
                invalid={p.invalid}
                describedBy={p.describedBy}
                placeholder="e.g. Immediate / within 15 days"
                {...register("preferredJoiningDate")}
              />
            )}
          </Field>

          <Field
            label="Required Skills & Techniques"
            hint="Specific treatments, brands, or artistic capabilities"
            error={errors.requiredSkills?.message}
            className="sm:col-span-2"
          >
            {(p) => (
              <Textarea
                id={p.id}
                invalid={p.invalid}
                describedBy={p.describedBy}
                rows={3}
                placeholder="e.g. Balayage & ombré colouring, Keratin smoothing, L'Oréal/Schwarzkopf familiarity, precision scissor work..."
                {...register("requiredSkills")}
              />
            )}
          </Field>

          <Field
            label="Job Description & Working Environment"
            hint="Working hours, weekly off, client demographic, or salon culture"
            error={errors.jobDescription?.message}
            className="sm:col-span-2"
          >
            {(p) => (
              <Textarea
                id={p.id}
                invalid={p.invalid}
                describedBy={p.describedBy}
                rows={4}
                placeholder="Provide details about typical shift timings, team size, incentives, target clientele, or specific equipment provided..."
                {...register("jobDescription")}
              />
            )}
          </Field>
        </div>
      </div>

      {/* ── Section 3: Verification & Submission ── */}
      <div className="rounded-2xl border border-line/80 bg-ivory-dark/40 p-6 sm:p-8">
        <Checkbox
          label={
            <PrivacyConsentLabel>
              I confirm that the details provided are accurate. I authorize Goldenfalcone to review this staffing requirement, connect with suitable beauty professionals on our behalf, and contact us as described in the{" "}
            </PrivacyConsentLabel>
          }
          error={errors.consent?.message}
          {...register("consent")}
        />

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            <span className="font-semibold text-forest">Reference Code:</span> A unique requirement tracking code will be generated upon submission.
          </p>
          <SubmitButton pending={isSubmitting} label="Submit Staffing Requirement" pendingLabel="Submitting Requirement…" />
        </div>

        <FormError state={state} />
      </div>
    </form>
  );
}

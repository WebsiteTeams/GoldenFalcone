"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  Award,
  Check,
  FileCheck2,
  FileText,
  Image as ImageIcon,
  Plus,
  ShieldCheck,
  Trash2,
  UploadCloud,
  User,
  X,
} from "lucide-react";
import { employmentTypes, salonRoles, skillsByCategory } from "@/lib/content";
import { site } from "@/lib/site";
import {
  candidateApplicationSchema,
  CERT_ACCEPT,
  CERT_MAX_BYTES,
  CERT_MAX_COUNT,
  CV_ACCEPT,
  CV_MAX_BYTES,
  experienceOptions,
  IMG_ACCEPT,
  IMG_MAX_BYTES,
  IMG_MAX_COUNT,
  type CandidateApplicationInput,
} from "@/lib/validations";
import { cn } from "@/lib/utils";
import { Checkbox, Field, Honeypot, Input, Select, Textarea } from "./fields";
import { FormError, FormSuccess, SubmitButton, type SubmitState } from "./FormFeedback";
import { submitToApi } from "./submit";
import Link from "next/link";

const roleOptions = salonRoles.map((r) => ({ value: r, label: r }));
const experienceSelect = experienceOptions.map((e) => ({ value: e, label: e }));
const employmentTypeOptions = employmentTypes.map((e) => ({ value: e, label: e }));

const DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const IMG_TYPES = ["image/jpeg", "image/png", "image/webp"];
const CERT_TYPES = [...DOC_TYPES, ...IMG_TYPES];

type UploadedFile = { file: File; id: string };

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function FilePreviewList({
  files,
  onRemove,
  icon: Icon = FileText,
}: {
  files: UploadedFile[];
  onRemove: (id: string) => void;
  icon?: typeof FileText;
}) {
  if (!files.length) return null;
  return (
    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
      {files.map(({ file, id }) => (
        <li
          key={id}
          className="flex items-center justify-between gap-3 rounded-xl border border-line/80 bg-ivory/60 px-3.5 py-2.5 text-xs transition-colors hover:border-gold/40"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <Icon aria-hidden className="h-4 w-4 shrink-0 text-emerald" />
            <div className="min-w-0 flex-1 truncate">
              <p className="truncate font-medium text-ink">{file.name}</p>
              <p className="text-[0.65rem] text-muted">{formatBytes(file.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRemove(id)}
            className="rounded-lg p-1 text-muted transition-colors hover:bg-red-50 hover:text-red-700"
            aria-label={`Remove ${file.name}`}
          >
            <Trash2 aria-hidden className="h-3.5 w-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function MultiFileUploadBox({
  label,
  hint,
  accept,
  error,
  files,
  onAdd,
  onRemove,
  maxCount,
  icon: Icon = FileText,
}: {
  label: string;
  hint: string;
  accept: string;
  error?: string;
  files: UploadedFile[];
  onAdd: (f: File) => string | null;
  onRemove: (id: string) => void;
  maxCount: number;
  icon?: typeof FileText;
}) {
  const [fieldError, setFieldError] = useState<string>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    e.target.value = "";
    for (const f of selected) {
      const err = onAdd(f);
      if (err) {
        setFieldError(err);
        return;
      }
    }
    setFieldError(undefined);
  };

  const combinedError = error || fieldError;

  return (
    <div className="rounded-xl border border-line/70 bg-white p-5 transition-[border-color] hover:border-gold/40">
      <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
        <div>
          <h5 className="text-sm font-semibold text-ink">{label}</h5>
          <p className="text-xs text-muted">{hint}</p>
        </div>
        <span className="text-[0.7rem] font-medium text-gold-dark">
          {files.length} / {maxCount} files
        </span>
      </div>

      {files.length < maxCount && (
        <label
          className={cn(
            "mt-3.5 flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed py-4 text-xs font-medium text-muted transition-all duration-200 hover:bg-ivory/50",
            combinedError
              ? "border-red-700/60 text-red-800 hover:border-red-700"
              : "border-line/90 hover:border-gold hover:text-forest",
          )}
        >
          <UploadCloud aria-hidden className="h-4 w-4 text-gold-dark" />
          <span>Click to select {files.length > 0 ? "more files" : "documents"}</span>
          <input
            type="file"
            accept={accept}
            multiple={maxCount > 1}
            className="sr-only"
            onChange={handleChange}
            aria-label={label}
          />
        </label>
      )}

      {combinedError && (
        <p role="alert" className="mt-2 text-xs font-medium text-red-800">
          {combinedError}
        </p>
      )}

      <FilePreviewList files={files} onRemove={onRemove} icon={Icon} />
    </div>
  );
}

export function CandidateApplicationForm() {
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const [startedAt] = useState(() => Date.now());
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [cv, setCv] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string>();
  const [certificates, setCertificates] = useState<UploadedFile[]>([]);
  const [trainingCerts, setTrainingCerts] = useState<UploadedFile[]>([]);
  const [portfolio, setPortfolio] = useState<UploadedFile[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CandidateApplicationInput, unknown, z.output<typeof candidateApplicationSchema>>({
    resolver: zodResolver(candidateApplicationSchema),
    defaultValues: { startedAt, website: "" },
  });

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const addCustomSkill = () => {
    const s = customSkillInput.trim();
    if (s && !customSkills.includes(s) && !selectedSkills.includes(s)) {
      setCustomSkills((prev) => [...prev, s]);
    }
    setCustomSkillInput("");
  };

  const removeCustomSkill = (skill: string) =>
    setCustomSkills((prev) => prev.filter((s) => s !== skill));

  const onCvFile = (file: File | undefined) => {
    setCvError(undefined);
    if (!file) return setCv(null);
    if (!DOC_TYPES.includes(file.type)) {
      setCv(null);
      return setCvError("Please upload a PDF or Word document (.pdf, .doc, .docx).");
    }
    if (file.size > CV_MAX_BYTES) {
      setCv(null);
      return setCvError("CV file must be 5 MB or smaller.");
    }
    setCv(file);
  };

  const makeAdder =
    (
      setter: React.Dispatch<React.SetStateAction<UploadedFile[]>>,
      allowedTypes: string[],
      maxBytes: number,
      maxCount: number,
      errLabel: string,
    ) =>
    (file: File): string | null => {
      if (!allowedTypes.includes(file.type))
        return `${errLabel} must be a valid file format.`;
      if (file.size > maxBytes)
        return `${errLabel} exceeds ${Math.round(maxBytes / 1024 / 1024)} MB.`;
      const id = `${Date.now()}-${Math.random()}`;
      setter((prev) => {
        if (prev.length >= maxCount) return prev;
        return [...prev, { file, id }];
      });
      return null;
    };

  const addCert = makeAdder(setCertificates, CERT_TYPES, CERT_MAX_BYTES, CERT_MAX_COUNT, "Certificate");
  const addTraining = makeAdder(
    setTrainingCerts,
    CERT_TYPES,
    CERT_MAX_BYTES,
    CERT_MAX_COUNT,
    "Training certificate",
  );
  const addPortfolio = makeAdder(
    setPortfolio,
    IMG_TYPES,
    IMG_MAX_BYTES,
    IMG_MAX_COUNT,
    "Portfolio visual",
  );

  const removeFile =
    (setter: React.Dispatch<React.SetStateAction<UploadedFile[]>>) => (id: string) =>
      setter((prev) => prev.filter((f) => f.id !== id));

  const onSubmit = handleSubmit(async (values) => {
    if (cvError) return;
    setState({ status: "idle" });

    const body = new FormData();
    for (const [key, value] of Object.entries(values)) {
      if (value !== undefined) body.append(key, String(value));
    }
    body.set("additionalSkills", JSON.stringify(selectedSkills));
    body.set("customSkills", customSkills.join(", "));
    if (cv) body.append("cv", cv);
    for (const { file } of certificates) body.append("certificates", file);
    for (const { file } of trainingCerts) body.append("trainingCertificates", file);
    for (const { file } of portfolio) body.append("portfolioImages", file);

    const result = await submitToApi<CandidateApplicationInput>(
      "/api/candidate-applications",
      body,
      (field, error) => {
        if ((field as string) === "cv") setCvError(error.message);
        else setError(field, error);
      },
    );
    setState(result);
    if (result.status === "success") {
      reset({ startedAt: Date.now(), website: "" });
      setCv(null);
      setSelectedSkills([]);
      setCustomSkills([]);
      setCertificates([]);
      setTrainingCerts([]);
      setPortfolio([]);
    }
  });

  if (state.status === "success") {
    return (
      <FormSuccess
        message={state.message}
        onReset={() => setState({ status: "idle" })}
        resetLabel="Submit another professional profile"
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-10" aria-busy={isSubmitting}>
      <Honeypot {...register("website")} />

      {/* ── Section 1: Personal Profile ── */}
      <div className="rounded-2xl border border-line/80 bg-white p-6 shadow-xs sm:p-8">
        <div className="mb-6 flex items-center justify-between border-b border-line/60 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-xs font-bold text-gold">
              01
            </span>
            <div>
              <h4 className="font-serif text-2xl text-forest">Personal Information</h4>
              <p className="text-xs text-muted">Your contact identity and working location preferences</p>
            </div>
          </div>
          <User className="hidden h-5 w-5 text-gold-dark/60 sm:block" aria-hidden />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Full Name" required error={errors.fullName?.message} className="sm:col-span-2">
            {(p) => (
              <Input
                id={p.id}
                invalid={p.invalid}
                describedBy={p.describedBy}
                autoComplete="name"
                placeholder="e.g. Priya Sharma"
                {...register("fullName")}
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
                placeholder="For role alerts & updates"
                {...register("whatsapp")}
              />
            )}
          </Field>

          <Field label="Email Address" required error={errors.email?.message}>
            {(p) => (
              <Input
                id={p.id}
                invalid={p.invalid}
                describedBy={p.describedBy}
                type="email"
                autoComplete="email"
                placeholder="priya.sharma@example.com"
                {...register("email")}
              />
            )}
          </Field>

          <Field label="Current Location" required hint="City, Area" error={errors.location?.message}>
            {(p) => (
              <Input
                id={p.id}
                invalid={p.invalid}
                describedBy={p.describedBy}
                autoComplete="address-level2"
                placeholder="e.g. Bandra West, Mumbai"
                {...register("location")}
              />
            )}
          </Field>

          <Field
            label="Preferred Work Location"
            hint="Specific cities, suburbs or 'Open to relocate'"
            error={errors.preferredWorkLocation?.message}
            className="sm:col-span-2"
          >
            {(p) => (
              <Input
                id={p.id}
                invalid={p.invalid}
                describedBy={p.describedBy}
                placeholder="e.g. Mumbai, Navi Mumbai, or Flexible"
                {...register("preferredWorkLocation")}
              />
            )}
          </Field>
        </div>
      </div>

      {/* ── Section 2: Professional Experience ── */}
      <div className="rounded-2xl border border-line/80 bg-white p-6 shadow-xs sm:p-8">
        <div className="mb-6 flex items-center justify-between border-b border-line/60 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-xs font-bold text-gold">
              02
            </span>
            <div>
              <h4 className="font-serif text-2xl text-forest">Professional Background</h4>
              <p className="text-xs text-muted">Primary vocation, career duration, and salary expectations</p>
            </div>
          </div>
          <Award className="hidden h-5 w-5 text-gold-dark/60 sm:block" aria-hidden />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Primary Job Role" required error={errors.professionalCategory?.message}>
            {(p) => (
              <Select
                id={p.id}
                invalid={p.invalid}
                describedBy={p.describedBy}
                options={roleOptions}
                placeholder="Select your core profession"
                {...register("professionalCategory")}
              />
            )}
          </Field>

          <Field label="Total Experience" required error={errors.experience?.message}>
            {(p) => (
              <Select
                id={p.id}
                invalid={p.invalid}
                describedBy={p.describedBy}
                options={experienceSelect}
                placeholder="Select years of experience"
                {...register("experience")}
              />
            )}
          </Field>

          <Field label="Previous Workplace" hint="Most recent salon, spa or studio" error={errors.previousWorkplace?.message}>
            {(p) => (
              <Input
                id={p.id}
                invalid={p.invalid}
                describedBy={p.describedBy}
                placeholder="e.g. Envie Luxury Salon"
                {...register("previousWorkplace")}
              />
            )}
          </Field>

          <Field label="Previous Job Role" error={errors.previousJobRole?.message}>
            {(p) => (
              <Input
                id={p.id}
                invalid={p.invalid}
                describedBy={p.describedBy}
                placeholder="e.g. Senior Hair Stylist"
                {...register("previousJobRole")}
              />
            )}
          </Field>

          <Field label="Employment Preference" error={errors.employmentPreference?.message}>
            {(p) => (
              <Select
                id={p.id}
                invalid={p.invalid}
                describedBy={p.describedBy}
                options={employmentTypeOptions}
                placeholder="Select preferred schedule"
                {...register("employmentPreference")}
              />
            )}
          </Field>

          <Field label="Expected Salary" hint="Expected monthly package" error={errors.expectedSalary?.message}>
            {(p) => (
              <Input
                id={p.id}
                invalid={p.invalid}
                describedBy={p.describedBy}
                placeholder="e.g. ₹30,000 / month"
                {...register("expectedSalary")}
              />
            )}
          </Field>

          <Field
            label="Availability / Joining Date"
            hint="Notice period or immediate availability"
            error={errors.availability?.message}
            className="sm:col-span-2"
          >
            {(p) => (
              <Input
                id={p.id}
                invalid={p.invalid}
                describedBy={p.describedBy}
                placeholder="e.g. Immediate / 15 days notice"
                {...register("availability")}
              />
            )}
          </Field>

          <Field
            label="Short Professional Introduction"
            hint="Summarise your training, certifications, specialty services, and career goals"
            error={errors.about?.message}
            className="sm:col-span-2"
          >
            {(p) => (
              <Textarea
                id={p.id}
                invalid={p.invalid}
                describedBy={p.describedBy}
                rows={4}
                placeholder="e.g. Certified Toni&Guy stylist with 4 years experience specializing in creative colour, precision cuts, and bridal hair design. Known for strong client consultations and product knowledge..."
                {...register("about")}
              />
            )}
          </Field>
        </div>
      </div>

      {/* ── Section 3: Skills Matrix ── */}
      <div className="rounded-2xl border border-line/80 bg-white p-6 shadow-xs sm:p-8">
        <div className="mb-6 flex items-center justify-between border-b border-line/60 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-xs font-bold text-gold">
              03
            </span>
            <div>
              <h4 className="font-serif text-2xl text-forest">Skills & Specialisations</h4>
              <p className="text-xs text-muted">
                Select your key capabilities ({selectedSkills.length + customSkills.length} selected)
              </p>
            </div>
          </div>
          <FileCheck2 className="hidden h-5 w-5 text-gold-dark/60 sm:block" aria-hidden />
        </div>

        <div className="space-y-6">
          {(Object.entries(skillsByCategory) as [string, readonly string[]][]).map(
            ([category, skills]) => (
              <div key={category} className="rounded-xl border border-line/50 bg-ivory/40 p-4">
                <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-wider text-forest">
                  {category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => {
                    const active = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
                          active
                            ? "border-forest bg-forest text-gold shadow-xs"
                            : "border-line bg-white text-ink/80 hover:border-gold hover:text-forest",
                        )}
                      >
                        {active && <Check className="h-3 w-3 stroke-[2.5]" aria-hidden />}
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            ),
          )}

          {/* Add custom skills */}
          <div className="rounded-xl border border-line/80 bg-white p-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gold-dark">
              Add Specific Technique or Specialty
            </p>
            <div className="flex gap-2.5">
              <input
                type="text"
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomSkill();
                  }
                }}
                placeholder="e.g. Russian manicure, Nanoplastia, Airbrush tanning..."
                className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15"
              />
              <button
                type="button"
                onClick={addCustomSkill}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-forest bg-forest px-4 py-2.5 text-xs font-semibold text-ivory transition-colors hover:bg-emerald"
              >
                <Plus aria-hidden className="h-4 w-4" /> Add
              </button>
            </div>

            {customSkills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {customSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-champagne/40 px-3 py-1 text-xs font-medium text-forest"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeCustomSkill(skill)}
                      className="text-muted hover:text-red-700"
                      aria-label={`Remove ${skill}`}
                    >
                      <X aria-hidden className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 4: Document Vault & Credentials ── */}
      {site.cvUploadsEnabled && (
        <div className="rounded-2xl border border-line/80 bg-white p-6 shadow-xs sm:p-8">
          <div className="mb-6 flex items-center justify-between border-b border-line/60 pb-5">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-xs font-bold text-gold">
                04
              </span>
              <div>
                <h4 className="font-serif text-2xl text-forest">Document Vault & Certificates</h4>
                <p className="text-xs text-muted">
                  Private & secure document uploads — never published publicly
                </p>
              </div>
            </div>
            <ShieldCheck className="hidden h-5 w-5 text-gold-dark/60 sm:block" aria-hidden />
          </div>

          <div className="space-y-6">
            {/* Primary CV Upload */}
            <div className="rounded-xl border border-line/80 bg-ivory/40 p-5">
              <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                <div>
                  <h5 className="text-sm font-semibold text-forest">Resume / Curriculum Vitae</h5>
                  <p className="text-xs text-muted">
                    Accepted formats: PDF or Word (.pdf, .doc, .docx) — max 5 MB
                  </p>
                </div>
                {cv && (
                  <span className="text-xs font-semibold text-emerald">
                    ✓ Attached ({formatBytes(cv.size)})
                  </span>
                )}
              </div>

              <label
                className={cn(
                  "mt-3.5 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed bg-white px-4 py-3.5 text-xs transition-colors",
                  cvError
                    ? "border-red-700/60 hover:border-red-700"
                    : "border-line hover:border-gold",
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <FileText className="h-4 w-4 shrink-0 text-gold-dark" aria-hidden />
                  <span className="truncate font-medium text-ink">
                    {cv ? cv.name : "Choose CV / Resume file"}
                  </span>
                </div>
                {cv ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setCv(null);
                      setCvError(undefined);
                    }}
                    className="rounded p-1 text-muted hover:text-red-700"
                    aria-label="Remove CV"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : (
                  <span className="shrink-0 font-semibold text-forest">Browse</span>
                )}
                <input
                  type="file"
                  accept={CV_ACCEPT}
                  className="sr-only"
                  onChange={(e) => onCvFile(e.target.files?.[0])}
                />
              </label>

              {cvError && (
                <p role="alert" className="mt-2 text-xs font-medium text-red-800">
                  {cvError}
                </p>
              )}
            </div>

            {/* Professional Certificates */}
            <MultiFileUploadBox
              label="Professional Academy & Trade Certificates"
              hint="Government, CIDESCO, Toni&Guy, Vidal Sassoon, or academy diploma (PDF / image up to 5 MB each)"
              accept={CERT_ACCEPT}
              files={certificates}
              onAdd={addCert}
              onRemove={removeFile(setCertificates)}
              maxCount={CERT_MAX_COUNT}
              icon={Award}
            />

            {/* Training Certificates */}
            <MultiFileUploadBox
              label="Brand & Advanced Training Certificates"
              hint="Brand workshops (L'Oréal, Wella, Dyson, Olaplex) or masterclasses (PDF / image up to 5 MB each)"
              accept={CERT_ACCEPT}
              files={trainingCerts}
              onAdd={addTraining}
              onRemove={removeFile(setTrainingCerts)}
              maxCount={CERT_MAX_COUNT}
              icon={FileText}
            />

            {/* Portfolio Images */}
            <MultiFileUploadBox
              label="Work Portfolio & Client Artistry Images"
              hint="Photos of haircuts, creative colouring, bridal looks, or nail art (JPG, PNG, WebP up to 8 MB each)"
              accept={IMG_ACCEPT}
              files={portfolio}
              onAdd={addPortfolio}
              onRemove={removeFile(setPortfolio)}
              maxCount={IMG_MAX_COUNT}
              icon={ImageIcon}
            />
          </div>
        </div>
      )}

      {/* ── Section 5: Verification & Submission ── */}
      <div className="rounded-2xl border border-line/80 bg-ivory-dark/40 p-6 sm:p-8">
        <div className="mb-5 rounded-xl border border-line/60 bg-white p-4 text-xs leading-relaxed text-muted">
          <strong className="font-semibold text-forest">Privacy & Candidate Security:</strong> Your
          application and credentials are protected under Goldenfalcone&apos;s strict recruitment privacy
          standards. They are reviewed exclusively by our staffing specialists and shared with vetted salons
          only with your express permission. You may request data modification or deletion at any time in
          accordance with our{" "}
          <Link
            href="/privacy-policy"
            className="font-medium text-forest underline decoration-gold/60 underline-offset-2"
          >
            Privacy Policy
          </Link>
          .
        </div>

        <Checkbox
          label="I consent to Goldenfalcone securely processing my details, verifying my qualifications, and presenting my profile to prospective salon employers for suitable recruitment opportunities."
          error={errors.consent?.message}
          {...register("consent")}
        />

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            <span className="font-semibold text-forest">Candidate Reference:</span> You will receive a unique tracking ID upon successful submission.
          </p>
          <SubmitButton
            pending={isSubmitting}
            label="Submit Professional Profile"
            pendingLabel="Encrypting & Submitting Profile…"
          />
        </div>

        <FormError state={state} />
      </div>
    </form>
  );
}

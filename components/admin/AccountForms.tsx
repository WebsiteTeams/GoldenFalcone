"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Eye, EyeOff, KeyRound, Save } from "lucide-react";
import { adminRequest } from "@/lib/admin/client";
import { passwordChangeSchema, profileSchema } from "@/lib/admin/schemas";
import { Button } from "./Button";
import { FormField, FormSection, Input } from "./FormField";
import { useToast } from "./ToastNotification";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<z.input<typeof profileSchema>, unknown, z.output<typeof profileSchema>>({ resolver: zodResolver(profileSchema), defaultValues: { name } });

  const onSubmit = handleSubmit(async (values) => {
    const result = await adminRequest("/api/admin/profile", { method: "PATCH", body: values });
    if (!result.ok) return toast.error(result.message);
    reset(values);
    toast.success(result.message);
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <FormSection title="Your profile">
        <FormField label="Name" required error={errors.name?.message}>
          {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} autoComplete="name" {...register("name")} />}
        </FormField>
        <FormField label="Email" hint="Sign-in emails are changed with the admin CLI.">
          {(p) => <Input id={p.id} describedBy={p.describedBy} value={email} readOnly disabled />}
        </FormField>
        <Button type="submit" variant="secondary" pending={isSubmitting} disabled={!isDirty} icon={<Save aria-hidden className="h-4 w-4" />}>
          Save profile
        </Button>
      </FormSection>
    </form>
  );
}

export function PasswordForm() {
  const toast = useToast();
  const [show, setShow] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof passwordChangeSchema>, unknown, z.output<typeof passwordChangeSchema>>({ resolver: zodResolver(passwordChangeSchema) });

  const onSubmit = handleSubmit(async (values) => {
    const result = await adminRequest("/api/admin/password", { body: values });
    if (!result.ok) {
      for (const [field, message] of Object.entries(result.errors ?? {})) setError(field as never, { message });
      return toast.error(result.message);
    }
    reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
    toast.success(result.message);
  });

  const type = show ? "text" : "password";
  return (
    <form onSubmit={onSubmit} noValidate>
      <FormSection title="Change password" description="At least 12 characters. Changing it signs out all your other devices.">
        <FormField label="Current password" required error={errors.currentPassword?.message}>
          {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} type={type} autoComplete="current-password" {...register("currentPassword")} />}
        </FormField>
        <FormField label="New password" required error={errors.newPassword?.message}>
          {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} type={type} autoComplete="new-password" {...register("newPassword")} />}
        </FormField>
        <FormField label="Confirm new password" required error={errors.confirmPassword?.message}>
          {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} type={type} autoComplete="new-password" {...register("confirmPassword")} />}
        </FormField>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" pending={isSubmitting} icon={<KeyRound aria-hidden className="h-4 w-4" />}>
            Change password
          </Button>
          <Button variant="ghost" onClick={() => setShow((s) => !s)} aria-pressed={show} icon={show ? <EyeOff aria-hidden className="h-4 w-4" /> : <Eye aria-hidden className="h-4 w-4" />}>
            {show ? "Hide" : "Show"} passwords
          </Button>
        </div>
      </FormSection>
    </form>
  );
}

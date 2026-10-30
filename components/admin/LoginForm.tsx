"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { FormError } from "@/components/forms/FormFeedback";
import { Checkbox, Field, Input } from "@/components/forms/fields";
import { adminRequest } from "@/lib/admin/client";
import { loginSchema } from "@/lib/admin/schemas";
import { Button } from "./Button";

export function LoginForm({ next }: { next: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<z.input<typeof loginSchema>, unknown, z.output<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: false },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(undefined);
    const result = await adminRequest("/api/admin/auth/login", { body: values });
    if (!result.ok) {
      setError(result.message);
      throw new Error(result.message); // keeps isSubmitSuccessful false
    }
    // Full navigation so the protected layout renders with the new session cookie.
    window.location.assign(next);
  });

  return (
    <form onSubmit={(e) => void onSubmit(e).catch(() => undefined)} noValidate className="mt-8 space-y-5">
      <Field label="Email address" required error={errors.email?.message}>
        {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} type="email" autoComplete="username" autoFocus {...register("email")} />}
      </Field>
      <Field label="Password" required error={errors.password?.message}>
        {(p) => (
          <div className="relative">
            <Input
              id={p.id}
              invalid={p.invalid}
              describedBy={p.describedBy}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="pr-12"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:text-forest"
            >
              {showPassword ? <EyeOff aria-hidden className="h-4 w-4" /> : <Eye aria-hidden className="h-4 w-4" />}
            </button>
          </div>
        )}
      </Field>
      <Checkbox label="Keep me signed in on this device for 30 days" {...register("remember")} />
      <FormError state={{ status: error ? "error" : "idle", message: error }} />
      <Button type="submit" pending={isSubmitting || isSubmitSuccessful} icon={<LogIn aria-hidden className="h-4 w-4" />} className="h-11 w-full">
        {isSubmitSuccessful ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

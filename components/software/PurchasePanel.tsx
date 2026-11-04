"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, MessageCircle } from "lucide-react";
import type { z } from "zod";
import { Checkbox, Field, Honeypot, Input, Textarea } from "@/components/forms/fields";
import { FormError, SubmitButton, type SubmitState } from "@/components/forms/FormFeedback";
import { softwarePurchaseSchema, type SoftwarePurchaseInput } from "@/lib/admin/schemas";
import { formatPrice } from "@/lib/cart/price";
import type { PublicSoftware } from "@/lib/software/types";
import { cn } from "@/lib/utils";
import { AvailabilityBadge, PriceLine } from "./shared";

type Done = { orderNumber: string; waHref: string | null; amount: number; currency: string; licenceName: string };

/**
 * Licence choice and purchase request. The customer chooses a licence, leaves their details, and we confirm the order,
 * then arrange payment and delivery. No payment is taken on this page, and the price is re-read from the database on submit.
 */
export function PurchasePanel({ product }: { product: PublicSoftware }) {
  const first = product.licences[0];
  const [licenceId, setLicenceId] = useState(first?.id ?? "");
  const [step, setStep] = useState<"choose" | "details" | "done">("choose");
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const [done, setDone] = useState<Done | null>(null);
  const [startedAt] = useState(() => Date.now());
  const selected = product.licences.find((l) => l.id === licenceId) ?? first;

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SoftwarePurchaseInput, unknown, z.output<typeof softwarePurchaseSchema>>({
    resolver: zodResolver(softwarePurchaseSchema),
    defaultValues: { productId: product.id, licenceId: first?.id, expectedPrice: first?.price, startedAt, website: "", customer: { name: "", email: "", phone: "", company: "", country: "" }, notes: "" } as SoftwarePurchaseInput,
  });

  const choose = (id: string, price: number) => {
    setLicenceId(id);
    setValue("licenceId", id);
    setValue("expectedPrice", price);
  };

  const onSubmit = handleSubmit(async (values) => {
    setState({ status: "idle" });
    try {
      const res = await fetch("/api/software/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const json = (await res.json().catch(() => null)) as { ok: boolean; message?: string; errors?: Record<string, string>; data?: Done } | null;
      if (res.ok && json?.ok && json.data) {
        setDone({ ...json.data, licenceName: json.data.licenceName ?? selected.name });
        setStep("done");
        return;
      }
      for (const [field, message] of Object.entries(json?.errors ?? {})) setError(field as never, { type: "server", message });
      setState({ status: "error", message: json?.message ?? "We could not place your request. Please try again." });
    } catch {
      setState({ status: "error", message: "Network error. Please check your connection and try again." });
    }
  });

  const header = (
    <div>
      <p className="eyebrow text-gold-deep">{product.categoryLabel}</p>
      <h1 className="mt-3 text-4xl leading-tight text-forest sm:text-5xl">{product.name}</h1>
      <p className="mt-4 leading-relaxed text-muted">{product.shortDescription}</p>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <PriceLine product={product} size="lg" />
        <AvailabilityBadge product={product} />
      </div>
    </div>
  );

  if (step === "done" && done) {
    return (
      <div role="status" className="rounded-[1.5rem] border border-gold/40 bg-white p-7 sm:p-9">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-forest text-gold">
          <CheckCircle2 aria-hidden className="h-6 w-6" />
        </span>
        <h2 className="mt-5 text-3xl text-forest">Request received.</h2>
        <p className="mt-3 leading-relaxed text-muted">
          Your request for <strong className="text-ink">{product.name}</strong> ({done.licenceName}, {formatPrice(done.amount, done.currency)}) has been recorded under reference{" "}
          <strong className="font-mono text-ink">{done.orderNumber}</strong>.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          It is not confirmed or paid yet. Our team will contact you to confirm the order, arrange payment and send your delivery and activation details.
        </p>
        {done.waHref ? (
          <a href={done.waHref} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1EBE5D]">
            <MessageCircle aria-hidden className="h-4 w-4" /> Send this request on WhatsApp
          </a>
        ) : null}
      </div>
    );
  }

  if (!product.canPurchase || !selected) {
    return (
      <div className="space-y-8">
        {header}
        <div className="rounded-[1.25rem] border border-line bg-white p-6">
          <p className="font-semibold text-forest">
            {product.availability === "unavailable" ? "This software is currently unavailable." : "Online ordering is not open for this software."}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">Request a demo or send us a message and we will tell you about pricing, licences and availability.</p>
          <a href="#demo" className="mt-5 inline-flex rounded-full bg-forest px-7 py-3.5 text-sm font-semibold text-ivory hover:bg-emerald">
            Request a Demo
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {header}

      <fieldset className={cn(step === "details" && "hidden")}>
        <legend className="mb-3 text-sm font-semibold text-forest">Choose a licence</legend>
        <div className="space-y-3">
          {product.licences.map((l) => (
            <label
              key={l.id}
              className={cn(
                "flex cursor-pointer items-start justify-between gap-4 rounded-xl border bg-white p-4 transition-colors focus-within:ring-4 focus-within:ring-gold/20",
                licenceId === l.id ? "border-gold bg-champagne/15" : "border-line hover:border-gold/50",
              )}
            >
              <span className="flex items-start gap-3">
                <input type="radio" name="licence" value={l.id} checked={licenceId === l.id} onChange={() => choose(l.id, l.price)} className="mt-1 h-4 w-4 accent-forest" />
                <span>
                  <span className="block font-medium text-ink">{l.name}</span>
                  <span className="block text-xs text-muted">{l.typeLabel}</span>
                  {l.description ? <span className="mt-1 block text-sm text-muted">{l.description}</span> : null}
                </span>
              </span>
              <span className="shrink-0 font-serif text-xl font-semibold tabular-nums text-forest">{formatPrice(l.price, product.currency)}</span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={() => setStep("details")} className="inline-flex flex-1 items-center justify-center rounded-full bg-forest px-7 py-4 text-sm font-semibold text-ivory transition-colors hover:bg-emerald sm:flex-none">
            Request purchase
          </button>
          <a href="#demo" className="inline-flex flex-1 items-center justify-center rounded-full border border-forest/25 px-7 py-4 text-sm font-semibold text-forest transition-colors hover:border-gold hover:text-gold-deep sm:flex-none">
            Request a Demo
          </a>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted">No payment is taken on this website. We confirm your order, then arrange payment and delivery with you directly.</p>
      </fieldset>

      {step === "details" ? (
        <form onSubmit={onSubmit} noValidate className="relative space-y-5 rounded-[1.25rem] border border-line bg-white p-6" aria-busy={isSubmitting}>
          <Honeypot {...register("website")} />
          <button type="button" onClick={() => setStep("choose")} className="inline-flex items-center gap-1.5 text-sm font-medium text-forest hover:text-gold-deep">
            <ArrowLeft aria-hidden className="h-4 w-4" /> Change licence
          </button>
          <p className="rounded-xl bg-ivory px-4 py-3 text-sm text-ink">
            {selected.name} · <strong>{formatPrice(selected.price, product.currency)}</strong>
          </p>
          <Field label="Full name" required error={errors.customer?.name?.message}>
            {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} autoComplete="name" {...register("customer.name")} />}
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Email" required error={errors.customer?.email?.message}>
              {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} type="email" autoComplete="email" {...register("customer.email")} />}
            </Field>
            <Field label="Phone / WhatsApp" required error={errors.customer?.phone?.message}>
              {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} type="tel" autoComplete="tel" {...register("customer.phone")} />}
            </Field>
            <Field label="Company" error={errors.customer?.company?.message}>
              {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} autoComplete="organization" {...register("customer.company")} />}
            </Field>
            <Field label="Country" error={errors.customer?.country?.message}>
              {(p) => <Input id={p.id} invalid={p.invalid} describedBy={p.describedBy} autoComplete="country-name" {...register("customer.country")} />}
            </Field>
          </div>
          <Field label="Notes" error={errors.notes?.message}>
            {(p) => <Textarea id={p.id} invalid={p.invalid} describedBy={p.describedBy} rows={3} {...register("notes")} />}
          </Field>
          <Checkbox
            label="I agree that Goldenfalcone may use these details to process this request, and I have read the licence and usage conditions for this software."
            error={errors.consent?.message}
            {...register("consent")}
          />
          <FormError state={state} />
          <SubmitButton pending={isSubmitting} label="Send purchase request" />
        </form>
      ) : null}
    </div>
  );
}

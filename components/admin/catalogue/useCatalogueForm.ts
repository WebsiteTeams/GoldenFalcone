"use client";

import { useRouter } from "next/navigation";
import { useForm, type DefaultValues, type FieldValues, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AnyZodObject, z } from "zod";
import { adminRequest } from "@/lib/admin/client";
import { useToast } from "../ToastNotification";

type Options<S extends AnyZodObject> = {
  schema: S;
  /** Collection endpoint, e.g. /api/admin/spices */
  endpoint: string;
  /** Existing record id when editing. */
  id?: string;
  /** Where the editor lives, e.g. /admin/spices — new records redirect to `${base}/${id}`. */
  base: string;
  defaultValues: DefaultValues<z.input<S>>;
};

/** React Hook Form + Zod wiring shared by every catalogue editor, with server-side errors mapped back to fields. */
export function useCatalogueForm<S extends AnyZodObject>({ schema, endpoint, id, base, defaultValues }: Options<S>) {
  const router = useRouter();
  const toast = useToast();
  const form = useForm<z.input<S> & FieldValues, unknown, z.output<S>>({ resolver: zodResolver(schema), defaultValues });

  const onSubmit = form.handleSubmit(
    async (values) => {
      const result = await adminRequest<{ _id: string }>(id ? `${endpoint}/${id}` : endpoint, {
        method: id ? "PATCH" : "POST",
        body: values,
      });
      if (!result.ok) {
        for (const [field, message] of Object.entries(result.errors ?? {})) {
          form.setError(field as Path<z.input<S> & FieldValues>, { type: "server", message });
        }
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      if (!id && result.data?._id) router.replace(`${base}/${result.data._id}`);
      else {
        form.reset(values as unknown as z.input<S>);
        router.refresh();
      }
    },
    () => toast.error("Please fix the highlighted fields."),
  );

  return { form, onSubmit };
}

import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { SubmitState } from "./FormFeedback";

type ApiResponse = { ok: boolean; message: string; errors?: Record<string, string> };

/** POST to an API route and map server-side field errors back onto the form. */
export async function submitToApi<T extends FieldValues>(
  url: string,
  body: BodyInit,
  setError: UseFormSetError<T>,
  headers?: HeadersInit,
): Promise<SubmitState> {
  try {
    const res = await fetch(url, { method: "POST", body, headers });
    const data = (await res.json().catch(() => null)) as ApiResponse | null;

    if (res.ok && data?.ok) return { status: "success", message: data.message };

    if (data?.errors) {
      for (const [field, message] of Object.entries(data.errors)) {
        setError(field as Path<T>, { type: "server", message });
      }
    }
    return { status: "error", message: data?.message ?? "We couldn't send your submission. Please try again." };
  } catch {
    return { status: "error", message: "Network error — please check your connection and try again." };
  }
}

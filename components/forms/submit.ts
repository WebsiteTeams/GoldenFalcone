import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { SubmitState } from "./FormFeedback";

type ApiResponse = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
  referenceNumber?: string;
  duplicate?: boolean;
  data?: { referenceNumber?: string };
};

type SubmitOptions = {
  headers?: HeadersInit;
  /** Receives a 0–100 upload percentage when the body is multipart form data. */
  onProgress?: (percent: number) => void;
};

function toState(data: ApiResponse | null, ok: boolean): SubmitState {
  if (ok && data?.ok) {
    return {
      status: "success",
      message: data.message,
      reference: data.referenceNumber ?? data.data?.referenceNumber,
    };
  }
  return {
    status: "error",
    message: data?.message ?? "We couldn't send your submission. Please try again.",
  };
}

function applyFieldErrors<T extends FieldValues>(
  data: ApiResponse | null,
  setError: UseFormSetError<T>,
) {
  if (!data?.errors) return;
  for (const [field, message] of Object.entries(data.errors)) {
    setError(field as Path<T>, { type: "server", message });
  }
}

/** POST to an API route and map server-side field errors back onto the form. */
export async function submitToApi<T extends FieldValues>(
  url: string,
  body: BodyInit,
  setError: UseFormSetError<T>,
  options: SubmitOptions = {},
): Promise<SubmitState> {
  // XMLHttpRequest is used for multipart uploads so the candidate can see real progress.
  if (typeof FormData !== "undefined" && body instanceof FormData && options.onProgress) {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.withCredentials = true;
      for (const [key, value] of new Headers(options.headers).entries()) xhr.setRequestHeader(key, value);

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        options.onProgress?.(Math.min(99, Math.round((event.loaded / event.total) * 100)));
      };
      xhr.onload = () => {
        let data: ApiResponse | null = null;
        try {
          data = JSON.parse(xhr.responseText) as ApiResponse;
        } catch {
          data = null;
        }
        options.onProgress?.(100);
        applyFieldErrors(data, setError);
        resolve(toState(data, xhr.status >= 200 && xhr.status < 300));
      };
      xhr.onerror = () => {
        options.onProgress?.(0);
        resolve({ status: "error", message: "Network error — please check your connection and try again." });
      };
      xhr.send(body);
    });
  }

  try {
    const res = await fetch(url, { method: "POST", body, headers: options.headers });
    const data = (await res.json().catch(() => null)) as ApiResponse | null;
    applyFieldErrors(data, setError);
    return toState(data, res.ok);
  } catch {
    return { status: "error", message: "Network error — please check your connection and try again." };
  }
}

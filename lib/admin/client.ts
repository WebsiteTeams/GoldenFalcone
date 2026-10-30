/** Browser-side helper for admin API calls. Always resolves (never throws) with a uniform result. */
export type AdminResult<T = unknown> = { ok: boolean; message: string; errors?: Record<string, string>; data?: T; status: number };

export async function adminRequest<T = unknown>(
  url: string,
  options: { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown; form?: FormData } = {},
): Promise<AdminResult<T>> {
  try {
    const res = await fetch(url, {
      method: options.method ?? (options.body || options.form ? "POST" : "GET"),
      headers: options.body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: options.form ?? (options.body !== undefined ? JSON.stringify(options.body) : undefined),
      credentials: "same-origin",
    });
    const json = (await res.json().catch(() => null)) as Omit<AdminResult<T>, "status"> | null;
    if (res.status === 401 && typeof window !== "undefined") {
      window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
    return {
      ok: res.ok && Boolean(json?.ok),
      message: json?.message ?? (res.ok ? "Done." : "Something went wrong. Please try again."),
      errors: json?.errors,
      data: json?.data,
      status: res.status,
    };
  } catch {
    return { ok: false, message: "Network error — check your connection and try again.", status: 0 };
  }
}

export const formatDate = (value?: string | Date, withTime = false) =>
  value
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
      }).format(new Date(value))
    : "—";

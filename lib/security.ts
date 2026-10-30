import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { DatabaseNotConfiguredError } from "./mongodb";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/**
 * Fixed-window in-memory rate limiter.
 * Good enough for a single server or as a first line of defence; on multi-instance
 * serverless hosting, back this with a shared store (e.g. Redis/Upstash) for strict limits.
 */
export function rateLimit(key: string, limit = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 5000) {
      for (const [k, b] of buckets) if (b.resetAt < now) buckets.delete(k);
    }
    return { ok: true, retryAfter: 0 };
  }
  bucket.count += 1;
  return { ok: bucket.count <= limit, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

/** Reject submissions from other origins (basic CSRF protection for public JSON endpoints). */
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser clients; still rate limited and validated
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Bots tend to fill the honeypot or submit instantly after page load. */
export function looksLikeSpam(data: { website?: string; startedAt: number }) {
  const elapsed = Date.now() - data.startedAt;
  return Boolean(data.website) || elapsed < 2500 || elapsed > 1000 * 60 * 60 * 24;
}

export function json(status: number, body: { ok: boolean; message: string; errors?: Record<string, string> }) {
  return NextResponse.json(body, { status });
}

export function zodErrors(error: ZodError) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

/** Shared guard for public form endpoints. Returns a response to short-circuit, or null to continue. */
export function guardRequest(request: Request, scope: string) {
  if (!isSameOrigin(request)) return json(403, { ok: false, message: "Request not allowed." });
  const limit = rateLimit(`${scope}:${clientIp(request)}`);
  if (!limit.ok) {
    const res = json(429, { ok: false, message: "Too many submissions. Please try again a little later." });
    res.headers.set("Retry-After", String(limit.retryAfter));
    return res;
  }
  return null;
}

export function serverError(error: unknown, scope: string) {
  if (error instanceof DatabaseNotConfiguredError) {
    console.error(`[${scope}] ${error.message}`);
    return json(503, { ok: false, message: "Our enquiry system is temporarily unavailable. Please try again later." });
  }
  console.error(`[${scope}] unexpected error`, error);
  return json(500, { ok: false, message: "Something went wrong on our side. Please try again." });
}

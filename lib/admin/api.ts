import "server-only";
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import type { ZodError } from "zod";
import { getCurrentAdmin, type CurrentAdmin } from "@/lib/auth/session";
import { clientIp, serverError, zodErrors } from "@/lib/security";
import type { AdminRole } from "./constants";

export type ApiBody = { ok: boolean; message?: string; errors?: Record<string, string>; data?: unknown };

export const respond = (status: number, body: ApiBody) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export const invalid = (error: ZodError) =>
  respond(422, { ok: false, message: "Please check the highlighted fields.", errors: zodErrors(error) });

export const notFound = (what = "Record") => respond(404, { ok: false, message: `${what} not found.` });

export const isObjectId = (id: string) => Types.ObjectId.isValid(id) && /^[a-f0-9]{24}$/i.test(id);

export const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Converts lean Mongoose results (ObjectIds, Dates) into plain JSON-safe values. */
export const toPlain = <T>(value: unknown): T => JSON.parse(JSON.stringify(value)) as T;

/** Admin mutations must come from this site: the Origin header is required and must match. */
function sameOriginStrict(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

type Authorized = { admin: CurrentAdmin; response?: never } | { admin?: never; response: NextResponse };

/** Authenticates (and optionally role-checks) every admin API request on the server. */
export async function authorize(request: Request, role?: AdminRole): Promise<Authorized> {
  if (request.method !== "GET" && request.method !== "HEAD" && !sameOriginStrict(request)) {
    return { response: respond(403, { ok: false, message: "Request not allowed." }) };
  }
  let admin: CurrentAdmin | null;
  try {
    admin = await getCurrentAdmin();
  } catch (error) {
    return { response: serverError(error, "admin:auth") };
  }
  if (!admin) return { response: respond(401, { ok: false, message: "Your session has expired. Please sign in again." }) };
  if (role === "admin" && admin.role !== "admin") {
    return { response: respond(403, { ok: false, message: "You do not have permission to do that." }) };
  }
  return { admin };
}

export async function readJson(request: Request): Promise<{ body: unknown } | { response: NextResponse }> {
  try {
    return { body: await request.json() };
  } catch {
    return { response: respond(400, { ok: false, message: "Invalid request body." }) };
  }
}

/** Maps duplicate-key errors to a friendly field error; everything else becomes a safe 500. */
export function dbError(error: unknown, scope: string) {
  if (typeof error === "object" && error && "code" in error && (error as { code: number }).code === 11000) {
    const field = Object.keys((error as { keyPattern?: Record<string, number> }).keyPattern ?? { slug: 1 })[0];
    return respond(409, { ok: false, message: `That ${field} is already in use.`, errors: { [field]: `This ${field} is already in use` } });
  }
  return serverError(error, scope);
}

export const requestMeta = (request: Request) => ({
  ip: clientIp(request),
  userAgent: request.headers.get("user-agent") ?? undefined,
});

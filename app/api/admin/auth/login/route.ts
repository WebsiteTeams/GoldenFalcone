import { logActivity } from "@/lib/admin/activity";
import { invalid, readJson, requestMeta, respond } from "@/lib/admin/api";
import { loginSchema } from "@/lib/admin/schemas";
import { dummyPasswordHash, verifyPassword } from "@/lib/auth/password";
import { clearLoginFailures, isLoginBlocked, recordLoginFailure } from "@/lib/auth/rate-limit";
import { AuthNotConfiguredError, createSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import { isSameOrigin, serverError } from "@/lib/security";
import { Admin } from "@/models/Admin";

export const runtime = "nodejs";

const GENERIC_FAILURE = "Invalid email or password.";

export async function POST(request: Request) {
  if (!isSameOrigin(request) || !request.headers.get("origin")) {
    return respond(403, { ok: false, message: "Request not allowed." });
  }
  const json = await readJson(request);
  if ("response" in json) return json.response;
  const parsed = loginSchema.safeParse(json.body);
  if (!parsed.success) return invalid(parsed.error);
  const { email, password, remember } = parsed.data;

  const meta = requestMeta(request);
  // Per-account and per-IP limits: 5 failures per account, 20 per IP, within 15 minutes.
  const limits = [
    { key: `email:${email}`, limit: 5 },
    { key: `ip:${meta.ip}`, limit: 20 },
  ];

  try {
    await connectToDatabase();
    if (await isLoginBlocked(limits)) {
      return respond(429, { ok: false, message: "Too many sign-in attempts. Please wait 15 minutes and try again." });
    }

    const admin = await Admin.findOne({ email, active: true }).select("+passwordHash").lean();
    // Always run a hash comparison so timing does not reveal whether the account exists.
    const valid = await verifyPassword(password, admin?.passwordHash ?? (await dummyPasswordHash()));
    if (!admin || !valid) {
      await recordLoginFailure(limits);
      return respond(401, { ok: false, message: GENERIC_FAILURE });
    }

    await clearLoginFailures(`email:${email}`);
    await createSession(String(admin._id), remember, meta);
    await Admin.updateOne({ _id: admin._id }, { lastLoginAt: new Date() });
    await logActivity({ id: String(admin._id), name: admin.name }, "signed in", "session");
    return respond(200, { ok: true, message: "Signed in." });
  } catch (error) {
    if (error instanceof AuthNotConfiguredError) {
      console.error(`[admin:login] ${error.message}`);
      return respond(503, { ok: false, message: "Admin sign-in is not configured yet. Please contact the site owner." });
    }
    return serverError(error, "admin:login");
  }
}

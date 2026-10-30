import { logActivity } from "@/lib/admin/activity";
import { authorize, invalid, readJson, respond } from "@/lib/admin/api";
import { passwordChangeSchema } from "@/lib/admin/schemas";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { isLoginBlocked, recordLoginFailure } from "@/lib/auth/rate-limit";
import { revokeOtherSessions } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import { serverError } from "@/lib/security";
import { Admin } from "@/models/Admin";

export const runtime = "nodejs";

/** Changes the signed-in admin's password and signs out every other session. */
export async function POST(request: Request) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;
  const json = await readJson(request);
  if ("response" in json) return json.response;
  const parsed = passwordChangeSchema.safeParse(json.body);
  if (!parsed.success) return invalid(parsed.error);

  const limit = [{ key: `password:${auth.admin.id}`, limit: 5 }];
  try {
    await connectToDatabase();
    if (await isLoginBlocked(limit)) {
      return respond(429, { ok: false, message: "Too many attempts. Please wait 15 minutes and try again." });
    }
    const admin = await Admin.findById(auth.admin.id).select("+passwordHash");
    if (!admin || !(await verifyPassword(parsed.data.currentPassword, admin.passwordHash))) {
      await recordLoginFailure(limit);
      return respond(422, {
        ok: false,
        message: "Your current password is incorrect.",
        errors: { currentPassword: "Your current password is incorrect" },
      });
    }

    admin.passwordHash = await hashPassword(parsed.data.newPassword);
    admin.passwordChangedAt = new Date();
    await admin.save();
    await revokeOtherSessions(auth.admin.id, auth.admin.sessionId);
    await logActivity(auth.admin, "changed", "password");
    return respond(200, { ok: true, message: "Password changed. Other devices have been signed out." });
  } catch (error) {
    return serverError(error, "admin:password");
  }
}

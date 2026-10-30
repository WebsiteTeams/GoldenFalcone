import { respond } from "@/lib/admin/api";
import { destroySession } from "@/lib/auth/session";
import { isSameOrigin } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return respond(403, { ok: false, message: "Request not allowed." });
  await destroySession();
  return respond(200, { ok: true, message: "Signed out." });
}

import { authorize, respond } from "@/lib/admin/api";
import { getDashboardStats } from "@/lib/admin/dashboard";
import { serverError } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;
  try {
    return respond(200, { ok: true, data: await getDashboardStats() });
  } catch (error) {
    return serverError(error, "admin:dashboard");
  }
}

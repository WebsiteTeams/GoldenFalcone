import { logActivity } from "@/lib/admin/activity";
import { authorize, invalid, readJson, respond } from "@/lib/admin/api";
import { profileSchema } from "@/lib/admin/schemas";
import { connectToDatabase } from "@/lib/mongodb";
import { serverError } from "@/lib/security";
import { Admin } from "@/models/Admin";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;
  const json = await readJson(request);
  if ("response" in json) return json.response;
  const parsed = profileSchema.safeParse(json.body);
  if (!parsed.success) return invalid(parsed.error);

  try {
    await connectToDatabase();
    await Admin.updateOne({ _id: auth.admin.id }, { name: parsed.data.name });
    await logActivity({ ...auth.admin, name: parsed.data.name }, "updated", "profile");
    return respond(200, { ok: true, message: "Profile updated." });
  } catch (error) {
    return serverError(error, "admin:profile");
  }
}

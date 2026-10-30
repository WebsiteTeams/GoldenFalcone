import { revalidatePath, revalidateTag } from "next/cache";
import { logActivity } from "@/lib/admin/activity";
import { authorize, invalid, readJson, respond } from "@/lib/admin/api";
import { getStoredSettings } from "@/lib/admin/content";
import { settingsSchema } from "@/lib/admin/schemas";
import { deleteMedia } from "@/lib/media";
import { connectToDatabase } from "@/lib/mongodb";
import { serverError } from "@/lib/security";
import { SiteSettings } from "@/models/SiteSettings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;
  try {
    return respond(200, { ok: true, data: await getStoredSettings() });
  } catch (error) {
    return serverError(error, "admin:settings:get");
  }
}

/** Business settings are sensitive, so only full administrators may change them. */
export async function PUT(request: Request) {
  const auth = await authorize(request, "admin");
  if (auth.response) return auth.response;
  const json = await readJson(request);
  if ("response" in json) return json.response;
  const parsed = settingsSchema.safeParse(json.body);
  if (!parsed.success) return invalid(parsed.error);

  try {
    const before = await getStoredSettings();
    await connectToDatabase();
    await SiteSettings.updateOne({ key: "main" }, { $set: { values: parsed.data } }, { upsert: true });
    if (before.logo && before.logo.mediaId !== parsed.data.logo?.mediaId) await deleteMedia([before.logo.mediaId]);

    revalidateTag("site-settings");
    revalidatePath("/", "layout");
    await logActivity(auth.admin, "updated", "site settings");
    return respond(200, { ok: true, message: "Settings saved.", data: parsed.data });
  } catch (error) {
    return serverError(error, "admin:settings:save");
  }
}

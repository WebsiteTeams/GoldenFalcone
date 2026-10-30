import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { logActivity } from "@/lib/admin/activity";
import { authorize, invalid, readJson, respond } from "@/lib/admin/api";
import { getContentState } from "@/lib/admin/content";
import { siteContentSchema } from "@/lib/admin/schemas";
import { connectToDatabase } from "@/lib/mongodb";
import { serverError } from "@/lib/security";
import { SiteContent } from "@/models/SiteContent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;
  try {
    return respond(200, { ok: true, data: await getContentState() });
  } catch (error) {
    return serverError(error, "admin:pages:get");
  }
}

/** Saves the working draft. The live site is unchanged until it is published. */
export async function PUT(request: Request) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;
  const json = await readJson(request);
  if ("response" in json) return json.response;
  const parsed = siteContentSchema.safeParse(json.body);
  if (!parsed.success) return invalid(parsed.error);

  try {
    await connectToDatabase();
    await SiteContent.updateOne({ key: "main" }, { $set: { draft: parsed.data, draftUpdatedAt: new Date() } }, { upsert: true });
    await logActivity(auth.admin, "saved a draft of", "website content");
    return respond(200, { ok: true, message: "Draft saved.", data: await getContentState() });
  } catch (error) {
    return serverError(error, "admin:pages:save");
  }
}

const actionSchema = z.object({ action: z.enum(["publish", "discard"]) });

/** Publishes the draft to the live site, or discards it. */
export async function POST(request: Request) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;
  const json = await readJson(request);
  if ("response" in json) return json.response;
  const parsed = actionSchema.safeParse(json.body);
  if (!parsed.success) return invalid(parsed.error);

  try {
    const state = await getContentState();
    if (parsed.data.action === "discard") {
      await SiteContent.updateOne({ key: "main" }, { $set: { draft: state.published, draftUpdatedAt: state.publishedAt ?? null } }, { upsert: true });
      await logActivity(auth.admin, "discarded the draft of", "website content");
      return respond(200, { ok: true, message: "Draft discarded.", data: await getContentState() });
    }

    // Re-validate at publish time so only well-formed content ever goes live.
    const draft = siteContentSchema.safeParse(state.draft);
    if (!draft.success) return invalid(draft.error);
    const now = new Date();
    await SiteContent.updateOne(
      { key: "main" },
      { $set: { published: draft.data, draft: draft.data, publishedAt: now, draftUpdatedAt: now, publishedBy: auth.admin.name } },
      { upsert: true },
    );
    revalidateTag("site-content");
    revalidatePath("/", "layout");
    await logActivity(auth.admin, "published", "website content");
    return respond(200, { ok: true, message: "Changes published to the live site.", data: await getContentState() });
  } catch (error) {
    return serverError(error, "admin:pages:publish");
  }
}

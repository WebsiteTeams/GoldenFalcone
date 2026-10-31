import { logActivity } from "@/lib/admin/activity";
import { authorize, dbError, invalid, isObjectId, notFound, readJson, respond } from "@/lib/admin/api";
import { refreshPublic } from "@/lib/admin/handlers";
import { resources } from "@/lib/admin/resources";
import { featuredSettingsSchema, spiceFeaturedErrors } from "@/lib/admin/schemas";
import { connectToDatabase } from "@/lib/mongodb";
import { SpiceProduct } from "@/models/SpiceProduct";

export const runtime = "nodejs";

/** Updates only a product's featured settings, leaving the rest of the record untouched. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;
  const { id } = await params;
  if (!isObjectId(id)) return notFound("Spice product");
  const json = await readJson(request);
  if ("response" in json) return json.response;
  const parsed = featuredSettingsSchema.safeParse(json.body);
  if (!parsed.success) return invalid(parsed.error);

  try {
    await connectToDatabase();
    const before = await SpiceProduct.findById(id).lean();
    if (!before) return notFound("Spice product");

    const changes = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined));
    const errors = spiceFeaturedErrors({ ...before, ...changes });
    // Drafts can stay featured while being prepared, but only a live product can be newly added from this page.
    if (parsed.data.isFeatured && !before.isFeatured && before.status !== "published") {
      return respond(422, { ok: false, message: "Publish this product before featuring it.", errors: { status: "Publish this product before featuring it" } });
    }
    if (errors) return respond(422, { ok: false, message: Object.values(errors)[0], errors });

    await SpiceProduct.updateOne({ _id: id }, { $set: changes }, { runValidators: true });
    refreshPublic(resources.spices);
    await logActivity(auth.admin, parsed.data.isFeatured ? "updated featured settings of" : "removed from featured", resources.spices.entity, id, before.name);
    return respond(200, { ok: true, message: parsed.data.isFeatured ? "Featured settings saved." : "Removed from featured products." });
  } catch (error) {
    return dbError(error, "admin:spices:featured");
  }
}

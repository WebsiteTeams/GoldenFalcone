import { authorize, respond } from "@/lib/admin/api";
import { mediaUrl, saveImage } from "@/lib/media";
import { serverError } from "@/lib/security";
import { UploadError } from "@/lib/storage";

export const runtime = "nodejs";

/** Uploads one image (multipart field "file"). Returns its id; records reference it once saved. */
export async function POST(request: Request) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return respond(400, { ok: false, message: "Invalid upload." });
  }
  const file = form.get("file");
  if (!(file instanceof File)) return respond(422, { ok: false, message: "Choose an image to upload." });

  try {
    const mediaId = await saveImage(file, auth.admin.id);
    return respond(201, { ok: true, message: "Image uploaded.", data: { mediaId, url: mediaUrl(mediaId) } });
  } catch (error) {
    if (error instanceof UploadError) return respond(422, { ok: false, message: error.message });
    return serverError(error, "admin:media");
  }
}

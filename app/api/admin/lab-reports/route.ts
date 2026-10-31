import { authorize, respond } from "@/lib/admin/api";
import { saveLabReport } from "@/lib/media";
import { serverError } from "@/lib/security";
import { UploadError } from "@/lib/storage";

export const runtime = "nodejs";

/** Uploads one lab report (multipart field "file"). A variant references it once the product is saved. */
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
  if (!(file instanceof File)) return respond(422, { ok: false, message: "Choose a lab report to upload." });

  try {
    const report = await saveLabReport(file, auth.admin.id);
    return respond(201, { ok: true, message: "Lab report uploaded.", data: report });
  } catch (error) {
    if (error instanceof UploadError) return respond(422, { ok: false, message: error.message });
    return serverError(error, "admin:lab-report");
  }
}

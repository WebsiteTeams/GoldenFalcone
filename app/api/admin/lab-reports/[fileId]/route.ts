import { authorize, isObjectId, notFound } from "@/lib/admin/api";
import { labReportResponse } from "@/lib/media";
import { serverError } from "@/lib/security";

export const runtime = "nodejs";

/** Lets a signed-in admin check a report while editing, including on drafts and inactive variants. */
export async function GET(request: Request, { params }: { params: Promise<{ fileId: string }> }) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;
  const { fileId } = await params;
  if (!isObjectId(fileId)) return notFound("Lab report");
  try {
    return await labReportResponse(fileId, { fileName: "lab-report" }, false, "private, no-store");
  } catch (error) {
    return serverError(error, "admin:lab-report:get");
  }
}

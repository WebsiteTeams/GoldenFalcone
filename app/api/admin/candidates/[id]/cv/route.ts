import { logActivity } from "@/lib/admin/activity";
import { authorize, isObjectId, notFound } from "@/lib/admin/api";
import { connectToDatabase } from "@/lib/mongodb";
import { serverError } from "@/lib/security";
import { readCv } from "@/lib/storage";
import { CandidateApplication } from "@/models/CandidateApplication";

export const runtime = "nodejs";

/** Streams a candidate's CV to a signed-in admin. CVs are never publicly addressable. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;
  const { id } = await params;
  if (!isObjectId(id)) return notFound("CV");

  try {
    await connectToDatabase();
    const candidate = await CandidateApplication.findById(id).select("fullName cv").lean();
    if (!candidate?.cv?.storageKey) return notFound("CV");
    const file = await readCv(candidate.cv.storageKey);
    if (!file) return notFound("CV file");

    await logActivity(auth.admin, "downloaded the CV of", "candidate application", id, candidate.fullName);
    const filename = (candidate.cv.originalName || "cv").replace(/[^\w.\- ]/g, "_");
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": candidate.cv.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return serverError(error, "admin:cv");
  }
}

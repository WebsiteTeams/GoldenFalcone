import { logActivity } from "@/lib/admin/activity";
import { authorize, isObjectId, notFound } from "@/lib/admin/api";
import { connectToDatabase } from "@/lib/mongodb";
import { serverError } from "@/lib/security";
import { readCv } from "@/lib/storage";
import { CandidateApplication } from "@/models/CandidateApplication";

export const runtime = "nodejs";

type StoredFileDoc = { storageKey?: string; originalName?: string; mimeType?: string; size?: number };

/** Streams a securely stored candidate file to a signed-in admin. Files are never publicly addressable. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string; key: string }> }) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;
  const { id, key: encodedKey } = await params;
  if (!isObjectId(id)) return notFound("File");

  const fileKey = decodeURIComponent(encodedKey);

  try {
    await connectToDatabase();
    // Fetch the candidate with all hidden document fields
    const candidate = await CandidateApplication.findById(id)
      .select("fullName cv profilePhoto certificates trainingCertificates portfolioImages")
      .lean<{
        fullName: string;
        cv?: StoredFileDoc;
        profilePhoto?: StoredFileDoc;
        certificates?: StoredFileDoc[];
        trainingCertificates?: StoredFileDoc[];
        portfolioImages?: StoredFileDoc[];
      }>();

    if (!candidate) return notFound("Candidate");

    // Search across all file fields for a matching storageKey
    const allFiles: StoredFileDoc[] = [
      ...(candidate.cv?.storageKey ? [candidate.cv] : []),
      ...(candidate.profilePhoto?.storageKey ? [candidate.profilePhoto] : []),
      ...(candidate.certificates ?? []),
      ...(candidate.trainingCertificates ?? []),
      ...(candidate.portfolioImages ?? []),
    ];

    const fileDoc = allFiles.find((f) => f.storageKey === fileKey);
    if (!fileDoc?.storageKey) return notFound("File");

    const buffer = await readCv(fileDoc.storageKey);
    if (!buffer) return notFound("File — it may have been deleted from storage");

    const filename = (fileDoc.originalName || "document").replace(/[^\w.\- ]/g, "_");
    await logActivity(auth.admin, "downloaded a file from", "candidate application", id, candidate.fullName);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": fileDoc.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return serverError(error, "admin:file-download");
  }
}


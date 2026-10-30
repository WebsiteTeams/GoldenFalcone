import { logActivity } from "@/lib/admin/activity";
import { authorize, respond } from "@/lib/admin/api";
import { getSettings } from "@/lib/cms";
import { connectToDatabase } from "@/lib/mongodb";
import { serverError } from "@/lib/security";
import { deleteCv, deleteFiles } from "@/lib/storage";
import { CandidateApplication } from "@/models/CandidateApplication";
import { StaffingConnection } from "@/models/StaffingConnection";

export const runtime = "nodejs";

/** Deletes candidate applications (and all their documents) older than the retention period set in Settings. */
export async function POST(request: Request) {
  const auth = await authorize(request, "admin");
  if (auth.response) return auth.response;

  try {
    const { retentionMonths } = await getSettings();
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - retentionMonths);

    await connectToDatabase();
    const expired = await CandidateApplication.find({ createdAt: { $lt: cutoff } })
      .select("cv.storageKey profilePhoto.storageKey certificates.storageKey trainingCertificates.storageKey portfolioImages.storageKey")
      .lean<
        {
          _id: unknown;
          cv?: { storageKey?: string };
          profilePhoto?: { storageKey?: string };
          certificates?: { storageKey?: string }[];
          trainingCertificates?: { storageKey?: string }[];
          portfolioImages?: { storageKey?: string }[];
        }[]
      >();

    const ids = expired.map((c) => c._id);
    await Promise.all(
      expired.map(async (candidate) => {
        if (candidate.cv?.storageKey) await deleteCv(candidate.cv.storageKey);
        const keys = [
          candidate.profilePhoto?.storageKey,
          ...(candidate.certificates ?? []).map((f) => f.storageKey),
          ...(candidate.trainingCertificates ?? []).map((f) => f.storageKey),
          ...(candidate.portfolioImages ?? []).map((f) => f.storageKey),
        ].filter(Boolean) as string[];
        if (keys.length) await deleteFiles(keys);
      }),
    );

    await StaffingConnection.deleteMany({ candidateId: { $in: ids } });
    const { deletedCount } = await CandidateApplication.deleteMany({ _id: { $in: ids } });

    await logActivity(auth.admin, "purged", "candidate applications", undefined, `${deletedCount} older than ${retentionMonths} months`);
    return respond(200, {
      ok: true,
      message: deletedCount ? `Deleted ${deletedCount} application${deletedCount === 1 ? "" : "s"} older than ${retentionMonths} months.` : "No applications are past the retention period.",
    });
  } catch (error) {
    return serverError(error, "admin:candidates:purge");
  }
}

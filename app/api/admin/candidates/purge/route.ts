import { logActivity } from "@/lib/admin/activity";
import { authorize, respond } from "@/lib/admin/api";
import { getSettings } from "@/lib/cms";
import { connectToDatabase } from "@/lib/mongodb";
import { serverError } from "@/lib/security";
import { deleteCv } from "@/lib/storage";
import { CandidateApplication } from "@/models/CandidateApplication";

export const runtime = "nodejs";

/** Deletes candidate applications (and their CVs) older than the retention period set in Settings. */
export async function POST(request: Request) {
  const auth = await authorize(request, "admin");
  if (auth.response) return auth.response;

  try {
    const { retentionMonths } = await getSettings();
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - retentionMonths);

    await connectToDatabase();
    const expired = await CandidateApplication.find({ createdAt: { $lt: cutoff } }).select("cv.storageKey").lean();
    await Promise.all(expired.map((c) => (c.cv?.storageKey ? deleteCv(c.cv.storageKey) : undefined)));
    const { deletedCount } = await CandidateApplication.deleteMany({ _id: { $in: expired.map((c) => c._id) } });

    await logActivity(auth.admin, "purged", "candidate applications", undefined, `${deletedCount} older than ${retentionMonths} months`);
    return respond(200, {
      ok: true,
      message: deletedCount ? `Deleted ${deletedCount} application${deletedCount === 1 ? "" : "s"} older than ${retentionMonths} months.` : "No applications are past the retention period.",
    });
  } catch (error) {
    return serverError(error, "admin:candidates:purge");
  }
}

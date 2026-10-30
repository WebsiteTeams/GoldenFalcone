import { authorize, dbError, respond } from "@/lib/admin/api";
import { connectToDatabase } from "@/lib/mongodb";
import { CandidateApplication } from "@/models/CandidateApplication";
import { StaffingRequest } from "@/models/StaffingRequest";
import { CandidateMatch } from "@/models/CandidateMatch";
import { toPlain } from "@/lib/admin/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/matching?staffingId=<id>
 * Returns matching candidates for a given staffing request, scored by overlap
 * in job role, skills, location, experience, employment type and salary.
 */
export async function GET(request: Request) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const staffingId = searchParams.get("staffingId");

  if (!staffingId) {
    return respond(400, { ok: false, message: "staffingId query parameter is required." });
  }

  try {
    await connectToDatabase();

    const req = await StaffingRequest.findById(staffingId).lean();
    if (!req) return respond(404, { ok: false, message: "Staffing request not found." });

    // Build a flexible filter: required role is primary, everything else is used for scoring
    const candidates = await CandidateApplication.find({
      professionalCategory: req.professionalCategory,
      status: { $nin: ["not-selected", "inactive"] },
    })
      .select("fullName email phone location preferredWorkLocation professionalCategory additionalSkills customSkills experience employmentPreference expectedSalary availability status createdAt")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Simple scoring for relevance
    const reqSkills = (req.requiredSkills || "").toLowerCase().split(/[,;]+/).map((s: string) => s.trim()).filter(Boolean);
    const reqLocation = (req.location || "").toLowerCase();
    const reqEmployment = (req.employmentType || "").toLowerCase();

    const scored = candidates.map((c: Record<string, unknown>) => {
      let score = 0;

      // Location match
      const cLocation = ((c.location as string) || "").toLowerCase();
      const cPrefLocation = ((c.preferredWorkLocation as string) || "").toLowerCase();
      if (cLocation.includes(reqLocation) || reqLocation.includes(cLocation)) score += 3;
      if (cPrefLocation.includes(reqLocation) || reqLocation.includes(cPrefLocation)) score += 2;

      // Skills match
      const cSkills = [
        ...((c.additionalSkills as string[]) || []),
        ...((c.customSkills as string) || "").split(",").map((s: string) => s.trim()),
      ].map((s) => s.toLowerCase()).filter(Boolean);

      for (const rs of reqSkills) {
        if (cSkills.some((cs) => cs.includes(rs) || rs.includes(cs))) score += 2;
      }

      // Employment type match
      const cEmployment = ((c.employmentPreference as string) || "").toLowerCase();
      if (cEmployment && reqEmployment && cEmployment === reqEmployment) score += 2;

      return { ...toPlain<Record<string, unknown>>(c), matchScore: score } as Record<string, unknown> & { _id: unknown; matchScore: number };
    });

    // Sort by score descending
    scored.sort((a, b) => b.matchScore - a.matchScore);

    // Get existing matches for this staffing request
    const existingMatches = await CandidateMatch.find({ staffingRequestId: staffingId })
      .select("candidateId applicationStatus")
      .lean();

    const matchMap = new Map(existingMatches.map((m: Record<string, unknown>) => [String(m.candidateId), m.applicationStatus]));

    const results = scored.map((c: Record<string, unknown> & { _id: unknown; matchScore: number }) => ({
      ...c,
      matchStatus: matchMap.get(String(c._id)) || null,
    }));

    return respond(200, {
      ok: true,
      data: {
        staffingRequest: toPlain<Record<string, unknown>>(req),
        candidates: results,
      },
    });
  } catch (error) {
    return dbError(error, "admin:matching:list");
  }
}

/**
 * POST /api/admin/matching
 * Create or update a candidate match for a staffing request.
 */
export async function POST(request: Request) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;

  let body: { candidateId: string; staffingRequestId: string; matchNotes?: string; applicationStatus?: string };
  try {
    body = await request.json();
  } catch {
    return respond(400, { ok: false, message: "Invalid request body." });
  }

  if (!body.candidateId || !body.staffingRequestId) {
    return respond(400, { ok: false, message: "candidateId and staffingRequestId are required." });
  }

  try {
    await connectToDatabase();

    const match = await CandidateMatch.findOneAndUpdate(
      { candidateId: body.candidateId, staffingRequestId: body.staffingRequestId },
      {
        matchNotes: body.matchNotes || "",
        applicationStatus: body.applicationStatus || "suggested",
      },
      { upsert: true, new: true, runValidators: true },
    ).lean();

    return respond(200, { ok: true, message: "Match saved.", data: toPlain(match) });
  } catch (error) {
    return dbError(error, "admin:matching:save");
  }
}


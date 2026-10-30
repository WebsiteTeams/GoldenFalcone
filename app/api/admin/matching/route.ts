import { authorize, dbError, isObjectId, readJson, respond, toPlain } from "@/lib/admin/api";
import { connectionUpsertSchema, communicationSchema } from "@/lib/admin/schemas";
import { connectToDatabase } from "@/lib/mongodb";
import { CandidateApplication } from "@/models/CandidateApplication";
import { StaffingConnection } from "@/models/StaffingConnection";
import { StaffingRequest } from "@/models/StaffingRequest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any -- matching works across lean candidate and requirement documents */
type AnyDoc = Record<string, any>;

const splitList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === "string") return value.split(/[,;]+/).map((v) => v.trim()).filter(Boolean);
  return [];
};

/** Rough salary parsing so "₹30,000 / month" and "25000-35000" can be compared. */
const firstNumber = (value: unknown) => {
  const match = String(value ?? "").replace(/,/g, "").match(/\d{3,}/);
  return match ? Number(match[0]) : undefined;
};

const experienceYears = (value: unknown) => {
  const v = String(value ?? "").toLowerCase();
  if (!v) return undefined;
  if (v.includes("fresher")) return 0;
  if (v.includes("10")) return 10;
  if (v.includes("6")) return 6;
  if (v.includes("3")) return 3;
  if (v.includes("1")) return 1;
  if (v.includes("less")) return 0;
  return undefined;
};

type Score = { score: number; reasons: string[] };

/** Transparent, explainable scoring — no black-box matching. */
function scoreCandidate(req: AnyDoc, candidate: AnyDoc): Score {
  const reasons: string[] = [];
  let score = 0;

  if (candidate.professionalCategory === req.professionalCategory) {
    score += 30;
    reasons.push(`Works as a ${req.professionalCategory}`);
  } else if (candidate.professionalCategory && req.professionalCategory) {
    score += 6;
    reasons.push(`Adjacent discipline: ${candidate.professionalCategory}`);
  }

  const required = splitList(req.requiredSkills).map((s) => s.toLowerCase());
  const candidateSkills = [...splitList(candidate.additionalSkills), ...splitList(candidate.customSkills)].map((s) => s.toLowerCase());
  const overlaps = required.filter((skill) => candidateSkills.some((own) => own.includes(skill) || skill.includes(own)));
  if (required.length) {
    const ratio = overlaps.length / required.length;
    score += Math.round(ratio * 25);
    if (overlaps.length) {
      reasons.push(`${overlaps.length} of ${required.length} requested skills matched`);
    } else {
      reasons.push("No direct skill overlap recorded");
    }
  } else if (candidateSkills.length) {
    score += 10;
    reasons.push(`${candidateSkills.length} skills listed`);
  }

  const reqLocation = String(req.location ?? "").toLowerCase().trim();
  const currentLocation = String(candidate.location ?? "").toLowerCase();
  const preferredLocation = String(candidate.preferredWorkLocation ?? "").toLowerCase();
  if (reqLocation) {
    if (currentLocation && (currentLocation.includes(reqLocation) || reqLocation.includes(currentLocation))) {
      score += 18;
      reasons.push("Based in the hiring location");
    } else if (preferredLocation && (preferredLocation.includes(reqLocation) || reqLocation.includes(preferredLocation))) {
      score += 14;
      reasons.push("Prefers to work in this location");
    } else if (preferredLocation.includes("relocat") || preferredLocation.includes("flexible")) {
      score += 8;
      reasons.push("Open to relocating or flexible on location");
    }
  }

  const reqYears = experienceYears(req.experienceRequired);
  const candidateYears = experienceYears(candidate.experience);
  if (reqYears !== undefined && candidateYears !== undefined) {
    const gap = candidateYears - reqYears;
    if (gap >= 0 && gap <= 4) {
      score += 12;
      reasons.push("Experience meets the brief");
    } else if (gap > 4) {
      score += 8;
      reasons.push("More experienced than requested");
    } else if (gap >= -2) {
      score += 4;
      reasons.push("Slightly below the requested experience");
    }
  }

  const reqEmployment = String(req.employmentType ?? "").toLowerCase();
  const preference = String(candidate.employmentPreference ?? "").toLowerCase();
  if (reqEmployment && preference && reqEmployment === preference) {
    score += 6;
    reasons.push(`Prefers ${candidate.employmentPreference} work`);
  }

  const reqSalary = firstNumber(req.salaryRange);
  const expected = firstNumber(candidate.expectedSalary);
  if (reqSalary && expected) {
    if (expected <= reqSalary) {
      score += 5;
      reasons.push("Salary expectation sits within the stated range");
    } else if (expected <= reqSalary * 1.2) {
      score += 2;
      reasons.push("Salary expectation is slightly above the range");
    }
  }

  if (String(candidate.availability ?? "").toLowerCase().includes("immediate")) {
    score += 4;
    reasons.push("Available immediately");
  }

  return { score: Math.max(0, Math.min(100, score)), reasons: reasons.slice(0, 5) };
}

/**
 * GET /api/admin/matching?staffingId=<id>
 * Suggested candidates for one hiring requirement, each with its saved connection.
 *
 * GET /api/admin/matching?candidateId=<id>
 * Every salon relationship saved for one candidate.
 */
export async function GET(request: Request) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const staffingId = searchParams.get("staffingId");
  const candidateId = searchParams.get("candidateId");

  if (!staffingId && !candidateId) {
    return respond(400, { ok: false, message: "Provide a staffingId or candidateId." });
  }
  if ((staffingId && !isObjectId(staffingId)) || (candidateId && !isObjectId(candidateId))) {
    return respond(400, { ok: false, message: "Invalid id." });
  }

  try {
    await connectToDatabase();

    if (staffingId) {
      const req = await StaffingRequest.findById(staffingId).lean<AnyDoc>();
      if (!req) return respond(404, { ok: false, message: "Staffing request not found." });

      const connections = await StaffingConnection.find({ staffingRequestId: staffingId })
        .sort({ updatedAt: -1 })
        .lean<AnyDoc[]>();
      const connectionMap = new Map(connections.map((c) => [String(c.candidateId), c]));

      const candidateFilter: AnyDoc = { status: { $nin: ["not-selected", "inactive"] } };
      const roleMatched = await CandidateApplication.find({ ...candidateFilter, professionalCategory: req.professionalCategory })
        .select(
          "fullName email phone whatsapp location preferredWorkLocation professionalCategory additionalSkills customSkills experience employmentPreference expectedSalary availability status createdAt",
        )
        .limit(80)
        .lean<AnyDoc[]>();

      // Profiles already attached to this requirement but in another discipline are still shown.
      const attachedIds = [...connectionMap.keys()];
      const attached = attachedIds.length
        ? await CandidateApplication.find({ _id: { $in: attachedIds } })
            .select(
              "fullName email phone whatsapp location preferredWorkLocation professionalCategory additionalSkills customSkills experience employmentPreference expectedSalary availability status createdAt",
            )
            .lean<AnyDoc[]>()
        : [];

      const seen = new Set<string>();
      const candidates = [...roleMatched, ...attached]
        .filter((candidate) => {
          const key = String(candidate._id);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .map((candidate) => {
          const scored = scoreCandidate(req, candidate);
          const connection = connectionMap.get(String(candidate._id));
          return {
            ...toPlain<AnyDoc>(candidate),
            matchScore: scored.score,
            matchReasons: scored.reasons,
            connectionStatus: connection?.connectionStatus ?? "suggested",
            connected: Boolean(connection),
            connection: connection ? toPlain<AnyDoc>(connection) : null,
            createdAt: candidate.createdAt ? new Date(candidate.createdAt).toISOString() : undefined,
          };
        })
        .sort((a, b) => b.matchScore - a.matchScore);

      return respond(200, {
        ok: true,
        data: {
          staffingRequest: toPlain<AnyDoc>(req),
          candidates,
          connections: toPlain<AnyDoc[]>(connections),
        },
      });
    }

    const candidate = await CandidateApplication.findById(candidateId)
      .select(
        "fullName email phone whatsapp location preferredWorkLocation professionalCategory additionalSkills customSkills experience employmentPreference expectedSalary availability status createdAt",
      )
      .lean<AnyDoc>();
    if (!candidate) return respond(404, { ok: false, message: "Candidate not found." });

    const connections = await StaffingConnection.find({ candidateId })
      .populate({ path: "staffingRequestId", select: "salonName professionalCategory location quantity salaryRange employmentType status referenceNumber" })
      .sort({ updatedAt: -1 })
      .lean<AnyDoc[]>();

    return respond(200, {
      ok: true,
      data: {
        candidate: toPlain<AnyDoc>(candidate),
        connections: toPlain<AnyDoc[]>(connections),
      },
    });
  } catch (error) {
    return dbError(error, "admin:matching:get");
  }
}

/**
 * POST /api/admin/matching
 * Create or update a candidate ↔ requirement connection, or log a contact against it.
 * Body: connectionUpsertSchema, or { action: "log-contact", ... }.
 */
export async function POST(request: Request) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;

  const json = await readJson(request);
  if ("response" in json) return json.response;
  const body = json.body as AnyDoc;

  const isContact = body?.action === "log-contact";
  const parsed = isContact ? communicationSchema.safeParse(body) : connectionUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return respond(422, { ok: false, message: "Please check the highlighted fields.", errors: { form: parsed.error.issues[0]?.message ?? "Invalid data" } });
  }
  const data = parsed.data as AnyDoc;

  try {
    await connectToDatabase();

    const [candidate, staffingRequest] = await Promise.all([
      CandidateApplication.findById(data.candidateId)
        .select(
          "fullName professionalCategory status location preferredWorkLocation additionalSkills customSkills experience employmentPreference expectedSalary availability",
        )
        .lean<AnyDoc>(),
      StaffingRequest.findById(data.staffingRequestId)
        .select("salonName professionalCategory status location requiredSkills experienceRequired employmentType salaryRange")
        .lean<AnyDoc>(),
    ]);
    if (!candidate) return respond(404, { ok: false, message: "Candidate not found." });
    if (!staffingRequest) return respond(404, { ok: false, message: "Staffing request not found." });

    let connection = await StaffingConnection.findOne({ candidateId: data.candidateId, staffingRequestId: data.staffingRequestId });

    if (isContact) {
      if (!connection) {
        connection = new StaffingConnection({
          candidateId: data.candidateId,
          staffingRequestId: data.staffingRequestId,
          connectionStatus: "suggested",
        });
      }
      connection.communications.push({
        channel: data.channel,
        party: data.party,
        contactedAt: data.contactedAt ?? new Date(),
        outcome: data.outcome ?? "",
        followUpAt: data.followUpAt,
        notes: data.notes ?? "",
        createdBy: auth.admin.id,
        createdByName: auth.admin.name,
      });
      await connection.save();
      return respond(200, { ok: true, message: "Contact logged.", data: toPlain(connection.toObject()) });
    }

    const nextStatus = data.connectionStatus;

    if (!connection) {
      connection = new StaffingConnection({
        candidateId: data.candidateId,
        staffingRequestId: data.staffingRequestId,
        connectionStatus: nextStatus ?? "suggested",
        statusHistory: [
          {
            status: nextStatus ?? "suggested",
            note: "Connection created",
            changedAt: new Date(),
            changedByName: auth.admin.name,
          },
        ],
      });
    } else if (nextStatus && nextStatus !== connection.connectionStatus) {
      connection.statusHistory.push({
        status: nextStatus,
        note: data.matchNotes || data.adminNotes || "",
        changedAt: new Date(),
        changedByName: auth.admin.name,
      });
      connection.connectionStatus = nextStatus;
    }

    for (const key of [
      "matchNotes",
      "adminNotes",
      "salonFeedback",
      "candidateResponse",
      "finalOutcome",
      "interviewStatus",
    ] as const) {
      if (data[key] !== undefined) (connection as AnyDoc)[key] = data[key];
    }
    for (const key of ["shortlistedAt", "sharedWithSalonAt", "interviewDate"] as const) {
      if (data[key] !== undefined) (connection as AnyDoc)[key] = data[key];
    }

    if (nextStatus === "shortlisted" && !connection.shortlistedAt) connection.shortlistedAt = new Date();
    if (nextStatus === "shared-with-salon" && !connection.sharedWithSalonAt) connection.sharedWithSalonAt = new Date();
    if (nextStatus === "interview-scheduled" && !connection.interviewDate) connection.interviewDate = new Date();
    if (nextStatus === "interview-completed" && !connection.interviewStatus) connection.interviewStatus = "completed";

    const scored = scoreCandidate(staffingRequest, candidate);
    connection.matchScore = scored.score;

    await connection.save();
    return respond(200, {
      ok: true,
      message: nextStatus ? `Connection marked ${nextStatus.replace(/-/g, " ")}.` : "Connection saved.",
      data: toPlain(connection.toObject()),
    });
  } catch (error) {
    return dbError(error, "admin:matching:save");
  }
}

/** DELETE /api/admin/matching?connectionId=<id> — removes a connection without touching either record. */
export async function DELETE(request: Request) {
  const auth = await authorize(request, "admin");
  if (auth.response) return auth.response;

  const connectionId = new URL(request.url).searchParams.get("connectionId");
  if (!connectionId || !isObjectId(connectionId)) {
    return respond(400, { ok: false, message: "A valid connectionId is required." });
  }

  try {
    await connectToDatabase();
    const removed = await StaffingConnection.findByIdAndDelete(connectionId).lean<AnyDoc>();
    if (!removed) return respond(404, { ok: false, message: "Connection not found." });
    return respond(200, { ok: true, message: "Connection removed." });
  } catch (error) {
    return dbError(error, "admin:matching:delete");
  }
}

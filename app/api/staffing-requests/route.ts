import { connectToDatabase } from "@/lib/mongodb";
import { guardRequest, json, looksLikeSpam, serverError, zodErrors } from "@/lib/security";
import { staffingRequestSchema } from "@/lib/validations";
import { StaffingRequest } from "@/models/StaffingRequest";

export const runtime = "nodejs";

/** Generates a short reference number: SR-YYYYMMDD-XXXXXX */
function createReference() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, "0");
  return `SR-${date}-${suffix}`;
}

async function uniqueReference() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const referenceNumber = createReference();
    const exists = await StaffingRequest.exists({ referenceNumber });
    if (!exists) return referenceNumber;
  }
  return `SR-${Date.now().toString(36).toUpperCase()}`;
}

export async function POST(request: Request) {
  const blocked = guardRequest(request, "staffing");
  if (blocked) return blocked;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, message: "Invalid request body." });
  }

  const parsed = staffingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return json(422, { ok: false, message: "Please check the highlighted fields.", errors: zodErrors(parsed.error) });
  }

  const { website, startedAt, ...data } = parsed.data;
  if (looksLikeSpam({ website, startedAt })) {
    return json(201, { ok: true, message: "Thank you — your request has been received." });
  }

  try {
    await connectToDatabase();

    // A repeat submission from the same contact within a short window almost always
    // means a double click or a refresh. Return the existing reference instead of
    // creating a second requirement.
    const since = new Date(Date.now() - 10 * 60 * 1000);
    const duplicate = await StaffingRequest.findOne({
      createdAt: { $gte: since },
      $or: [
        { phone: data.phone },
        ...(data.email ? [{ email: data.email }] : []),
      ],
    })
      .select("referenceNumber")
      .lean();

    if (duplicate?.referenceNumber) {
      return json(200, {
        ok: true,
        message: "This request has already been received. Our team will review it and contact you shortly.",
        referenceNumber: duplicate.referenceNumber,
        duplicate: true,
      });
    }

    const referenceNumber = await uniqueReference();
    await StaffingRequest.create({ ...data, referenceNumber });
    return json(201, {
      ok: true,
      message:
        "Your staffing requirement has been received. Our team will review the details and contact you to discuss suitable candidates and next steps.",
      referenceNumber,
    });
  } catch (error) {
    return serverError(error, "staffing");
  }
}

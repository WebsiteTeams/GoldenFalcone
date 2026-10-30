import { connectToDatabase } from "@/lib/mongodb";
import { guardRequest, json, looksLikeSpam, serverError, zodErrors } from "@/lib/security";
import { staffingRequestSchema } from "@/lib/validations";
import { StaffingRequest } from "@/models/StaffingRequest";

export const runtime = "nodejs";

/** Generates a short reference number: SR-YYYYMMDD-XXXX */
function generateRef() {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SR-${d}-${r}`;
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
  if (looksLikeSpam({ website, startedAt })) return json(201, { ok: true, message: "Thank you — your request has been received." });

  try {
    await connectToDatabase();
    const referenceNumber = generateRef();
    await StaffingRequest.create({ ...data, referenceNumber });
    return json(201, {
      ok: true,
      message: `Thank you — your staffing request has been received. We will contact you to discuss the requirement. Your reference number is ${referenceNumber}.`,
    });
  } catch (error) {
    return serverError(error, "staffing");
  }
}

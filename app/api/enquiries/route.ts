import { connectToDatabase } from "@/lib/mongodb";
import { guardRequest, json, looksLikeSpam, serverError, zodErrors } from "@/lib/security";
import { enquirySchema } from "@/lib/validations";
import { Enquiry } from "@/models/Enquiry";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const blocked = guardRequest(request, "enquiry");
  if (blocked) return blocked;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, message: "Invalid request body." });
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return json(422, { ok: false, message: "Please check the highlighted fields.", errors: zodErrors(parsed.error) });
  }

  const { website, startedAt, product, quantity, experienceLevel, projectType, budget, timeline, ...data } = parsed.data;
  // Silently accept likely spam so bots get no signal to adapt.
  if (looksLikeSpam({ website, startedAt })) return json(201, { ok: true, message: "Thank you — your enquiry has been received." });

  try {
    await connectToDatabase();
    await Enquiry.create({
      ...data,
      details: { product, quantity, experienceLevel, projectType, budget, timeline },
      source: request.headers.get("referer")?.slice(0, 200),
    });
    return json(201, { ok: true, message: "Thank you — your enquiry has been received. We will be in touch shortly." });
  } catch (error) {
    return serverError(error, "enquiry");
  }
}

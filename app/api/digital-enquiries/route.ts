import { connectToDatabase } from "@/lib/mongodb";
import { guardRequest, json, looksLikeSpam, serverError, zodErrors } from "@/lib/security";
import { digitalProjectEnquirySchema } from "@/lib/validations";
import { DigitalEnquiry } from "@/models/DigitalEnquiry";

export const runtime = "nodejs";

function generateRef() {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DE-${d}-${r}`;
}

export async function POST(request: Request) {
  const blocked = guardRequest(request, "digital-enquiry");
  if (blocked) return blocked;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, message: "Invalid request body." });
  }

  const parsed = digitalProjectEnquirySchema.safeParse(body);
  if (!parsed.success) {
    return json(422, { ok: false, message: "Please check the highlighted fields.", errors: zodErrors(parsed.error) });
  }

  const { website, startedAt, ...data } = parsed.data;
  if (looksLikeSpam({ website, startedAt })) {
    return json(201, { ok: true, message: "Thank you — your project enquiry has been received." });
  }

  try {
    await connectToDatabase();

    // A repeat submission from the same contact within a short window almost always
    // means a double click or a refresh. Return the existing reference instead of
    // creating a second enquiry.
    const since = new Date(Date.now() - 10 * 60 * 1000);
    const duplicate = await DigitalEnquiry.findOne({
      createdAt: { $gte: since },
      $or: [{ mobile: data.mobile }, { email: data.email }],
    })
      .select("referenceNumber")
      .lean();

    if (duplicate?.referenceNumber) {
      return json(200, {
        ok: true,
        message: `This enquiry has already been received. Your reference number is ${duplicate.referenceNumber}.`,
        referenceNumber: duplicate.referenceNumber,
        duplicate: true,
      });
    }

    const referenceNumber = generateRef();
    const enquiry = await DigitalEnquiry.create({
      ...data,
      referenceNumber,
      source: request.headers.get("referer")?.slice(0, 200),
    });

    return json(201, {
      ok: true,
      message: `Thank you — your project enquiry has been received. Our solutions team will review your requirements and follow up promptly. Your reference number is ${referenceNumber}.`,
      data: { referenceNumber: enquiry.referenceNumber },
    });
  } catch (error) {
    return serverError(error, "digital-enquiry");
  }
}


import { logActivity } from "@/lib/admin/activity";
import { authorize, isObjectId, notFound, readJson, respond } from "@/lib/admin/api";
import { digitalEnquiryHistorySchema } from "@/lib/admin/schemas";
import { connectToDatabase } from "@/lib/mongodb";
import { serverError } from "@/lib/security";
import { DigitalEnquiry } from "@/models/DigitalEnquiry";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;

  const { id } = await params;
  if (!isObjectId(id)) return notFound("Enquiry");

  const json = await readJson(request);
  if ("response" in json) return json.response;

  const parsed = digitalEnquiryHistorySchema.safeParse(json.body);
  if (!parsed.success) {
    return respond(422, { ok: false, message: "Please check the history entry." });
  }

  try {
    await connectToDatabase();
    const entry = {
      channel: parsed.data.channel,
      notes: parsed.data.notes,
      contactedBy: auth.admin.name,
      date: new Date(),
    };

    const doc = await DigitalEnquiry.findByIdAndUpdate(
      id,
      { $push: { contactHistory: entry } },
      { new: true },
    ).lean();

    if (!doc) return notFound("Enquiry");

    await logActivity(
      auth.admin,
      `logged a ${parsed.data.channel} with`,
      "digital project enquiry",
      id,
      `${doc.fullName} (${doc.referenceNumber})`,
    );

    return respond(200, { ok: true, message: "Contact logged successfully.", data: doc });
  } catch (error) {
    return serverError(error, "admin:digital-enquiry:history");
  }
}


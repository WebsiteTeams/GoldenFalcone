import { connectToDatabase } from "@/lib/mongodb";
import { softwareDemoRequestSchema } from "@/lib/admin/schemas";
import { guardRequest, json, looksLikeSpam, serverError, zodErrors } from "@/lib/security";
import { TradingSoftware } from "@/models/TradingSoftware";
import { TradingSoftwareEnquiry } from "@/models/TradingSoftwareEnquiry";

export const runtime = "nodejs";

/** Public demo request. Rate limited, origin checked, validated and spam filtered before anything is saved. */
export async function POST(request: Request) {
  const blocked = guardRequest(request, "software-enquiry");
  if (blocked) return blocked;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, message: "Invalid request body." });
  }

  const parsed = softwareDemoRequestSchema.safeParse(body);
  if (!parsed.success) {
    return json(422, { ok: false, message: "Please check the highlighted fields.", errors: zodErrors(parsed.error) });
  }

  const { website, startedAt, software, ...data } = parsed.data;
  // Silently accept likely spam so bots get no signal to adapt.
  if (looksLikeSpam({ website, startedAt })) return json(201, { ok: true, message: "Thank you — your demo request has been received." });

  try {
    await connectToDatabase();
    // The name is taken from the database, never from the browser, and only for a published product.
    const product = software ? await TradingSoftware.findOne({ _id: software, status: "published" }).select("name").lean() : null;
    await TradingSoftwareEnquiry.create({
      ...data,
      software: product?._id ?? null,
      softwareName: product?.name ?? "",
      source: request.headers.get("referer")?.slice(0, 200),
    });
    return json(201, { ok: true, message: "Thank you — your demo request has been received. We will be in touch using your preferred contact method." });
  } catch (error) {
    return serverError(error, "software-enquiry");
  }
}

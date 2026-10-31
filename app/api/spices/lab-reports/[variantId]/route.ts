import { isObjectId } from "@/lib/admin/api";
import { labReportResponse } from "@/lib/media";
import { connectToDatabase } from "@/lib/mongodb";
import { SpiceProduct } from "@/models/SpiceProduct";

export const runtime = "nodejs";

/**
 * Public access to a lab report, addressed by variant rather than by file. A report is only reachable while its
 * product is published and its variant is active, and unpublishing takes effect immediately because nothing is cached.
 */
export async function GET(request: Request, { params }: { params: Promise<{ variantId: string }> }) {
  const { variantId } = await params;
  if (!isObjectId(variantId)) return new Response("Not found", { status: 404 });

  try {
    await connectToDatabase();
    const product = await SpiceProduct.findOne({ status: "published", variants: { $elemMatch: { _id: variantId, active: true } } })
      .select("variants")
      .lean();
    const report = product?.variants?.find((v) => String(v._id) === variantId)?.labReport;
    if (!report) return new Response("Not found", { status: 404 });

    const download = new URL(request.url).searchParams.get("download") === "1";
    return await labReportResponse(report.fileId, report, download, "no-store");
  } catch (error) {
    console.error("[lab-report] failed to serve", error);
    return new Response("Unavailable", { status: 503 });
  }
}

import { Readable } from "stream";
import { isObjectId } from "@/lib/admin/api";
import { openImage } from "@/lib/media";

export const runtime = "nodejs";

/** Serves uploaded website images. Ids are immutable (replacing an image creates a new id), so caching is permanent. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isObjectId(id)) return new Response("Not found", { status: 404 });
  try {
    const image = await openImage(id);
    if (!image || !image.contentType.startsWith("image/")) return new Response("Not found", { status: 404 });
    return new Response(Readable.toWeb(image.stream) as ReadableStream, {
      headers: {
        "Content-Type": image.contentType,
        "Content-Length": String(image.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'",
      },
    });
  } catch (error) {
    console.error("[media] failed to serve", error);
    return new Response("Unavailable", { status: 503 });
  }
}

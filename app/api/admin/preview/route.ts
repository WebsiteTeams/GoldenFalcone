import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { authorize } from "@/lib/admin/api";

export const runtime = "nodejs";

const previewable = ["/", "/about", "/spices", "/trading-mentorship", "/digital-solutions", "/salon-staffing", "/contact"];

/** Turns on draft preview for a signed-in admin and opens the requested public page. */
export async function GET(request: Request) {
  const auth = await authorize(request);
  if (auth.response) return auth.response;
  const path = new URL(request.url).searchParams.get("path") ?? "/";
  (await draftMode()).enable();
  // Only known public paths, so this can never become an open redirect.
  redirect(previewable.includes(path) ? path : "/");
}

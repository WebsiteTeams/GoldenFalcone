import { NextResponse } from "next/server";
import { getPublishedPrograms } from "@/lib/cms";

export const revalidate = 3600;

/** Public list of published mentorship programmes. Drafts are never returned. */
export async function GET() {
  return NextResponse.json({ ok: true, data: await getPublishedPrograms() });
}

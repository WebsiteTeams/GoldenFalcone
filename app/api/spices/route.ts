import { NextResponse } from "next/server";
import { getPublishedSpices } from "@/lib/cms";

export const revalidate = 3600;

/** Public catalogue: published products and public fields only. Drafts are never returned. */
export async function GET() {
  return NextResponse.json({ ok: true, data: await getPublishedSpices() });
}

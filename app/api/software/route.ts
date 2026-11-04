import { NextResponse } from "next/server";
import { getSoftwareListing } from "@/lib/software/catalogue";
import { parseSoftwareFilters } from "@/lib/software/filters";

export const runtime = "nodejs";

/** Public, filterable list of published trading software, with the facets used to build the filter controls. */
export async function GET(request: Request) {
  try {
    const filters = parseSoftwareFilters(new URL(request.url).searchParams);
    const data = await getSoftwareListing(filters);
    return NextResponse.json({ ok: true, data }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
  } catch (error) {
    console.error("[software] list unavailable", (error as Error).message);
    return NextResponse.json({ ok: false, message: "The software catalogue is temporarily unavailable." }, { status: 503 });
  }
}

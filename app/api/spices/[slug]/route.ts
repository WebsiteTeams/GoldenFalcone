import { NextResponse } from "next/server";
import { getSpiceBySlug } from "@/lib/cms";

export const revalidate = 3600;

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getSpiceBySlug(slug);
  if (!product) return NextResponse.json({ ok: false, message: "Product not found." }, { status: 404 });
  return NextResponse.json({ ok: true, data: product });
}

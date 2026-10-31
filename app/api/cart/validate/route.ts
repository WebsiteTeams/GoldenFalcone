import { NextResponse } from "next/server";
import { cartValidationSchema } from "@/lib/admin/schemas";
import { priceLines } from "@/lib/orders/pricing";
import { clientIp, isSameOrigin, rateLimit, serverError, zodErrors } from "@/lib/security";

/** Re-checks a cart against the database so the cart and checkout pages always show current prices and availability. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ ok: false, message: "Request not allowed." }, { status: 403 });
  if (!rateLimit(`cart:validate:${clientIp(request)}`, 120).ok) {
    return NextResponse.json({ ok: false, message: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const parsed = cartValidationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid cart.", errors: zodErrors(parsed.error) }, { status: 422 });
  }

  try {
    return NextResponse.json({ ok: true, data: { lines: await priceLines(parsed.data.items) } });
  } catch (error) {
    return serverError(error, "cart:validate");
  }
}

import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "gf_admin_session";

/**
 * Fast first line of defence only: bounces admin pages with no session cookie to the login screen.
 * The real check (decrypting the cookie and validating the server-side session) runs in every admin page
 * and every admin API handler — never rely on this middleware alone.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";

  if (!isLogin && !request.cookies.has(SESSION_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = pathname === "/admin" || pathname === "/admin/dashboard" ? "" : `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = { matcher: ["/admin", "/admin/:path*"] };

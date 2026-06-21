import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "fp_admin_token";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    // Edge middleware: just check cookie presence.
    // Real JWT verification is done in the API routes (Node.js runtime).
    if (!token) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

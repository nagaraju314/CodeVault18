import { getToken } from "next-auth/jwt";
import { NextResponse, NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // public paths
  const PUBLIC_PATHS = [
    "/",
    "/login",
    "/signup",
    "/about",
    "/contact",
    "/api/snippets",
    "/api/auth",
    "/favicon.ico",
  ];

  if (PUBLIC_PATHS.some((p) => url.pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = await getToken({
    req, // ✅ Now typed as NextRequest
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/snippets/:path*", "/api/:path*"],
};

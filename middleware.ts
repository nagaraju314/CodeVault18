import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/",                // Home
  "/login",
  "/signup",
  "/about",
  "/contact",
  "/favicon.ico",
  "/api/snippets",    // Snippet list API (public)
  "/api/auth",        // NextAuth APIs
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Get token from cookies or Authorization header
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect to login if no token
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Matcher tells middleware which routes to check
export const config = {
  matcher: [
    "/dashboard/:path*", // Protect dashboard
    "/snippets/:path*",  // Protect snippet detail (if desired)
    "/api/:path*",       // Protect API except public ones above
  ],
};

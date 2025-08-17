// lib/absoluteUrl.ts
import { headers } from "next/headers";

/**
 * Build a safe absolute URL that works on Vercel & locally
 * without relying purely on NEXT_PUBLIC_BASE_URL.
 */
export async function absoluteUrl(path: string) {
  // ✅ headers() returns a Promise in your setup; must await
  const h = await headers();

  const proto =
    h.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "production" ? "https" : "http");

  const host =
    h.get("x-forwarded-host") ??
    h.get("host") ??
    process.env.VERCEL_URL ??
    "localhost:3000";

  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (String(host).startsWith("http") ? String(host) : `${proto}://${host}`);

  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

// lib/absoluteUrl.ts
import { headers } from "next/headers";

/**
 * Build a safe absolute URL that works on Vercel & locally
 * without relying on NEXT_PUBLIC_BASE_URL.
 */
export async function absoluteUrl(path: string) {
  const h = await headers(); // ✅ must await in Next.js 14+

  const proto = h.get("x-forwarded-proto") ?? "http";
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

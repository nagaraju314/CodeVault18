// lib/absoluteUrl.ts
export async function absoluteUrl(path: string): Promise<string> {
  // On the server (Node / Vercel runtime)
  if (typeof window === "undefined") {
    const protocol =
      process.env.VERCEL_ENV === "production" ? "https" : "http";

    const host =
      process.env.VERCEL_URL || // Vercel auto-injected
      process.env.NEXT_PUBLIC_VERCEL_URL || // fallback if defined
      "localhost:3000";

    return `${protocol}://${host}${path}`;
  }

  // On the client, relative path is fine
  return path;
}

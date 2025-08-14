import Hero from "@/components/general/Hero";
import { SnippetCard } from "@/components/snippets/SnippetCard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import type { Snippet } from "@/types/snippet";

async function getSnippets(q?: string): Promise<Snippet[]> {
  // ✅ Removed hardcoded localhost
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const url = new URL(`/api/snippets`, baseUrl || undefined);

  if (q) url.searchParams.set("q", q);

  const res = await fetch(url.toString(), { cache: "no-store" });
  return res.ok ? res.json() : [];
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  const snippets = await getSnippets(params?.q);

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
        {snippets.length > 0 ? (
          snippets.map((snippet: Snippet) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              currentUserId={session?.user?.id}
            />
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center">
            No snippets found.
          </p>
        )}
      </div>
    </div>
  );
}

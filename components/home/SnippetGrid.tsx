// components/home/SnippetGrid.tsx
import { SnippetCard } from "@/components/snippets/SnippetCard";
import type { Snippet } from "@/types/snippet";

async function getSnippets(q?: string): Promise<Snippet[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL!;
  const url = new URL("/api/snippets", base);
  if (q) url.searchParams.set("q", q);

  // Revalidate periodically so the stream stays fresh without hammering the DB
  const res = await fetch(url.toString(), {
    next: { revalidate: 60 }, // 60s ISR-style cache
  });

  if (!res.ok) return [];
  return res.json();
}

export default async function SnippetGrid({
  q,
  userId,
}: {
  q?: string;
  userId?: string;
}) {
  const snippets = await getSnippets(q);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
      {snippets.length > 0 ? (
        snippets.map((snippet) => (
          <SnippetCard
            key={snippet.id}
            snippet={snippet}
            currentUserId={userId}
          />
        ))
      ) : (
        <p className="text-gray-500 col-span-full text-center">
          No snippets found.
        </p>
      )}
    </div>
  );
}

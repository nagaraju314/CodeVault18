// components/home/SnippetGrid.tsx
import { prisma } from "@/lib/prisma";
import { SnippetCard } from "@/components/snippets/SnippetCard";
import type { Snippet } from "@/types/snippet";

// ISR-style caching (avoid hammering DB)
export const revalidate = 60; // 60 seconds

async function getSnippets(q?: string): Promise<Snippet[]> {
  return prisma.snippet.findMany({
    where: q
      ? {
          title: { contains: q, mode: "insensitive" },
        }
      : {},
    orderBy: { createdAt: "desc" },
    take: 30,
  });
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

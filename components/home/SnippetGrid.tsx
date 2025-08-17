// components/home/SnippetGrid.tsx
import { prisma } from "@/lib/prisma";
import type { Snippet } from "@/types/snippet";
import { SnippetCard } from "@/components/snippets/SnippetCard";
import type { Prisma } from "@prisma/client";

// Helper: fetch snippets with optional search query
async function getSnippets(q?: string): Promise<Snippet[]> {
  const where: Prisma.SnippetWhereInput = q
    ? {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { code: { contains: q, mode: "insensitive" } },
          { language: { contains: q, mode: "insensitive" } },
          { tags: { has: q } },
        ],
      }
    : {};

  const snippets = await prisma.snippet.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      language: true,
      code: true,
      tags: true,
      createdAt: true,
      likes: { select: { userId: true } },
      comments: {
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, content: true, createdAt: true },
      },
    },
  });

  return snippets as unknown as Snippet[];
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

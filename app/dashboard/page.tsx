// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SnippetCard } from "@/components/snippets/SnippetCard";
import type { Snippet } from "@/types/snippet";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

async function getUserSnippets(userId: string): Promise<Snippet[]> {
  const snippets = await prisma.snippet.findMany({
    where: { authorId: userId },
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
        take: 3, // only last three on cards
        select: { id: true, content: true, createdAt: true },
      },
    },
  });

  return snippets as unknown as Snippet[];
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/dashboard`);
  }

  const userId = session.user.id;
  const snippets = await getUserSnippets(userId);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Snippets</h1>
        <Link href="/dashboard/create">
          <Button>Create Snippet</Button>
        </Link>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl text-gray-500 mb-2">
          Welcome back, {session.user.name || "Developer"}!
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {snippets.map((s) => (
          <SnippetCard key={s.id} snippet={s} currentUserId={userId} />
        ))}
      </div>
    </div>
  );
}

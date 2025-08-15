import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SnippetCard } from "@/components/snippets/SnippetCard";
import type { Snippet } from "@/types/snippet";
import { redirect } from "next/navigation";
import { absoluteUrl } from "@/lib/absoluteUrl";

async function getUserSnippets(userId: string): Promise<Snippet[]> {
  const abs = await absoluteUrl("/api/snippets");
  const url = new URL(abs);
  url.searchParams.set("authorId", userId);
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
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

      {snippets.length === 0 ? (
        <p>No snippets yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {snippets.map((snippet: Snippet) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              currentUserId={userId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

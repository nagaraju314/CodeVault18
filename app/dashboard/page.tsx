import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SnippetCard } from "@/components/snippets/SnippetCard";
import type { Snippet } from "@/types/snippet";
import { redirect } from "next/navigation";

async function getUserSnippets(userId: string): Promise<Snippet[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL!;
  console.log("🔍 Fetching user snippets from base URL:", base);

  try {
    const url = new URL("/api/snippets", base);
    url.searchParams.set("authorId", userId);
    console.log("📡 Request URL:", url.toString());

    const res = await fetch(url.toString(), { cache: "no-store" });
    console.log("📡 Response status:", res.status);

    if (!res.ok) {
      console.error("❌ Failed to fetch user snippets");
      return [];
    }

    const data = await res.json();
    console.log("✅ User snippets fetched:", data.length);
    return data;
  } catch (error) {
    console.error("💥 Fetch error:", error);
    return [];
  }
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

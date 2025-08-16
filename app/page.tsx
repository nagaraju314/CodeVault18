// app/page.tsx
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Hero from "@/components/general/Hero";
import SplashGate from "@/components/general/SplashGate";
import SnippetGrid from "@/components/home/SnippetGrid";
import SnippetCardSkeleton from "@/components/home/SnippetCardSkeleton";

export default async function Home({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const [session] = await Promise.all([getServerSession(authOptions)]);

  if (!session) {
    return <SplashGate />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />

      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SnippetCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        {/* Snippets stream in after session is ready */}
        <SnippetGrid q={searchParams?.q} userId={session.user?.id} />
      </Suspense>
    </div>
  );
}

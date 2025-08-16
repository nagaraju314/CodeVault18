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
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);

  // If not authenticated, we show intro animation/gate
  if (!session) {
    return <SplashGate />;
  }

  // Authenticated users get the actual home with streaming of the grid
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
        {/* This server component fetches & streams */}
        <SnippetGrid q={params?.q} userId={session.user?.id} />
      </Suspense>
    </div>
  );
}

// app/snippets/[id]/page.tsx
import { cookies } from "next/headers";
import { SnippetViewer } from "./SnippetViewer";
import { absoluteUrl } from "@/lib/absoluteUrl";

export default async function SnippetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookieStore = await cookies();
  const url = await absoluteUrl(`/api/snippets/${id}`);

  const res = await fetch(url, {
    cache: "no-store",
    headers: { Cookie: cookieStore.toString() },
  });

  if (!res.ok) return <div>Snippet not found</div>;

  const snippet = await res.json();
  return <SnippetViewer snippet={snippet} />;
}

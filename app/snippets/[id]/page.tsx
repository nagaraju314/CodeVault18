import { cookies } from "next/headers";
import { SnippetViewer } from "./SnippetViewer";

export default async function SnippetDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const cookieStore = await cookies();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  const res = await fetch(`${baseUrl}/api/snippets/${id}`, {
    cache: "no-store",
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  if (!res.ok) {
    return <div>Snippet not found</div>;
  }

  const snippet = await res.json();
  return <SnippetViewer snippet={snippet} />;
}

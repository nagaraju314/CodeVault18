import { cookies } from "next/headers";
import { SnippetViewer } from "./SnippetViewer";

export default async function SnippetDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const cookieStore = await cookies();

  const base = process.env.NEXT_PUBLIC_BASE_URL!;
  const url = `${base}/api/snippets/${id}`;
  const res = await fetch(url, {
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

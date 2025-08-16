// app/snippets/[id]/SnippetViewer.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CopyButton } from "./CopyButton";
import { Textarea } from "@/components/ui/textarea";
import type { Snippet, Comment } from "@/types/snippet";

export function SnippetViewer({ snippet }: { snippet: Snippet }) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>(snippet.comments || []);
  const [content, setContent] = useState<string>("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPost = async () => {
    if (!content.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`/api/snippets/${snippet.id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error || "Failed to add comment");
      } else {
        const newItem: Comment = {
          id: `temp-${Date.now()}`,
          content: content.trim(),
          createdAt: new Date().toISOString(),
          author: { name: "You" },
        };
        setComments((prev) => [newItem, ...prev]);
        setContent("");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 flex justify-center p-6">
      <Card className="w-full max-w-4xl shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
        <CardHeader className="flex justify-between items-center border-b pb-3 bg-white">
          <div className="flex items-center gap-2">
            <Button
              aria-label="Back to dashboard"
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <CardTitle>{snippet.title}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 mt-2">
          <div className="text-gray-700 text-sm">
            <div>
              <span className="font-semibold">Language:</span>{" "}
              {snippet.language}
            </div>

            {Array.isArray(snippet.tags) && snippet.tags.length > 0 && (
              <div>
                <span className="font-semibold">Tags:</span>{" "}
                {snippet.tags.join(", ")}
              </div>
            )}
            <div>
              <span className="font-semibold">Likes:</span>{" "}
              {snippet.likes?.length ?? 0}
            </div>
          </div>

          <div className="bg-zinc-900 text-zinc-100 rounded-lg p-4 font-mono relative">
            <pre>{snippet.code}</pre>
            <CopyButton code={snippet.code} />
          </div>

          <section className="space-y-3" aria-label="Comments">
            <h3 className="font-semibold">Comments</h3>
            <div className="space-y-3">
              <Textarea
                rows={4}
                placeholder="Add a helpful comment…"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                aria-label="Write a comment"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end">
                <Button
                  onClick={onPost}
                  disabled={posting}
                  aria-label="Post comment"
                >
                  {posting ? "Posting…" : "Post Comment"}
                </Button>
              </div>
            </div>

            {comments.length === 0 ? (
              <p className="text-sm text-gray-500">No comments yet.</p>
            ) : (
              <ul className="space-y-2">
                {comments.map((c) => (
                  <li key={c.id} className="text-sm">
                    {String(c.content)}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

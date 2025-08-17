"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import type { Snippet, Comment } from "@/types/snippet";

export function SnippetViewer({ snippet }: { snippet: Snippet }) {
  const router = useRouter();

  const [comments, setComments] = useState<Comment[]>(snippet.comments || []);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copyCode = async () => {
    await navigator.clipboard.writeText(snippet.code);
  };

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
      <Card className="w-full max-w-3xl shadow-lg rounded-2xl border border-gray-200 overflow-hidden bg-white">
        <CardHeader className="flex justify-between items-center border-b pb-3 bg-gray-50">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-lg font-semibold truncate">
              {snippet.title}
            </CardTitle>
          </div>
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
            {snippet.language}
          </span>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative">
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-3 right-3"
              onClick={copyCode}
            >
              <Copy className="w-4 h-4" />
            </Button>
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm max-h-96 overflow-auto">
              <code>{snippet.code}</code>
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Comments</h3>
            <Textarea
              placeholder="Write your comment…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button onClick={onPost} disabled={posting}>
              {posting ? "Posting…" : "Post"}
            </Button>

            <div className="space-y-2 pt-2">
              {comments.length ? (
                comments.map((c) => (
                  <div
                    key={c.id}
                    className="bg-gray-50 border px-3 py-2 rounded-lg text-sm text-gray-700"
                  >
                    {c.content}
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">No comments yet.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

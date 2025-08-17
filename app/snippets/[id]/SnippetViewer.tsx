// app/snippets/[id]/SnippetViewer.tsx
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
        {/* Header */}
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

        {/* Code Block */}
        <CardContent className="relative mt-4">
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-64">
              <code>{snippet.code}</code>
            </pre>
            <Button
              size="icon"
              variant="secondary"
              className="absolute top-2 right-2"
              onClick={copyCode}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          {/* Comments Section */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Comments</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {comments.length > 0 ? (
                comments.map((c) => (
                  <div
                    key={c.id}
                    className="bg-gray-50 border rounded-lg p-3 shadow-sm"
                  >
                    <p className="text-sm text-gray-800">{c.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(c.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">No comments yet.</p>
              )}
            </div>

            {/* Add Comment */}
            <div className="mt-5">
              <Textarea
                rows={3}
                placeholder="Write your comment…"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end mt-2">
                <Button onClick={onPost} disabled={posting}>
                  {posting ? "Posting…" : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

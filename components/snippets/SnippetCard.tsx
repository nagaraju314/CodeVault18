"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter as DialogButtons,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { Snippet, Comment } from "@/types/snippet";

export function SnippetCard({
  snippet,
  currentUserId,
}: {
  snippet: Snippet;
  currentUserId?: string;
}) {
  const router = useRouter();
  const userLiked = snippet.likes?.some((l) => l.userId === currentUserId);

  const [isLiked, setIsLiked] = useState<boolean>(!!userLiked);
  const [likesCount, setLikesCount] = useState<number>(
    snippet.likes?.length || 0
  );

  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>(snippet.comments || []);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleLike = async () => {
    const method = isLiked ? "DELETE" : "POST";
    const res = await fetch(`/api/snippets/${snippet.id}/like`, { method });
    if (res.status === 401) {
      router.push(`/login?callbackUrl=/`);
      return;
    }
    if (res.ok) {
      setIsLiked(!isLiked);
      setLikesCount((prev: number) => prev + (isLiked ? -1 : 1));
    }
  };

  const postComment = async () => {
    if (!comment.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`/api/snippets/${snippet.id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment.trim() }),
      });

      if (res.status === 401) {
        router.push(`/login?callbackUrl=/`);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          (data as { error?: string }).error || "Failed to post comment"
        );
      } else {
        const newItem: Comment = {
          id: `temp-${Date.now()}`,
          content: comment.trim(),
          createdAt: new Date().toISOString(),
        };
        setComments((prev) => [newItem, ...prev].slice(0, 3));
        setComment("");
        setOpen(false);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <Card className="rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 bg-white flex flex-col justify-between">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold truncate">
            {snippet.title}
          </CardTitle>
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
            {snippet.language}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        {/* Code preview */}
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs max-h-28 overflow-hidden">
            <code>{snippet.code}</code>
          </pre>
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-gray-900 to-transparent rounded-b-lg" />
        </div>

        {/* Recent comments */}
        {comments?.length ? (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-gray-500">Recent comments</p>
            {comments.map((c) => (
              <div
                key={c.id}
                className="bg-gray-50 border px-3 py-2 rounded-lg text-sm text-gray-700"
              >
                {c.content}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic mt-3">No comments yet.</p>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-3">
        <div className="flex gap-2">
          <Button
            variant={isLiked ? "secondary" : "outline"}
            size="sm"
            onClick={toggleLike}
            className="flex items-center gap-1"
          >
            {isLiked ? "❤️" : "🤍"} {likesCount}
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                + Comment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a comment</DialogTitle>
              </DialogHeader>
              <Textarea
                rows={4}
                placeholder="Write your comment…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <DialogButtons className="flex items-center justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button onClick={postComment} disabled={posting}>
                  {posting ? "Posting…" : "Post"}
                </Button>
              </DialogButtons>
            </DialogContent>
          </Dialog>
        </div>

        <Link href={`/snippets/${snippet.id}`}>
          <Button size="sm" variant="default">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

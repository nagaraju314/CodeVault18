"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
    if (res.ok) {
      setIsLiked(!isLiked);
      setLikesCount((prev) => prev + (isLiked ? -1 : 1));
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
          author: { name: "You" },
        };
        setComments((prev) => [newItem, ...prev]);
        setComment("");
        setOpen(false);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPosting(false);
    }
  };

  const previewComments = (comments || []).slice(0, 3);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{snippet.title}</CardTitle>
        <CardDescription>
          {snippet.language} — by {snippet.author?.name || "Unknown"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {Array.isArray(snippet.tags) && snippet.tags.length > 0 && (
          <p className="text-sm text-gray-600">{snippet.tags.join(", ")}</p>
        )}

        {previewComments.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500">Recent comments</p>
            <ul className="space-y-2">
              {previewComments.map((c) => (
                <li key={c.id} className="text-sm">
                  <span className="font-medium">
                    {c.author?.name ?? "Anonymous"}:
                  </span>{" "}
                  {String(c.content).slice(0, 120)}
                  {String(c.content).length > 120 ? "…" : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No comments yet.</p>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLike}
          className={isLiked ? "text-red-500" : "text-gray-500"}
        >
          {isLiked ? "❤" : "🤍"} {likesCount}
        </Button>

        <div className="flex items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm">
                Add Comment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a comment</DialogTitle>
              </DialogHeader>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write something helpful…"
                rows={4}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <DialogFooter className="gap-2">
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button onClick={postComment} disabled={posting}>
                  {posting ? "Posting…" : "Post"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Link href={`/snippets/${snippet.id}`}>
            <Button variant="link">View</Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

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
import { useRouter } from "next/navigation";
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

      if (res.status === 401) {
        // not logged in → send to login
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

  const visibleComments = (comments ?? []).slice(0, 3); // latest 3

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3">
          <span className="truncate">{snippet.title}</span>
          <span className="text-xs text-gray-500">{snippet.language}</span>
        </CardTitle>
        <CardDescription className="text-xs">
          {snippet.author?.name ?? "Anonymous"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Latest 3 comments */}
        <div>
          <p className="font-medium text-sm mb-1">Recent comments</p>
          {visibleComments.length === 0 ? (
            <p className="text-xs text-gray-500">No comments yet.</p>
          ) : (
            <ul className="space-y-1">
              {visibleComments.map((c) => (
                <li key={c.id} className="text-sm">
                  <span className="font-medium">
                    {c.author?.name ?? "Anonymous"}:
                  </span>{" "}
                  {String(c.content)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLike}
            aria-label="Like"
          >
            {isLiked ? "❤" : "🤍"} {likesCount}
          </Button>

          {/* Comment Popup trigger */}
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
                rows={4}
                placeholder="Write your comment…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <DialogFooter className="flex items-center justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button onClick={postComment} disabled={posting}>
                  {posting ? "Posting…" : "Post"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Link href={`/snippets/${snippet.id}`}>
          <Button size="sm">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

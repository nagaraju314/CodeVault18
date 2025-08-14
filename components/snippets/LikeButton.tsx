// components/snippets/LikeButton.tsx
"use client";

import { useState, useTransition } from "react";

export default function LikeButton({
  snippetId,
  liked,
  count,
}: {
  snippetId: string;
  liked: boolean;
  count: number;
}) {
  const [isLiked, setIsLiked] = useState(liked);
  const [likes, setLikes] = useState(count);
  const [isPending, startTransition] = useTransition();

  const toggleLike = async () => {
    const method = isLiked ? "DELETE" : "POST";
    const res = await fetch(`/api/snippets/${snippetId}/like`, { method });
    if (res.ok) {
      setIsLiked(!isLiked);
      setLikes((prev) => prev + (isLiked ? -1 : 1));
    }
  };

  return (
    <button
      onClick={() => startTransition(toggleLike)}
      disabled={isPending}
      className={isLiked ? "text-red-500" : "text-gray-500"}
    >
      {isLiked ? "❤️" : "🤍"} {likes}
    </button>
  );
}

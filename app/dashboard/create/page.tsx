"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function CreateSnippetPage() {
  const { status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    code: "",
    language: "",
    tags: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard/create");
    }
  }, [status, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitSnippet = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          code: form.code,
          language: form.language,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          (data as { error?: string }).error || "Failed to create snippet"
        );
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  if (status === "loading") return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-lg mx-auto relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4"
        onClick={() => router.push("/dashboard")}
      >
        <X className="h-5 w-5" />
      </Button>

      <h1 className="text-2xl font-bold mb-4">Create Snippet</h1>
      {error && <p className="mb-4 text-red-600">{error}</p>}

      <form onSubmit={submitSnippet} className="space-y-4">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          required
          className="w-full border p-2 rounded"
        />
        <textarea
          name="code"
          value={form.code}
          onChange={handleChange}
          placeholder="Code"
          rows={6}
          required
          className="w-full border p-2 rounded font-mono"
        />
        <input
          name="language"
          value={form.language}
          onChange={handleChange}
          placeholder="Language (e.g., TypeScript)"
          required
          className="w-full border p-2 rounded"
        />
        <input
          name="tags"
          value={form.tags}
          onChange={handleChange}
          placeholder="Tags (comma separated)"
          className="w-full border p-2 rounded"
        />
        <Button type="submit" className="w-full">
          Create Snippet
        </Button>
      </form>
    </div>
  );
}

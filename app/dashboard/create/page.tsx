"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function CreateSnippetPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    code: "",
    language: "",
    tags: "",
  });

  const [error, setError] = useState("");

  // Redirect to login if not logged in
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
          ...form,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create snippet");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  if (status === "loading") {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
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
          placeholder="Language (e.g., JavaScript)"
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

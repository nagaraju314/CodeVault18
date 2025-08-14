"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button"; // ✅ shadcn button

export default function Hero() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleCreate = () => {
    if (session) {
      router.push("/dashboard/create");
    } else {
      router.push("/login?callbackUrl=/dashboard/create");
    }
  };

  return (
    <section className="text-center py-5">
      <h1 className="text-3xl font-bold">
        CodeVault – Share & Discover Code Snippets
      </h1>
      <p className="mb-3 text-gray-600">
        A platform for developers to store, share, and find useful code.
      </p>
      <Button onClick={handleCreate} className="px-6 py-2 text-lg">
        Create Snippet
      </Button>
    </section>
  );
}

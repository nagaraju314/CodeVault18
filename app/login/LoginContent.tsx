"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button"; // shadcn button

export default function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params?.get("callbackUrl") || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <div className="h-full flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Login
        </h2>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-100 p-2 rounded text-center">
            {error}
          </p>
        )}

        <form onSubmit={submitCredentials} className="space-y-4">
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="mx-2 text-gray-400">OR</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>

        <Button
          variant="destructive"
          onClick={() => signIn("google", { callbackUrl })}
          className="w-full flex items-center justify-center gap-2 mb-2"
        >
          <FaGoogle /> Sign in with Google
        </Button>

        <Button
          variant="default"
          onClick={() => signIn("github", { callbackUrl })}
          className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900"
        >
          <FaGithub /> Sign in with GitHub
        </Button>
      </div>
    </div>
  );
}

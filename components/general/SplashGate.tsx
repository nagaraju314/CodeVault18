// components/general/SplashGate.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SplashGate() {
  const router = useRouter();
  const [done, setDone] = useState(false);

  // simple timed intro animation reveal
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1600); // 1.6s animation
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
      <div className="text-center">
        <div
          className={`text-4xl md:text-5xl font-extrabold tracking-tight transition-all duration-500 ${
            done ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          Code<span className="text-blue-600">Vault</span>
          <h1 className="text-3xl mt-1 font-bold">
            Share & Discover Code Snippets
          </h1>
        </div>
        <p
          className={`text-xl mt-1 text-gray-600 transition-opacity duration-700 ${
            done ? "opacity-100" : "opacity-0"
          }`}
        >
          A platform for developers to store, share, and find useful code.
        </p>

        {done && (
          <div className="mt-5 flex items-center justify-center gap-3">
            <Button
              aria-label="Go to login"
              onClick={() => router.push("/login?callbackUrl=/")}
            >
              Login
            </Button>
            <Button
              aria-label="Go to register"
              variant="secondary"
              onClick={() => router.push("/signup")}
            >
              Register
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { Suspense } from "react";
import LoginContent from "./LoginContent";

export default function LoginPageWrapper() {
  return (
    <Suspense
      fallback={<div className="p-6 text-center">Loading login...</div>}
    >
      <LoginContent />
    </Suspense>
  );
}

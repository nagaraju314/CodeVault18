"use client";

import { Suspense } from "react";
import NotFoundContent from "./not-found-content";

export default function NotFoundPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  );
}

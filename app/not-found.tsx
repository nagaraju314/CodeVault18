"use client";

import { Suspense } from "react";
import NotFoundContent from "./NotFoundContent";

export default function NotFoundPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  );
}

"use client";

import { useSearchParams } from "next/navigation";

export default function NotFoundContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-2">404 - Page Not Found</h1>
      {error && (
        <p className="mt-2 text-red-600">{decodeURIComponent(error)}</p>
      )}
      <p className="mt-4 text-gray-500">
        The page you are looking for does not exist.
      </p>
    </div>
  );
}

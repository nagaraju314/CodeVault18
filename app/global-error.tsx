// app/global-error.tsx
"use client";

export default function GlobalError({ error }: { error: Error }) {
  return (
    <html>
      <body>
        <div className="p-6 max-w-xl mx-auto text-center">
          <h2 className="text-xl font-semibold mb-2">App crashed</h2>
          <p className="text-sm text-gray-600">{error.message}</p>
        </div>
      </body>
    </html>
  );
}

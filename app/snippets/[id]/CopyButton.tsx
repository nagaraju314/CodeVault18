"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Button
        variant="secondary"
        size="icon"
        className="absolute top-3 right-3"
        onClick={handleCopy}
      >
        <Copy className="w-4 h-4" />
      </Button>
      {copied && (
        <span className="absolute top-3 right-14 text-green-400 text-sm">
          Copied!
        </span>
      )}
    </>
  );
}

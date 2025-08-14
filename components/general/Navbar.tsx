"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { Button } from "../ui/button";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params?.get("q") || "");

  const submitSearch = () => {
    const trimmed = q.trim();
    const url = trimmed ? `/?q=${encodeURIComponent(trimmed)}` : "/";
    router.push(url);
    setIsOpen(false);
    setQ(""); // ✅ clear after search
  };

  return (
    <nav className="px-21 py-2 flex items-center justify-between shadow-lg relative bg-white">
      {/* Left cluster: Logo + Dashboard */}
      <div className="flex items-center gap-6">
        <Link href="/" className="text-xl font-bold whitespace-nowrap">
          Code<span className="text-blue-500">Vault</span>
        </Link>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            Dashboard
          </Button>
        </Link>
      </div>

      {/* Desktop search */}
      <div className="hidden md:flex flex-1 justify-center px-3">
        <div className="relative w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                submitSearch();
              }
            }}
            type="text"
            placeholder="Snippets....."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={submitSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-black px-3 py-1 rounded-md text-sm"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Right cluster: Auth buttons */}
      <div className="hidden md:flex items-center gap-3">
        {session ? (
          <Button
            variant="secondary"
            className="ml-2"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Logout
          </Button>
        ) : (
          <>
            <Link href="/login">
              <Button>Login</Button>
            </Link>
            <Link href="/signup">
              <Button variant="secondary">Sign Up</Button>
            </Link>
          </>
        )}
      </div>

      {/* Mobile menu icon */}
      <div className="md:hidden">
        <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md px-4 py-4 space-y-4 z-50 md:hidden">
          {/* Mobile search */}
          <div className="flex w-full items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  submitSearch();
                }
              }}
              type="text"
              placeholder="Search snippets..."
              className="flex-1 px-4 py-2 rounded-lg text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <Button variant="secondary" onClick={submitSearch}>
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {session && (
            <Link href="/dashboard">
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Button>
            </Link>
          )}

          {session ? (
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Logout
            </Button>
          ) : (
            <>
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button className="w-full">Login</Button>
              </Link>
              <Link href="/signup" onClick={() => setIsOpen(false)}>
                <Button variant="secondary" className="w-full">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { Button } from "../ui/button";

const SEARCH_PLACEHOLDER = "Search snippets...";

export default function NavbarContent() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params?.get("q") || "");
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem("snippetSearchHistory") || "[]"
    );
    setHistory(stored);
  }, []);

  const submitSearch = () => {
    const trimmed = q.trim();
    if (!trimmed) return;

    const url = `/?q=${encodeURIComponent(trimmed)}`;
    router.push(url);

    // Save search to history
    const newHistory = [trimmed, ...history.filter((h) => h !== trimmed)].slice(
      0,
      5
    ); // keep last 5
    setHistory(newHistory);
    localStorage.setItem("snippetSearchHistory", JSON.stringify(newHistory));

    setQ(""); // clear input
    setIsOpen(false);
    setShowHistory(false);
  };

  const handleSelectHistory = (value: string) => {
    setQ(value);
    setShowHistory(false);
    const url = `/?q=${encodeURIComponent(value)}`;
    router.push(url);
  };

  return (
    <nav className="px-21 py-2 flex items-center justify-between shadow-lg relative bg-white">
      {/* Left cluster */}
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="text-xl font-bold whitespace-nowrap"
          aria-label="Go to home"
        >
          Code<span className="text-blue-500">Vault</span>
        </Link>
        <Link href="/dashboard" aria-label="Go to dashboard">
          <Button variant="ghost" size="sm">
            Dashboard
          </Button>
        </Link>
      </div>

      {/* Desktop search */}
      <div
        className="hidden md:flex flex-1 justify-center px-3 relative"
        role="search"
        aria-label="Search snippets"
      >
        <div className="relative w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitSearch()}
            onFocus={() => setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 150)} // delay so click works
            type="text"
            placeholder={SEARCH_PLACEHOLDER}
            aria-label="Search snippets"
            className="w-full pl-9 pr-20 py-2 rounded-lg border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={submitSearch}
            aria-label="Submit search"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-black px-3 py-1 rounded-md text-sm"
          >
            <Search className="w-4 h-4 mr-1" />
            Search
          </Button>
        </div>

        {/* History dropdown */}
        {showHistory && history.length > 0 && (
          <div className="absolute top-full mt-1 w-[400px] bg-white border border-gray-300 rounded-lg shadow-md z-50">
            {history.map((item, i) => (
              <button
                key={i}
                onMouseDown={() => handleSelectHistory(item)} // use onMouseDown so it fires before blur
                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right cluster */}
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
            <Link href="/login" aria-label="Login">
              <Button>Login</Button>
            </Link>
            <Link href="/signup" aria-label="Sign up">
              <Button variant="secondary">Sign Up</Button>
            </Link>
          </>
        )}
      </div>

      {/* Mobile toggle */}
      <div className="md:hidden">
        <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md px-4 py-4 space-y-4 z-50 md:hidden">
          <div
            className="flex w-full items-center gap-2"
            role="search"
            aria-label="Search snippets"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitSearch()}
              onFocus={() => setShowHistory(true)}
              onBlur={() => setTimeout(() => setShowHistory(false), 150)}
              type="text"
              placeholder={SEARCH_PLACEHOLDER}
              aria-label="Search snippets"
              className="flex-1 px-4 py-2 rounded-lg text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <Button
              variant="secondary"
              onClick={submitSearch}
              aria-label="Submit search"
            >
              <Search className="w-4 h-4 mr-1" />
              Search
            </Button>
          </div>

          {/* History dropdown (mobile) */}
          {showHistory && history.length > 0 && (
            <div className="mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-md z-50">
              {history.map((item, i) => (
                <button
                  key={i}
                  onMouseDown={() => handleSelectHistory(item)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          {session && (
            <Link href="/dashboard" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full">
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

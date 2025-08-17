"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { Button } from "../ui/button";

const SEARCH_PLACEHOLDER = "Search snippets...";
const STORAGE_KEY = "snippetSearchHistory";

export default function NavbarContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useSearchParams();

  const [q, setQ] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // ✅ Load search history on mount
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    setHistory(stored);
  }, []);

  // ✅ Submit search
  const submitSearch = () => {
    const trimmed = q.trim();
    if (!trimmed) return;

    // Push query to URL
    router.push(`/?q=${encodeURIComponent(trimmed)}`);

    // Save search history (dedupe + max 5)
    const newHistory = [trimmed, ...history.filter((h) => h !== trimmed)].slice(
      0,
      5
    );
    setHistory(newHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));

    // Clear input + close dropdowns
    setQ("");
    setIsOpen(false);
    setShowHistory(false);
  };

  // ✅ Select from history
  const handleSelectHistory = (value: string) => {
    router.push(`/?q=${encodeURIComponent(value)}`);
    setShowHistory(false);
  };

  // 🔎 Shared search input component (desktop + mobile)
  const SearchBox = ({ mobile = false }: { mobile?: boolean }) => (
    <div
      className={`relative ${mobile ? "w-full" : "w-[400px]"}`}
      role="search"
      aria-label="Search snippets"
    >
      {!mobile && (
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
      )}
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submitSearch()}
        onFocus={() => setShowHistory(true)}
        onBlur={() => setTimeout(() => setShowHistory(false), 150)} // allow click
        type="text"
        placeholder={SEARCH_PLACEHOLDER}
        aria-label="Search snippets"
        className={`w-full ${
          mobile ? "pl-4 pr-20" : "pl-9 pr-20"
        } py-2 rounded-lg border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-400`}
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

      {/* History dropdown */}
      {showHistory && history.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-md z-50">
          {history.map((item, i) => (
            <button
              key={i}
              onMouseDown={() => handleSelectHistory(item)} // before blur
              className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );

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
      <div className="hidden md:flex flex-1 justify-center px-3">
        <SearchBox />
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-2">
        {session && (
          <Button
            variant="secondary"
            className="ml-2"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Logout
          </Button>
        )}
      </div>

      {/* Mobile menu toggle */}
      <div className="md:hidden">
        <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md px-4 py-4 space-y-4 z-50 md:hidden">
          <SearchBox mobile />

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

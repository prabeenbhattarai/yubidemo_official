"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { searchItems, type SearchItem } from "@/lib/search";
import { SearchIcon } from "./Icons";

function highlight(text: string, query: string) {
  const q = query.trim();
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-brand/20 text-brand">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

export default function SearchModal({
  items,
  open,
  onClose,
}: {
  items: SearchItem[];
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchItems(items, query), [items, query]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* input */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-5">
          <SearchIcon className="h-5 w-5 shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services, projects, pages…"
            className="w-full py-4 text-[16px] text-ink outline-none placeholder:text-gray-400"
          />
          <button
            onClick={onClose}
            aria-label="Close search"
            className="shrink-0 rounded px-2 py-1 text-xs font-medium text-muted hover:bg-gray-100"
          >
            ESC
          </button>
        </div>

        {/* results */}
        <div className="max-h-[55vh] overflow-y-auto">
          {query.trim() === "" ? (
            <p className="px-5 py-8 text-center text-sm text-muted">
              Start typing to search the site.
            </p>
          ) : results.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted">
              No results for “{query}”. Try another term.
            </p>
          ) : (
            <ul className="py-2">
              {results.map((r) => (
                <li key={`${r.type}-${r.href}-${r.title}`}>
                  <Link
                    href={r.href}
                    onClick={onClose}
                    className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-gray-50"
                  >
                    <span className="mt-0.5 shrink-0 rounded bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                      {r.type}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-ink">
                        {highlight(r.title, query)}
                      </span>
                      <span className="mt-0.5 line-clamp-1 block text-[13px] text-muted">
                        {r.description}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

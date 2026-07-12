"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { adminSearch, searchKindLabels } from "../lib/adminSearch";
import { useStore } from "../lib/store";

type AdminQuickSearchProps = {
  placeholder?: string;
};

export function AdminQuickSearch({ placeholder = "Search item, customer, invoice or page..." }: AdminQuickSearchProps) {
  const router = useRouter();
  const { items, customers, invoices, repairs } = useStore();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(
    () => adminSearch(query, { items, customers, invoices, repairs }),
    [query, items, customers, invoices, repairs],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function pick(href: string) {
    setQuery("");
    setOpen(false);
    router.push(href);
  }

  const showPanel = open && query.trim().length > 0;

  return (
    <div className="admin-search-wrap" ref={wrapRef}>
      <div className="search-box">
        <Search size={18} />
        <input
          ref={inputRef}
          type="search"
          value={query}
          placeholder={placeholder}
          aria-label="Quick search"
          aria-expanded={showPanel}
          aria-controls="admin-search-results"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        <kbd>Ctrl K</kbd>
      </div>

      {showPanel ? (
        <div className="admin-search-panel" id="admin-search-results">
          {results.length ? (
            results.map((row) => (
              <button
                key={row.id}
                type="button"
                className="admin-search-row"
                onClick={() => pick(row.href)}
              >
                <span className="admin-search-kind">{searchKindLabels[row.kind]}</span>
                <span className="admin-search-label">{row.label}</span>
                <span className="admin-search-meta">{row.meta}</span>
              </button>
            ))
          ) : (
            <p className="admin-search-empty">No matches for &ldquo;{query.trim()}&rdquo;</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

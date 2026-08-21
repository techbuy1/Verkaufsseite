"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SearchIcon } from "./Icons";
import { SearchResults } from "./SearchResults";
import { searchProducts } from "@/lib/searchProducts";

interface SearchBarProps {
  className?: string;
  inputClassName?: string;
  onClose?: () => void;
  autoFocus?: boolean;
  variant?: "default" | "header";
}

export function SearchBar({
  className = "",
  inputClassName = "",
  onClose,
  autoFocus = false,
  variant = "default",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchProducts(query, 6), [query]);

  const inputStyles =
    variant === "header"
      ? "border-transparent bg-surface-hover py-2 pl-10 pr-4 focus:border-border focus:bg-surface-card focus:ring-0"
      : "border-border/80 bg-surface-soft py-2.5 pl-10 pr-4 focus:border-accent focus:bg-surface-card focus:ring-2 focus:ring-accent/15";

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSelect = () => {
    setOpen(false);
    setQuery("");
    onClose?.();
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      role="combobox"
      aria-expanded={open && query.trim().length > 0}
      aria-haspopup="listbox"
    >
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Nach Geräten suchen..."
          className={`w-full rounded-full text-[14px] text-text-primary placeholder:text-text-muted outline-none transition-all ${inputStyles} ${inputClassName}`}
          aria-label="Nach Geräten suchen"
        />
      </div>

      <SearchResults
        results={results}
        query={query}
        onSelect={handleSelect}
        visible={open}
      />
    </div>
  );
}

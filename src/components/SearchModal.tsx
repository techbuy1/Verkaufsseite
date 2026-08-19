"use client";

import { useEffect, useRef, useState } from "react";
import { useShop } from "@/context/ShopContext";
import { topOffers } from "@/data/products";
import { CloseIcon, SearchIcon } from "./Icons";
import { ProductImage } from "./ProductImage";

export function SearchModal() {
  const { isSearchOpen, closeSearch } = useShop();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim()
    ? topOffers.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase()),
      )
    : topOffers.slice(0, 4);

  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    if (isSearchOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, closeSearch]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center pt-20 px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeSearch}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-[640px] bg-white rounded-[20px] shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="flex items-center gap-3 border-b border-border/40 px-5 py-4">
          <SearchIcon className="h-5 w-5 text-text-secondary shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Produkte suchen…"
            className="flex-1 bg-transparent text-[17px] text-text-primary placeholder:text-text-secondary outline-none"
            aria-label="Produkte suchen"
          />
          <button
            onClick={closeSearch}
            className="p-1 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Suche schließen"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="max-h-[400px] overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-4 py-8 text-center text-text-secondary text-[15px]">
              Keine Produkte gefunden.
            </p>
          ) : (
            <ul>
              {results.map((product) => (
                <li key={product.id}>
                  <button
                    onClick={closeSearch}
                    className="flex w-full items-center gap-4 rounded-xl px-4 py-3 hover:bg-background-secondary transition-colors text-left"
                  >
                    <div className="h-14 w-14 shrink-0">
                      <ProductImage type={product.imageType} className="h-full w-full" />
                    </div>
                    <div>
                      <p className="text-[12px] text-text-secondary">{product.brand}</p>
                      <p className="text-[15px] font-medium text-text-primary">{product.name}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

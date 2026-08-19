"use client";

import Image from "next/image";
import Link from "next/link";
import type { SearchableProduct } from "@/lib/searchProducts";
import { formatPrice, getProductHref } from "@/lib/searchProducts";

interface SearchResultsProps {
  results: SearchableProduct[];
  query: string;
  onSelect: () => void;
  visible: boolean;
}

export function SearchResults({ results, query, onSelect, visible }: SearchResultsProps) {
  if (!visible || !query.trim()) return null;

  return (
    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[60] overflow-hidden rounded-[16px] border border-border/50 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
      {results.length === 0 ? (
        <p className="px-4 py-6 text-center text-[14px] text-text-secondary">
          Keine passenden Produkte gefunden.
        </p>
      ) : (
        <>
          <ul className="py-2">
            {results.map((product) => (
              <li key={product.id}>
                <Link
                  href={getProductHref(product.slug)}
                  onClick={onSelect}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-background-secondary"
                >
                  <div className="shop-product-thumb relative h-12 w-12 shrink-0 rounded-lg">
                    <Image
                      src={product.imageSrc}
                      alt={product.name}
                      fill
                      sizes="48px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium text-text-primary">
                      {product.name}
                    </p>
                    <p className="text-[12px] text-text-secondary">
                      {product.brand} · {product.category}
                    </p>
                  </div>
                  <p className="shrink-0 text-[14px] font-semibold text-text-primary">
                    {formatPrice(product.price)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t border-border/40 px-4 py-3">
            <Link
              href={`#angebote`}
              onClick={onSelect}
              className="text-[13px] font-medium text-accent hover:underline"
            >
              Alle Suchergebnisse anzeigen
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

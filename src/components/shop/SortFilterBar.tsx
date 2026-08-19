"use client";

import type { SortOption } from "@/lib/filterProducts";
import { SORT_OPTIONS } from "@/lib/filterProducts";

interface SortFilterBarProps {
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function SortFilterBar({ selectedSort, onSortChange }: SortFilterBarProps) {
  return (
    <div>
      <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-text-secondary">
        Sortieren
      </p>
      <div className="-mx-1 overflow-x-auto px-1 pb-1 scrollbar-hide">
        <div className="flex w-max min-w-full flex-nowrap gap-2 lg:flex-wrap lg:w-auto">
          {SORT_OPTIONS.map((option) => {
            const isActive = selectedSort === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onSortChange(option.id)}
                aria-pressed={isActive}
                className={`brand-chip ${isActive ? "brand-chip-active" : ""}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

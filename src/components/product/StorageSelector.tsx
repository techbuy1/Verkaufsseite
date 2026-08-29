"use client";

import { memo } from "react";
import type { StorageOption } from "@/types/product";

interface StorageSelectorProps {
  options: StorageOption[];
  selectedStorage: string;
  storageAvailability?: Record<string, number>;
  onChange: (storage: string) => void;
}

export const StorageSelector = memo(function StorageSelector({
  options,
  selectedStorage,
  storageAvailability,
  onChange,
}: StorageSelectorProps) {
  if (options.length === 0) return null;

  return (
    <div>
      <p className="mb-1 text-[15px] font-semibold tracking-tight text-text-primary">
        Speicher – Wieviel Platz brauchst du?
      </p>
      <p className="mb-4 text-[13px] text-text-secondary">Wähle die passende Speicherkapazität.</p>
      <div
        className="grid gap-2.5 sm:gap-3"
        style={{
          gridTemplateColumns: `repeat(${Math.min(options.length, 3)}, minmax(0, 1fr))`,
        }}
      >
        {options.map((option) => {
          const isAvailable = (storageAvailability?.[option.storage] ?? 0) > 0;
          const isSelected = isAvailable && option.storage === selectedStorage;

          return (
            <button
              key={option.storage}
              type="button"
              disabled={!isAvailable}
              aria-pressed={isSelected}
              aria-disabled={!isAvailable}
              aria-label={`Speicher ${option.storage}${isAvailable ? "" : " – Ausverkauft"}`}
              onClick={() => {
                if (!isAvailable) return;
                onChange(option.storage);
              }}
              className={`flex flex-col rounded-[16px] border px-2 py-4 text-[14px] font-medium transition-[border-color,box-shadow,opacity] duration-150 ${
                isSelected
                  ? "border-accent bg-surface-card text-text-primary shadow-[0_8px_24px_rgba(232,98,42,0.16)] ring-1 ring-accent/30"
                  : isAvailable
                    ? "border-border bg-surface-card text-text-primary shadow-[var(--shadow-card)] hover:border-text-muted/50"
                    : "cursor-not-allowed border-border/70 bg-background-secondary/80 text-text-secondary/70"
              }`}
            >
              <span>{option.storage}</span>
              {!isAvailable && (
                <span className="mt-0.5 text-[11px] font-normal text-text-secondary/70">
                  Ausverkauft
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});

"use client";

import type { StorageOption } from "@/types/product";

interface StorageSelectorProps {
  options: StorageOption[];
  selectedStorage: string;
  storageAvailability?: Record<string, number>;
  onChange: (storage: string) => void;
}

export function StorageSelector({
  options,
  selectedStorage,
  storageAvailability,
  onChange,
}: StorageSelectorProps) {
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
          const isSelected = option.storage === selectedStorage;
          const stock = storageAvailability?.[option.storage];
          const isAvailable = stock === undefined ? true : stock > 0;

          return (
            <button
              key={option.storage}
              type="button"
              aria-pressed={isSelected}
              aria-disabled={!isAvailable}
              aria-label={
                isAvailable
                  ? `Speicher ${option.storage}`
                  : `Speicher ${option.storage} — Nicht verfügbar`
              }
              disabled={!isAvailable}
              onClick={() => isAvailable && onChange(option.storage)}
            className={`rounded-[16px] border px-2 py-4 text-[14px] font-medium transition-all duration-200 ${
                !isAvailable
                  ? "cursor-not-allowed border-border bg-surface-hover text-text-muted opacity-70"
                  : isSelected
                    ? "border-accent bg-surface-card text-text-primary shadow-[0_8px_24px_rgba(232,98,42,0.16)] ring-1 ring-accent/30"
                    : "border-border bg-surface-card text-text-primary shadow-[var(--shadow-card)] hover:border-text-muted/50"
              }`}
            >
              <span>{option.storage}</span>
              {!isAvailable && (
                <span className="mt-0.5 block text-[11px] font-normal">Nicht verfügbar</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { memo } from "react";
import type { ProductImageVariant } from "@/types/product";

interface ColorSelectorProps {
  colors: ProductImageVariant[];
  selectedColorId: string;
  colorAvailability?: Record<string, boolean>;
  onChange: (colorId: string) => void;
}

function isLightSwatch(hex: string): boolean {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return false;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.82;
}

export const ColorSelector = memo(function ColorSelector({
  colors,
  selectedColorId,
  colorAvailability,
  onChange,
}: ColorSelectorProps) {
  if (colors.length === 0) return null;

  return (
    <div>
      <p className="mb-1 text-[15px] font-semibold tracking-tight text-text-primary">
        Farbe – Wie gefällt es dir am besten?
      </p>
      <p className="mb-4 text-[13px] text-text-secondary">Wähle die Farbe deines Geräts.</p>
      <div
        className="grid gap-2.5 sm:gap-3"
        style={{
          gridTemplateColumns: `repeat(${Math.min(colors.length, 3)}, minmax(0, 1fr))`,
        }}
      >
        {colors.map((color) => {
          const isAvailable = colorAvailability?.[color.id] ?? false;
          const isSelected = isAvailable && color.id === selectedColorId;
          const lightSwatch = isLightSwatch(color.colorCode);

          return (
            <button
              key={color.id}
              type="button"
              disabled={!isAvailable}
              aria-pressed={isSelected}
              aria-disabled={!isAvailable}
              aria-label={`Farbe ${color.colorName}${isAvailable ? "" : " – Ausverkauft"}`}
              onClick={() => {
                if (!isAvailable) return;
                onChange(color.id);
              }}
              className={`flex min-h-[96px] flex-col items-center justify-center rounded-[16px] border px-2 py-3.5 text-center transition-[border-color,box-shadow,opacity] duration-150 ${
                isSelected
                  ? "border-accent bg-surface-card shadow-[0_8px_24px_rgba(232,98,42,0.16)] ring-1 ring-accent/30"
                  : isAvailable
                    ? "border-border bg-surface-card shadow-[var(--shadow-card)] hover:border-text-muted/50 hover:shadow-[var(--shadow-card-hover)]"
                    : "cursor-not-allowed border-border/70 bg-background-secondary/80"
              }`}
            >
              <span
                className={`h-7 w-7 shrink-0 rounded-full ${
                  isAvailable ? "" : "opacity-40 grayscale"
                } ${lightSwatch ? "ring-1 ring-border" : "ring-1 ring-black/10"}`}
                style={{ backgroundColor: color.colorCode }}
              />
              <span
                className={`mt-2.5 text-[12px] font-medium leading-snug sm:text-[13px] ${
                  isAvailable ? "text-text-primary" : "text-text-secondary/70"
                }`}
              >
                {color.colorName}
              </span>
              {!isAvailable && (
                <span className="mt-0.5 text-[11px] font-medium text-text-secondary/70">
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

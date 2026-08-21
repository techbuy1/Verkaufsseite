"use client";

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

export function ColorSelector({
  colors,
  selectedColorId,
  colorAvailability,
  onChange,
}: ColorSelectorProps) {
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
          const isSelected = color.id === selectedColorId;
          const isAvailable = colorAvailability?.[color.id] ?? true;
          const lightSwatch = isLightSwatch(color.colorCode);

          return (
            <button
              key={color.id}
              type="button"
              aria-pressed={isSelected}
              aria-disabled={!isAvailable}
              aria-label={
                isAvailable
                  ? `Farbe ${color.colorName}`
                  : `Farbe ${color.colorName} — Derzeit nicht verfügbar`
              }
              title={!isAvailable ? "Derzeit nicht verfügbar" : undefined}
              disabled={!isAvailable}
              onClick={() => isAvailable && onChange(color.id)}
              className={`flex min-h-[96px] flex-col items-center justify-center rounded-[16px] border px-2 py-3.5 text-center transition-all duration-200 ${
                !isAvailable
                  ? "cursor-not-allowed border-border bg-surface-hover opacity-55"
                  : isSelected
                    ? "border-accent bg-surface-card shadow-[0_8px_24px_rgba(232,98,42,0.16)] ring-1 ring-accent/30"
                    : "border-border bg-surface-card shadow-[var(--shadow-card)] hover:border-text-muted/50 hover:shadow-[var(--shadow-card-hover)]"
              }`}
            >
              <span
                className={`h-7 w-7 shrink-0 rounded-full ${
                  lightSwatch ? "ring-1 ring-border" : "ring-1 ring-black/10"
                } ${!isAvailable ? "opacity-50 grayscale" : ""}`}
                style={{ backgroundColor: color.colorCode }}
              />
              <span className="mt-2.5 text-[12px] font-medium leading-snug text-text-primary sm:text-[13px]">
                {color.colorName}
              </span>
              {!isAvailable && (
                <span className="mt-1 text-[11px] text-text-muted">Nicht verfügbar</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

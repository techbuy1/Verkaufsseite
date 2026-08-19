"use client";

import type { ProductImageVariant } from "@/types/product";

interface ColorPickerProps {
  colors: ProductImageVariant[];
  selectedColorId: string;
  onChange: (colorId: string) => void;
}

export function ColorPicker({ colors, selectedColorId, onChange }: ColorPickerProps) {
  const selected =
    colors.find((color) => color.id === selectedColorId) ?? colors[0];

  return (
    <div>
      <p className="mb-3 text-[13px] font-medium text-[#6e6e73]">Farbe</p>
      <div className="flex flex-wrap items-center gap-3">
        {colors.map((color) => {
          const isSelected = color.id === selectedColorId;
          return (
            <button
              key={color.id}
              type="button"
              aria-label={`Farbe ${color.colorName}`}
              aria-pressed={isSelected}
              onClick={() => onChange(color.id)}
              className={`h-9 w-9 rounded-full transition-all duration-200 ${
                isSelected
                  ? "scale-110 ring-2 ring-[#1d1d1f] ring-offset-2 ring-offset-[#f5f5f7]"
                  : "hover:scale-105"
              }`}
              style={{ backgroundColor: color.colorCode }}
            />
          );
        })}
      </div>
      <p className="mt-3 text-[15px] font-medium text-[#1d1d1f]">
        {selected?.colorName}
      </p>
    </div>
  );
}

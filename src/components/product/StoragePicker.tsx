"use client";

import type { StorageOption } from "@/types/product";

interface StoragePickerProps {
  options: StorageOption[];
  selectedStorage: string;
  onChange: (storage: string) => void;
}

export function StoragePicker({
  options,
  selectedStorage,
  onChange,
}: StoragePickerProps) {
  return (
    <div>
      <p className="mb-3 text-[13px] font-medium text-[#6e6e73]">Speicher</p>
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {options.map((option) => {
          const isSelected = option.storage === selectedStorage;
          return (
            <button
              key={option.storage}
              type="button"
              onClick={() => onChange(option.storage)}
              className={`rounded-[16px] px-3 py-3.5 text-[14px] font-medium transition-all duration-200 sm:px-4 sm:py-4 ${
                isSelected
                  ? "bg-white text-[#1d1d1f] shadow-[0_4px_16px_rgba(0,0,0,0.08)] ring-2 ring-[#1d1d1f]"
                  : "bg-white/70 text-[#1d1d1f] hover:bg-white hover:shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
              }`}
            >
              {option.storage}
            </button>
          );
        })}
      </div>
    </div>
  );
}

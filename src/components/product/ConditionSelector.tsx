"use client";

import { memo, useState } from "react";
import { formatPrice } from "@/data/products";
import type { ConditionId } from "@/types/product";
import {
  CONDITION_DEFINITIONS,
  CONDITION_IDS,
  getConditionDescription,
} from "@/lib/conditions";

export interface ConditionSelectorOption {
  condition: ConditionId;
  label: string;
  price: number;
  stock: number;
  active: boolean;
  available: boolean;
  note?: string;
  savings?: number;
  basePrice?: number;
}

interface ConditionSelectorProps {
  options: ConditionSelectorOption[];
  selectedCondition: ConditionId;
  onChange: (condition: ConditionId) => void;
}

export const ConditionSelector = memo(function ConditionSelector({
  options,
  selectedCondition,
  onChange,
}: ConditionSelectorProps) {
  const [infoOpen, setInfoOpen] = useState(false);

  const visible = options.filter((option) => option.active);
  if (visible.length === 0) return null;

  const selected = visible.find((option) => option.condition === selectedCondition);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[15px] font-semibold tracking-tight text-text-primary">
          Zustand – Welcher Zustand passt zu dir?
        </p>
        <button
          type="button"
          onClick={() => setInfoOpen((open) => !open)}
          className="shrink-0 text-[12px] font-medium text-accent hover:underline"
        >
          {infoOpen ? "Infos schließen" : "Was bedeuten die Zustände?"}
        </button>
      </div>

      {infoOpen && (
        <div className="mb-3 space-y-2.5 rounded-[16px] border border-border bg-background-secondary p-3.5">
          {CONDITION_IDS.map((id) => (
            <div key={id}>
              <p className="text-[13px] font-semibold text-text-primary">
                {CONDITION_DEFINITIONS[id].label}
              </p>
              <p className="text-[12px] leading-relaxed text-text-secondary">
                {getConditionDescription(id)}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((option) => {
          const isAvailable = option.available;
          const isSelected = isAvailable && option.condition === selectedCondition;

          return (
            <button
              key={option.condition}
              type="button"
              disabled={!isAvailable}
              aria-pressed={isSelected}
              aria-disabled={!isAvailable}
              aria-label={`Zustand ${option.label}${isAvailable ? "" : " – Ausverkauft"}`}
              onClick={() => {
                if (!isAvailable) return;
                onChange(option.condition);
              }}
              className={`flex min-h-[64px] flex-col justify-center rounded-[16px] border px-3 py-3 text-left transition-[border-color,box-shadow,opacity] duration-150 ${
                isSelected
                  ? "border-accent bg-surface-card text-text-primary shadow-[0_8px_24px_rgba(232,98,42,0.16)] ring-1 ring-accent/30"
                  : isAvailable
                    ? "border-border bg-surface-card text-text-primary shadow-[var(--shadow-card)] hover:border-text-muted/50"
                    : "cursor-not-allowed border-border/70 bg-background-secondary/80 text-text-secondary/70"
              }`}
            >
              <span
                className={`block text-[14px] font-semibold leading-snug tracking-tight ${
                  isAvailable ? "text-text-primary" : "text-text-secondary/80"
                }`}
              >
                {option.label}
              </span>
              {isAvailable ? (
                <span className="mt-1 text-[13px] font-medium text-text-secondary">
                  {formatPrice(option.price)}
                </span>
              ) : (
                <span className="mt-1 text-[12px] font-medium text-text-secondary/70">
                  Ausverkauft
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selected?.note && (
        <p className="mt-3 text-[12px] leading-relaxed text-text-secondary">
          Hinweis: {selected.note}
        </p>
      )}
    </div>
  );
});

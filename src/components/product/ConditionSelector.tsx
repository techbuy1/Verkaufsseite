"use client";

import { useState } from "react";
import type { ConditionId } from "@/types/product";
import { CONDITION_DEFINITIONS, CONDITION_IDS, getConditionDescription } from "@/lib/conditions";
import { formatPrice } from "@/data/products";

export interface ConditionSelectorOption {
  condition: ConditionId;
  label: string;
  price: number;
  stock: number;
  active: boolean;
  available: boolean;
  note?: string;
}

interface ConditionSelectorProps {
  options: ConditionSelectorOption[];
  selectedCondition: ConditionId;
  onChange: (condition: ConditionId) => void;
}

export function ConditionSelector({
  options,
  selectedCondition,
  onChange,
}: ConditionSelectorProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const visible = options.filter((option) => option.active);
  if (visible.length === 0) return null;

  const selected = options.find((option) => option.condition === selectedCondition);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[15px] font-semibold tracking-tight text-text-primary">
          Zustand – Neu oder neuwertig?
        </p>
        <button
          type="button"
          onClick={() => setInfoOpen((open) => !open)}
          className="text-[12px] font-medium text-accent hover:underline"
        >
          {infoOpen ? "Infos schließen" : "Was bedeuten die Zustände?"}
        </button>
      </div>

      {infoOpen && (
        <div className="mb-3 space-y-2 rounded-[16px] border border-border bg-background-secondary p-3.5">
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

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {visible.map((option) => {
          const isSelected = option.condition === selectedCondition;
          const isAvailable = option.available;

          return (
            <button
              key={option.condition}
              type="button"
              aria-pressed={isSelected}
              aria-disabled={!isAvailable}
              disabled={!isAvailable}
              onClick={() => isAvailable && onChange(option.condition)}
              className={`rounded-[16px] border px-3 py-3.5 text-left transition-all duration-200 ${
                !isAvailable
                  ? "cursor-not-allowed border-border bg-surface-hover text-text-muted opacity-70"
                  : isSelected
                    ? "border-accent bg-surface-card text-text-primary shadow-[0_8px_24px_rgba(32,169,104,0.12)] ring-1 ring-accent/30"
                    : "border-border bg-surface-card text-text-primary shadow-[var(--shadow-card)] hover:border-text-muted/50"
              }`}
            >
              <span className="block text-[14px] font-medium">{option.label}</span>
              {isAvailable ? (
                <span className="mt-0.5 block text-[12px] font-normal opacity-80">
                  {formatPrice(option.price)}
                </span>
              ) : (
                <span className="mt-0.5 block text-[11px] font-normal">Nicht verfügbar</span>
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
}

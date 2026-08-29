import type { ConditionId } from "@/types/product";
import { CONDITION_IDS } from "@/lib/conditions";

/** Prozent des Basispreises (100 = voller Preis, 92 = 92 % des Basispreises). */
export type ConditionPricingRules = Record<ConditionId, number>;

export const DEFAULT_CONDITION_PERCENTAGES: ConditionPricingRules = {
  new: 100,
  like_new: 92,
  excellent: 85,
  very_good: 78,
  good: 68,
  heavily_used: 55,
  poor: 40,
};

const STORAGE_KEY = "techbuy-condition-pricing-rules-v1";

function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(200, Math.max(0, Math.round(value * 100) / 100));
}

export function normalizeConditionPricingRules(
  raw: Partial<Record<ConditionId, number>> | null | undefined,
): ConditionPricingRules {
  const normalized = { ...DEFAULT_CONDITION_PERCENTAGES };
  if (!raw) return normalized;

  for (const id of CONDITION_IDS) {
    const value = raw[id];
    if (typeof value === "number" && Number.isFinite(value)) {
      normalized[id] = clampPercentage(value);
    }
  }

  return normalized;
}

export function loadClientConditionPricingRules(): ConditionPricingRules {
  if (typeof window === "undefined") return { ...DEFAULT_CONDITION_PERCENTAGES };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CONDITION_PERCENTAGES };
    return normalizeConditionPricingRules(
      JSON.parse(raw) as Partial<Record<ConditionId, number>>,
    );
  } catch {
    return { ...DEFAULT_CONDITION_PERCENTAGES };
  }
}

export function saveClientConditionPricingRules(
  rules: ConditionPricingRules,
): ConditionPricingRules {
  const normalized = normalizeConditionPricingRules(rules);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  }
  return normalized;
}

export { STORAGE_KEY as CONDITION_PRICING_RULES_STORAGE_KEY };

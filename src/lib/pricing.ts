import type { ConditionId, ConditionOption, StorageOption } from "@/types/product";
import {
  DEFAULT_CONDITION_PERCENTAGES,
  loadClientConditionPricingRules,
  type ConditionPricingRules,
} from "@/lib/conditionPricingRules";
import {
  computeConditionPrice,
  getConditionPercentage,
  getEffectivePriceForConditionEntry,
  getNewBasePriceFromOption,
} from "@/lib/conditions";

export function roundMoney(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

let activeRules: ConditionPricingRules = { ...DEFAULT_CONDITION_PERCENTAGES };
let clientRulesCache: ConditionPricingRules | null = null;

export function setActiveConditionPricingRules(rules: ConditionPricingRules): void {
  activeRules = { ...DEFAULT_CONDITION_PERCENTAGES, ...rules };
  clientRulesCache = activeRules;
}

export function invalidateClientConditionPricingRulesCache(): void {
  clientRulesCache = null;
}

export function getActiveConditionPricingRules(): ConditionPricingRules {
  if (typeof window !== "undefined") {
    if (clientRulesCache === null) {
      clientRulesCache = loadClientConditionPricingRules();
    }
    return clientRulesCache;
  }
  return activeRules;
}

export function computePriceFromPercentage(
  basePrice: number,
  percentage: number,
): number {
  const base = roundMoney(basePrice);
  if (base <= 0) return 0;
  const pct = Number.isFinite(percentage) ? percentage : 0;
  return roundMoney((base * pct) / 100);
}

export function computeRuleBasedConditionPrice(
  basePrice: number,
  condition: ConditionId,
  rules: ConditionPricingRules = getActiveConditionPricingRules(),
): number {
  return computeConditionPrice(basePrice, condition, rules);
}

export interface EffectivePriceInput {
  basePrice: number;
  condition: ConditionId;
  priceOverride?: number | null;
}

/** @see getEffectivePriceForConditionEntry — zentrale Priorität: Override → Regel → Basis */
export function getEffectiveConditionPrice(input: EffectivePriceInput): number {
  if (input.condition === "new") {
    return roundMoney(input.basePrice);
  }
  if (input.priceOverride != null && input.priceOverride > 0) {
    return roundMoney(input.priceOverride);
  }
  return computeRuleBasedConditionPrice(input.basePrice, input.condition);
}

export function resolveConditionBasePrice(option: StorageOption): number {
  return getNewBasePriceFromOption(option);
}

export function getEffectivePriceForConditionOption(
  option: StorageOption,
  entry: ConditionOption,
  rules?: ConditionPricingRules,
): number {
  return getEffectivePriceForConditionEntry(option, entry, rules);
}

export interface ConditionPriceBreakdown {
  basePrice: number;
  rulePercentage: number;
  calculatedPrice: number;
  manualOverride: number | null;
  effectivePrice: number;
  usesManualOverride: boolean;
}

export function getConditionPriceBreakdown(
  option: StorageOption,
  entry: ConditionOption,
  rules: ConditionPricingRules = getActiveConditionPricingRules(),
): ConditionPriceBreakdown {
  const basePrice = resolveConditionBasePrice(option);
  const rulePercentage = getConditionPercentage(entry.condition, rules);
  const calculatedPrice = computeRuleBasedConditionPrice(
    basePrice,
    entry.condition,
    rules,
  );

  if (entry.condition === "new") {
    return {
      basePrice,
      rulePercentage: 100,
      calculatedPrice: basePrice,
      manualOverride: null,
      effectivePrice: basePrice,
      usesManualOverride: false,
    };
  }

  const usesManualOverride =
    (entry.priceOverride != null && entry.priceOverride > 0) ||
    (entry.priceOverride === undefined &&
      entry.price > 0 &&
      Math.abs(entry.price - calculatedPrice) > 0.005);

  const manualOverride =
    entry.priceOverride != null && entry.priceOverride > 0
      ? entry.priceOverride
      : usesManualOverride
        ? entry.price
        : null;

  const effectivePrice = getEffectivePriceForConditionEntry(option, entry, rules);

  return {
    basePrice,
    rulePercentage,
    calculatedPrice,
    manualOverride,
    effectivePrice,
    usesManualOverride,
  };
}

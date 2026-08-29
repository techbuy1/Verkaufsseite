import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { ConditionId } from "@/types/product";
import {
  DEFAULT_CONDITION_PERCENTAGES,
  normalizeConditionPricingRules,
  type ConditionPricingRules,
} from "@/lib/conditionPricingRules";
import { setActiveConditionPricingRules } from "@/lib/pricing";

const DATA_DIR = path.join(process.cwd(), ".data");
const RULES_FILE = path.join(DATA_DIR, "condition-pricing-rules.json");

export async function readServerConditionPricingRules(): Promise<ConditionPricingRules> {
  try {
    const raw = await readFile(RULES_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<Record<ConditionId, number>>;
    const normalized = normalizeConditionPricingRules(parsed);
    setActiveConditionPricingRules(normalized);
    return normalized;
  } catch {
    setActiveConditionPricingRules(DEFAULT_CONDITION_PERCENTAGES);
    return { ...DEFAULT_CONDITION_PERCENTAGES };
  }
}

export async function writeServerConditionPricingRules(
  rules: Partial<Record<ConditionId, number>>,
): Promise<ConditionPricingRules> {
  const normalized = normalizeConditionPricingRules(rules);
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(RULES_FILE, JSON.stringify(normalized, null, 2), "utf8");
  setActiveConditionPricingRules(normalized);
  return normalized;
}

export { RULES_FILE as CONDITION_PRICING_RULES_FILE };

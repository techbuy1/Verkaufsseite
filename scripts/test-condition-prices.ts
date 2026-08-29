/**
 * Tests für zentrale Zustands-Preisregeln und manuelle Overrides.
 * Usage: npx tsx --tsconfig tsconfig.json scripts/test-condition-prices.ts
 */
import assert from "node:assert/strict";
import {
  applyConditionPatch,
  computeConditionPrice,
  ensureStorageConditions,
  getEffectivePriceForConditionEntry,
} from "../src/lib/conditions.ts";
import { DEFAULT_CONDITION_PERCENTAGES } from "../src/lib/conditionPricingRules.ts";
import { getProductPrice } from "../src/lib/productVariants.ts";
import { setActiveConditionPricingRules } from "../src/lib/pricing.ts";
import type { PremiumProduct, StorageOption } from "../src/types/product.ts";

const rules = {
  ...DEFAULT_CONDITION_PERCENTAGES,
  like_new: 90,
};

setActiveConditionPricingRules(rules);

function baseOption(overrides: Partial<StorageOption> = {}): StorageOption {
  return {
    storage: "128 GB",
    price: 500,
    stock: 0,
    conditions: [
      { condition: "new", label: "Neu", price: 500, stock: 5, active: true },
      {
        condition: "like_new",
        label: "Wie neu",
        price: 0,
        stock: 3,
        active: true,
        priceOverride: undefined,
      },
    ],
    ...overrides,
  };
}

function asProduct(option: StorageOption): PremiumProduct {
  return {
    id: "test-phone",
    slug: "test-phone",
    name: "Test Phone",
    brand: "Test",
    catalogCategory: "smartphones",
    images: [{ id: "gray", colorName: "Gray", colorCode: "#888", image: "/x.png" }],
    storageOptions: [option],
    variants: [
      {
        id: "gray",
        colorName: "Gray",
        colorCode: "#888",
        image: "/x.png",
        storageOptions: [option],
      },
    ],
    stock: 0,
  } as unknown as PremiumProduct;
}

// TEST A — Regel ohne Override
{
  const option = ensureStorageConditions(baseOption(), 0, rules);
  const likeNew = option.conditions!.find((c) => c.condition === "like_new")!;
  const price = getEffectivePriceForConditionEntry(option, likeNew, rules);
  assert.equal(price, 450);
  console.log("TEST A OK: 500 × 90 % = 450 €");
}

// TEST B — Manueller Override
{
  const option = ensureStorageConditions(
    baseOption({
      conditions: [
        { condition: "new", label: "Neu", price: 500, stock: 5, active: true },
        {
          condition: "like_new",
          label: "Wie neu",
          price: 450,
          stock: 3,
          active: true,
          priceOverride: 429,
        },
      ],
    }),
    0,
    rules,
  );
  const likeNew = option.conditions!.find((c) => c.condition === "like_new")!;
  assert.equal(getEffectivePriceForConditionEntry(option, likeNew, rules), 429);
  console.log("TEST B OK: Override 429 €");
}

// TEST C — Override entfernen
{
  let option = applyConditionPatch(baseOption(), "like_new", { priceOverride: 429 });
  option = applyConditionPatch(option, "like_new", { priceOverride: null });
  const likeNew = option.conditions!.find((c) => c.condition === "like_new")!;
  assert.equal(getEffectivePriceForConditionEntry(option, likeNew, rules), 450);
  console.log("TEST C OK: Override gelöscht → 450 €");
}

// TEST D — Globale Regel 90 → 85
{
  const changedRules = { ...rules, like_new: 85 };
  const option = ensureStorageConditions(baseOption(), 0, changedRules);
  const likeNew = option.conditions!.find((c) => c.condition === "like_new")!;
  assert.equal(getEffectivePriceForConditionEntry(option, likeNew, changedRules), 425);
  console.log("TEST D OK: Regel 85 % → 425 €");
}

// TEST E — Override bleibt bei Regeländerung
{
  const changedRules = { ...rules, like_new: 85 };
  const option = ensureStorageConditions(
    baseOption({
      conditions: [
        { condition: "new", label: "Neu", price: 500, stock: 5, active: true },
        {
          condition: "like_new",
          label: "Wie neu",
          price: 429,
          stock: 3,
          active: true,
          priceOverride: 429,
        },
      ],
    }),
    0,
    changedRules,
  );
  const likeNew = option.conditions!.find((c) => c.condition === "like_new")!;
  assert.equal(getEffectivePriceForConditionEntry(option, likeNew, changedRules), 429);
  console.log("TEST E OK: Override bleibt 429 €");
}

// TEST F — Override nur für 128 GB
{
  const option128 = ensureStorageConditions(
    baseOption({
      conditions: [
        { condition: "new", label: "Neu", price: 500, stock: 5, active: true },
        {
          condition: "like_new",
          label: "Wie neu",
          price: 429,
          stock: 2,
          active: true,
          priceOverride: 429,
        },
      ],
    }),
    0,
    rules,
  );
  const option256 = ensureStorageConditions(
    {
      storage: "256 GB",
      price: 550,
      stock: 0,
      conditions: [
        { condition: "new", label: "Neu", price: 550, stock: 4, active: true },
        {
          condition: "like_new",
          label: "Wie neu",
          price: 0,
          stock: 1,
          active: true,
        },
      ],
    },
    0,
    rules,
  );
  const ln128 = option128.conditions!.find((c) => c.condition === "like_new")!;
  const ln256 = option256.conditions!.find((c) => c.condition === "like_new")!;
  assert.equal(getEffectivePriceForConditionEntry(option128, ln128, rules), 429);
  assert.equal(getEffectivePriceForConditionEntry(option256, ln256, rules), 495);
  console.log("TEST F OK: Override nur 128 GB");
}

// Legacy — individuelle Preise bleiben als impliziter Override erhalten
{
  const legacy = ensureStorageConditions({
    storage: "128 GB",
    price: 1049,
    stock: 0,
    conditions: [
      { condition: "new", label: "Neu", price: 1049, stock: 0, active: true },
      { condition: "like_new", label: "Wie neu", price: 900, stock: 0, active: true },
      { condition: "excellent", label: "Hervorragend", price: 850, stock: 0, active: true },
    ],
  });
  assert.equal(
    legacy.conditions?.find((c) => c.condition === "like_new")?.priceOverride,
    900,
  );
  const product = asProduct(legacy);
  assert.equal(getProductPrice(product, "128 GB", "gray", "like_new"), 900);
  console.log("Legacy OK: gespeicherte Abweichungen → impliziter Override");
}

console.log("\nAlle Preis-Tests bestanden.");

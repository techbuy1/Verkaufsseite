/**
 * Smoke test: individuelle Zustandspreise bleiben erhalten und werden für Checkout genutzt.
 * Usage: npx tsx --tsconfig tsconfig.json scripts/test-condition-prices.ts
 */
import assert from "node:assert/strict";
import {
  applyConditionPatch,
  ensureStorageConditions,
} from "../src/lib/conditions.ts";
import { getProductPrice } from "../src/lib/productVariants.ts";
import type { PremiumProduct, StorageOption } from "../src/types/product.ts";

const option: StorageOption = {
  storage: "128 GB",
  price: 1049,
  stock: 0,
  conditions: [
    { condition: "new", label: "Neu", price: 1049, stock: 0, active: true },
    { condition: "like_new", label: "Wie neu", price: 900, stock: 0, active: true },
    { condition: "excellent", label: "Hervorragend", price: 850, stock: 0, active: true },
  ],
};

const ensured = ensureStorageConditions(option);
assert.equal(ensured.conditions?.find((c) => c.condition === "like_new")?.price, 900);
assert.equal(ensured.conditions?.find((c) => c.condition === "excellent")?.price, 850);
assert.equal(ensured.conditions?.find((c) => c.condition === "new")?.price, 1049);

const patched = applyConditionPatch(ensured, "like_new", { price: 777.5 });
assert.equal(patched.conditions?.find((c) => c.condition === "like_new")?.price, 777.5);
assert.equal(patched.conditions?.find((c) => c.condition === "excellent")?.price, 850);

const product = {
  id: "test-phone",
  slug: "test-phone",
  name: "Test Phone",
  brand: "Test",
  catalogCategory: "smartphones",
  images: [{ id: "navy", colorName: "Navy", colorCode: "#000", image: "/x.png" }],
  storageOptions: [patched],
  variants: [
    {
      id: "navy",
      colorName: "Navy",
      colorCode: "#000",
      image: "/x.png",
      storageOptions: [patched],
    },
  ],
  stock: 0,
} as unknown as PremiumProduct;

assert.equal(getProductPrice(product, "128 GB", "navy", "like_new"), 777.5);
assert.equal(getProductPrice(product, "128 GB", "navy", "excellent"), 850);
assert.equal(getProductPrice(product, "128 GB", "navy", "new"), 1049);

console.log("OK: individuelle Zustandspreise bleiben erhalten und werden übernommen.");

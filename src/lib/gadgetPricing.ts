import type { Product } from "@/data/products";

/** productId → manueller Verkaufspreis (Brutto, wie überall im Shop). */
export type GadgetPriceOverrides = Record<string, number>;

let activeOverrides: GadgetPriceOverrides = {};

export function setActiveGadgetPriceOverrides(overrides: GadgetPriceOverrides): void {
  activeOverrides = overrides;
}

export function getActiveGadgetPriceOverrides(): GadgetPriceOverrides {
  return activeOverrides;
}

/**
 * Wendet einen manuellen Preis-Override an, sofern einer für dieses Produkt
 * existiert — sonst bleibt der Katalogpreis (Basispreis) unverändert. Das ist
 * die einzige Stelle, an der Zubehör-Produkte ihren Verkaufspreis bekommen;
 * alle Shop-Oberflächen (PDP, Karten, Cart, Checkout) laufen darüber, damit
 * nirgendwo ein zweiter, abweichender Preis entstehen kann.
 */
export function applyGadgetPriceOverride(
  product: Product,
  overrides: GadgetPriceOverrides = getActiveGadgetPriceOverrides(),
): Product {
  const override = overrides[product.id];
  if (override == null || !(override > 0)) return product;
  return { ...product, price: Math.round(override * 100) / 100 };
}

export function validateGadgetPrice(value: unknown): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Preis ist ungültig.";
  }
  if (value <= 0) {
    return "Preis muss größer als 0 € sein.";
  }
  return null;
}

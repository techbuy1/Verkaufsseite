import type { CatalogCategoryId } from "@/data/catalogCategories";
import type { Product } from "@/data/products";
import {
  getPremiumProductById,
  getPremiumProductBySlug,
  premiumProducts,
} from "@/data/premiumCatalog";
import { premiumToLegacyProduct } from "@/lib/productAdapters";
import {
  isProductInStock,
} from "@/lib/productAvailability";
import type { PremiumProduct } from "@/types/product";
import { accessoryProducts } from "@/data/accessoryCatalog";
import { applyGadgetPriceOverride } from "@/lib/gadgetPricing";
import { applyEbayInventoryOverlay } from "@/lib/ebayInventoryOverlay";

/**
 * Der Gerätekatalog mit realem eBay-Bestand + eBay-Preisen darübergelegt
 * (siehe `ebayInventoryOverlay.ts`). Modul-weit gecacht — die Overlay-Daten
 * sind pro Build statisch.
 */
let overlaidCatalogCache: PremiumProduct[] | null = null;
function getOverlaidCatalog(): PremiumProduct[] {
  if (!overlaidCatalogCache) {
    overlaidCatalogCache = applyEbayInventoryOverlay(premiumProducts);
  }
  return overlaidCatalogCache;
}

export function getAllPremiumProducts(): PremiumProduct[] {
  return getOverlaidCatalog();
}

export function resolvePremiumProduct(id: string): PremiumProduct | undefined {
  const overlaid = getOverlaidCatalog().find((product) => product.id === id);
  if (overlaid) return overlaid;
  const raw = getPremiumProductById(id);
  return raw ? getOverlaidCatalog().find((product) => product.slug === raw.slug) : undefined;
}

export function resolvePremiumProductBySlug(slug: string): PremiumProduct | undefined {
  return (
    getOverlaidCatalog().find((product) => product.slug === slug) ??
    (getPremiumProductBySlug(slug)
      ? getOverlaidCatalog().find(
          (product) => product.slug === getPremiumProductBySlug(slug)!.slug,
        )
      : undefined)
  );
}

export function getAllDeviceProducts(): Product[] {
  return getAllPremiumProducts().map(premiumToLegacyProduct);
}

export function getShopPremiumProducts(): PremiumProduct[] {
  return getAllPremiumProducts().filter(isProductInStock);
}

/** Homepage: nur Geräte mit Bestand (bzw. Vorverkauf). */
export function getHomepagePremiumProducts(): PremiumProduct[] {
  return getAllPremiumProducts().filter(isProductInStock);
}

export function getShopDeviceProducts(): Product[] {
  return getShopPremiumProducts().map(premiumToLegacyProduct);
}

export function getHomepageDeviceProducts(): Product[] {
  return getHomepagePremiumProducts().map(premiumToLegacyProduct);
}

/**
 * Alle Zubehör-Produkte mit angewendetem manuellem Preis-Override (Admin >
 * Gadget-Preise) — die einzige Stelle, an der der reale Verkaufspreis für
 * Zubehör entsteht. Jeder Konsument (PDP, Karten, Checkout) muss hierüber
 * gehen statt den rohen Katalog direkt zu importieren.
 */
export function getAccessoryProducts(): Product[] {
  return accessoryProducts.map((product) => applyGadgetPriceOverride(product));
}

/**
 * Zubehör für Listings (Store-Grid, Homepage-Rails) — ohne Legacy-Alias-
 * Einträge, die nur für ältere Empfehlungslisten per ID auflösbar bleiben
 * müssen (siehe `hiddenFromListing` in accessoryCatalog.ts).
 */
function getListableAccessoryProducts(): Product[] {
  return getAccessoryProducts().filter((product) => !product.hiddenFromListing);
}

export function getAllCatalogProducts(): Product[] {
  return [...getAllDeviceProducts(), ...getListableAccessoryProducts()];
}

export function getShopCatalogProducts(): Product[] {
  return [...getShopDeviceProducts(), ...getListableAccessoryProducts()];
}

/** Homepage-Kategorien: nur lagernde Geräte (+ Zubehör ohne Bestandsführung). */
export function getHomepageCatalogProducts(): Product[] {
  return [...getHomepageDeviceProducts(), ...getListableAccessoryProducts()];
}

export function getCatalogProductsByCategory(categoryId: CatalogCategoryId): Product[] {
  return getShopCatalogProductsByCategory(categoryId);
}

export function getShopCatalogProductsByCategory(categoryId: CatalogCategoryId): Product[] {
  const devices = getShopPremiumProducts()
    .filter((product) => product.catalogCategory === categoryId)
    .map(premiumToLegacyProduct);
  const accessories = getListableAccessoryProducts().filter(
    (product) => product.catalogCategory === categoryId,
  );
  return [...devices, ...accessories];
}

export function getHomepageCatalogProductsByCategory(
  categoryId: CatalogCategoryId,
): Product[] {
  const devices = getHomepagePremiumProducts()
    .filter((product) => product.catalogCategory === categoryId)
    .map(premiumToLegacyProduct);
  const accessories = getListableAccessoryProducts().filter(
    (product) => product.catalogCategory === categoryId,
  );
  return [...devices, ...accessories];
}

export function getProductsByBrandAndCategory(
  brand: string,
  categoryId?: CatalogCategoryId,
): Product[] {
  const base = categoryId
    ? getShopCatalogProductsByCategory(categoryId)
    : getShopCatalogProducts();

  if (brand === "all") return base;

  return base.filter(
    (product) => product.brand.toLowerCase() === brand.toLowerCase(),
  );
}

export function getCatalogProductById(id: string): Product | undefined {
  const premium = resolvePremiumProduct(id);
  if (premium) return premiumToLegacyProduct(premium);
  return getAccessoryProducts().find((product) => product.id === id);
}

export function getCatalogProductBySlug(slug: string): Product | undefined {
  const premium = resolvePremiumProductBySlug(slug);
  if (premium) return premiumToLegacyProduct(premium);
  return getAccessoryProducts().find((product) => product.slug === slug);
}

export function getPremiumGenerations(categoryId?: CatalogCategoryId): string[] {
  const products = categoryId
    ? getAllPremiumProducts().filter((p) => p.catalogCategory === categoryId)
    : getAllPremiumProducts();
  return [...new Set(products.map((p) => p.generation))].sort().reverse();
}

export function getPremiumBrands(categoryId?: CatalogCategoryId): string[] {
  const products = categoryId
    ? getAllPremiumProducts().filter((p) => p.catalogCategory === categoryId)
    : getAllPremiumProducts();
  return [...new Set(products.map((p) => p.brand))].sort();
}

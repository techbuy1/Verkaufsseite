import type { CatalogCategoryId } from "@/data/catalogCategories";
import type { Product } from "@/data/products";
import {
  getPremiumProductById,
  getPremiumProductBySlug,
  premiumProducts,
} from "@/data/premiumCatalog";
import { premiumToLegacyProduct } from "@/lib/productAdapters";
import { isProductInStock, isProductVisibleInShop } from "@/lib/productAvailability";
import type { PremiumProduct } from "@/types/product";
import { accessoryProducts } from "@/data/accessoryCatalog";
import { applyGadgetPriceOverride } from "@/lib/gadgetPricing";
import {
  buildEbayPremiumProducts,
  getEbayLegacyProducts,
  getEbayProductById,
  getEbayProductBySlug,
  isEbayInventoryActive,
} from "@/lib/ebayInventorySync";

export function getEbayPremiumCatalog(): PremiumProduct[] {
  return buildEbayPremiumProducts();
}

export function resolvePremiumProduct(id: string): PremiumProduct | undefined {
  return getEbayProductById(id) ?? getPremiumProductById(id);
}

export function resolvePremiumProductBySlug(slug: string): PremiumProduct | undefined {
  return getEbayProductBySlug(slug) ?? getPremiumProductBySlug(slug);
}

/** Admin / intern — Seed-Katalog bleibt verfügbar, Shop nutzt nur eBay + Zubehör. */
export function getAllPremiumProducts(): PremiumProduct[] {
  if (isEbayInventoryActive()) {
    return getEbayPremiumCatalog();
  }
  return premiumProducts;
}

export function getAllDeviceProducts(): Product[] {
  return getAllPremiumProducts().map(premiumToLegacyProduct);
}

/** Nur eBay-Bestand mit Lager — keine Demo-/Seed-Geräte. */
export function getShopPremiumProducts(): PremiumProduct[] {
  if (isEbayInventoryActive()) {
    return getEbayPremiumCatalog().filter(isProductInStock);
  }
  return premiumProducts.filter(isProductInStock);
}

export function getHomepagePremiumProducts(): PremiumProduct[] {
  return getShopPremiumProducts();
}

export function getShopDeviceProducts(): Product[] {
  return getShopPremiumProducts().map(premiumToLegacyProduct);
}

export function getHomepageDeviceProducts(): Product[] {
  if (isEbayInventoryActive()) {
    return getEbayLegacyProducts();
  }
  return getHomepagePremiumProducts().map(premiumToLegacyProduct);
}

export function getAccessoryProducts(): Product[] {
  return accessoryProducts.map((product) => applyGadgetPriceOverride(product));
}

export function getListableAccessoryProducts(): Product[] {
  return getAccessoryProducts().filter((product) => !product.hiddenFromListing);
}

/** Shop-Listings: eBay-Bestand + Zubehör — kein Demo-Katalog. */
export function getShopCatalogProducts(): Product[] {
  if (isEbayInventoryActive()) {
    return [...getEbayLegacyProducts(), ...getListableAccessoryProducts()];
  }
  return [...getShopDeviceProducts(), ...getListableAccessoryProducts()];
}

export function getHomepageCatalogProducts(): Product[] {
  return getShopCatalogProducts();
}

/** Alias — Shop-Katalog (eBay + Zubehör). */
export function getAllCatalogProducts(): Product[] {
  return getShopCatalogProducts();
}

export function getCatalogProductsByCategory(categoryId: CatalogCategoryId): Product[] {
  return getShopCatalogProductsByCategory(categoryId);
}

export function getShopCatalogProductsByCategory(categoryId: CatalogCategoryId): Product[] {
  if (isEbayInventoryActive()) {
    const devices = getEbayLegacyProducts().filter(
      (product) => product.catalogCategory === categoryId,
    );
    const accessories = getListableAccessoryProducts().filter(
      (product) => product.catalogCategory === categoryId,
    );
    return [...devices, ...accessories];
  }

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
  return getShopCatalogProductsByCategory(categoryId);
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
  const ebayLegacy = getEbayLegacyProducts().find((product) => product.id === id);
  if (ebayLegacy) return ebayLegacy;

  const accessory = getAccessoryProducts().find((product) => product.id === id);
  if (accessory) return accessory;

  const premium = getPremiumProductById(id);
  if (premium && isProductVisibleInShop(premium)) {
    return premiumToLegacyProduct(premium);
  }

  return undefined;
}

export function getCatalogProductBySlug(slug: string): Product | undefined {
  const ebayLegacy = getEbayLegacyProducts().find((product) => product.slug === slug);
  if (ebayLegacy) return ebayLegacy;

  const accessory = getAccessoryProducts().find((product) => product.slug === slug);
  if (accessory) return accessory;

  const premium = getPremiumProductBySlug(slug);
  if (premium && isProductVisibleInShop(premium)) {
    return premiumToLegacyProduct(premium);
  }

  return undefined;
}

export function getPremiumGenerations(categoryId?: CatalogCategoryId): string[] {
  const products = categoryId
    ? getShopPremiumProducts().filter((p) => p.catalogCategory === categoryId)
    : getShopPremiumProducts();
  return [...new Set(products.map((p) => p.generation))].sort().reverse();
}

export function getPremiumBrands(categoryId?: CatalogCategoryId): string[] {
  const products = categoryId
    ? getShopPremiumProducts().filter((p) => p.catalogCategory === categoryId)
    : getShopPremiumProducts();
  return [...new Set(products.map((p) => p.brand))].sort();
}

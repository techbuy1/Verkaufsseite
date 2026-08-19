import type { CatalogCategoryId } from "@/data/catalogCategories";
import type { Product } from "@/data/products";
import {
  getPremiumProductById,
  getPremiumProductBySlug,
  premiumProducts,
} from "@/data/premiumCatalog";
import { premiumToLegacyProduct } from "@/lib/productAdapters";
import { isProductVisibleInShop } from "@/lib/productAvailability";
import { getProductById as getStoredProductById, loadProducts } from "@/lib/productStore";
import type { PremiumProduct } from "@/types/product";
import { accessoryProducts } from "@/data/accessoryCatalog";

export function getAllPremiumProducts(): PremiumProduct[] {
  if (typeof window !== "undefined") {
    return loadProducts();
  }
  return premiumProducts;
}

export function resolvePremiumProduct(id: string): PremiumProduct | undefined {
  return getStoredProductById(id) ?? getPremiumProductById(id);
}

export function resolvePremiumProductBySlug(slug: string): PremiumProduct | undefined {
  if (typeof window !== "undefined") {
    const stored = loadProducts().find((product) => product.slug === slug);
    if (stored) return stored;
  }
  return getPremiumProductBySlug(slug);
}

export function getAllDeviceProducts(): Product[] {
  return getAllPremiumProducts().map(premiumToLegacyProduct);
}

export function getShopPremiumProducts(): PremiumProduct[] {
  return getAllPremiumProducts().filter(isProductVisibleInShop);
}

export function getShopDeviceProducts(): Product[] {
  return getShopPremiumProducts().map(premiumToLegacyProduct);
}

export function getAllCatalogProducts(): Product[] {
  return [...getAllDeviceProducts(), ...accessoryProducts];
}

export function getShopCatalogProducts(): Product[] {
  return [...getShopDeviceProducts(), ...accessoryProducts];
}

export function getCatalogProductsByCategory(categoryId: CatalogCategoryId): Product[] {
  const devices = getAllPremiumProducts()
    .filter((product) => product.catalogCategory === categoryId)
    .map(premiumToLegacyProduct);
  const accessories = accessoryProducts.filter(
    (product) => product.catalogCategory === categoryId,
  );
  return [...devices, ...accessories];
}

export function getShopCatalogProductsByCategory(categoryId: CatalogCategoryId): Product[] {
  const devices = getShopPremiumProducts()
    .filter((product) => product.catalogCategory === categoryId)
    .map(premiumToLegacyProduct);
  const accessories = accessoryProducts.filter(
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
  return accessoryProducts.find((product) => product.id === id);
}

export function getCatalogProductBySlug(slug: string): Product | undefined {
  const premium = resolvePremiumProductBySlug(slug);
  if (premium) return premiumToLegacyProduct(premium);
  return accessoryProducts.find((product) => product.slug === slug);
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

import type { CatalogCategoryId } from "./catalogCategories";
import type { Product } from "./products";
import {
  getCatalogProductById,
  getShopCatalogProducts,
  getShopCatalogProductsByCategory as getShopByCategory,
} from "@/lib/catalog";

export function getCatalogProductsByCategory(
  categoryId: CatalogCategoryId,
): Product[] {
  return getShopByCategory(categoryId);
}

export function getProductById(id: string): Product | undefined {
  return getCatalogProductById(id);
}

export { premiumProducts } from "./premiumCatalog";

/** Lazy accessor — vermeidet zirkuläre Imports beim Modul-Init */
export function getCatalogProducts(): Product[] {
  return getShopCatalogProducts();
}

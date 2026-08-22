import type { CatalogCategoryId } from "./catalogCategories";
import type { Product } from "./products";
import {
  getCatalogProductById,
  getHomepageCatalogProductsByCategory,
  getShopCatalogProducts,
  getShopCatalogProductsByCategory as getShopByCategory,
} from "@/lib/catalog";

export function getCatalogProductsByCategory(
  categoryId: CatalogCategoryId,
): Product[] {
  return getShopByCategory(categoryId);
}

/** Homepage-Karussell: nur lagernde Geräte. */
export function getHomepageProductsByCategory(
  categoryId: CatalogCategoryId,
): Product[] {
  return getHomepageCatalogProductsByCategory(categoryId);
}

export function getProductById(id: string): Product | undefined {
  return getCatalogProductById(id);
}

export { premiumProducts } from "./premiumCatalog";

/** Lazy accessor — vermeidet zirkuläre Imports beim Modul-Init */
export function getCatalogProducts(): Product[] {
  return getShopCatalogProducts();
}

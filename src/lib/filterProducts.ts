import type { Product } from "@/data/products";
import { resolvePremiumProductBySlug } from "@/lib/catalog";
import { getProductVariants } from "@/lib/productVariants";

export type BrandFilterValue =
  | "all"
  | "apple"
  | "samsung"
  | "google"
  | "xiaomi"
  | "oneplus";

export type SortOption = "recommended" | "newest" | "price-asc" | "price-desc" | "name-asc";

export interface CatalogFilters {
  brand: BrandFilterValue;
  sort: SortOption;
  model: string;
  generation: string;
  storage: string;
  color: string;
  minPrice: number | null;
  maxPrice: number | null;
}

export const DEFAULT_CATALOG_FILTERS: CatalogFilters = {
  brand: "all",
  sort: "recommended",
  model: "all",
  generation: "all",
  storage: "all",
  color: "all",
  minPrice: null,
  maxPrice: null,
};

export const BRAND_FILTER_OPTIONS: { id: BrandFilterValue; label: string }[] = [
  { id: "all", label: "Alle" },
  { id: "apple", label: "Apple" },
  { id: "samsung", label: "Samsung" },
  { id: "google", label: "Google" },
  { id: "xiaomi", label: "Xiaomi" },
  { id: "oneplus", label: "OnePlus" },
];

export const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "recommended", label: "Empfohlen" },
  { id: "newest", label: "Neueste" },
  { id: "price-asc", label: "Preis aufsteigend" },
  { id: "price-desc", label: "Preis absteigend" },
  { id: "name-asc", label: "Name A-Z" },
];

const BRAND_LABELS: Record<Exclude<BrandFilterValue, "all">, string> = {
  apple: "Apple",
  samsung: "Samsung",
  google: "Google",
  xiaomi: "Xiaomi",
  oneplus: "OnePlus",
};

export function filterProductsByBrand(
  products: Product[],
  brand: BrandFilterValue,
): Product[] {
  if (brand === "all") return products;

  const label = BRAND_LABELS[brand];
  return products.filter(
    (product) => product.brand.toLowerCase() === label.toLowerCase(),
  );
}

export function sortProducts(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products];

  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "de"));
    case "newest":
      return sorted.sort((a, b) => {
        const premiumA = resolvePremiumProductBySlug(a.slug);
        const premiumB = resolvePremiumProductBySlug(b.slug);
        const genA = premiumA?.generation ?? "";
        const genB = premiumB?.generation ?? "";
        if (genA !== genB) return genB.localeCompare(genA, "de");
        const aNew = a.badge === "Neu" ? 1 : 0;
        const bNew = b.badge === "Neu" ? 1 : 0;
        if (aNew !== bNew) return bNew - aNew;
        return a.name.localeCompare(b.name, "de");
      });
    case "recommended":
    default:
      return sorted.sort((a, b) => {
        const premiumA = resolvePremiumProductBySlug(a.slug);
        const premiumB = resolvePremiumProductBySlug(b.slug);
        const aNew = a.badge === "Neu" ? 1 : 0;
        const bNew = b.badge === "Neu" ? 1 : 0;
        if (aNew !== bNew) return bNew - aNew;
        const genA = premiumA?.generation ?? "";
        const genB = premiumB?.generation ?? "";
        if (genA !== genB) return genB.localeCompare(genA, "de");
        return a.name.localeCompare(b.name, "de");
      });
  }
}

export function applyAdvancedProductFilters(
  products: Product[],
  filters: CatalogFilters,
): Product[] {
  let result = filterProductsByBrand(products, filters.brand);

  if (filters.model !== "all") {
    result = result.filter((product) => {
      const premium = resolvePremiumProductBySlug(product.slug);
      return premium?.model === filters.model;
    });
  }

  if (filters.generation !== "all") {
    result = result.filter((product) => {
      const premium = resolvePremiumProductBySlug(product.slug);
      return premium?.generation === filters.generation;
    });
  }

  if (filters.storage !== "all") {
    result = result.filter((product) => {
      const premium = resolvePremiumProductBySlug(product.slug);
      if (!premium) return false;
      return getProductVariants(premium).some((variant) =>
        variant.storageOptions.some((option) => option.storage.includes(filters.storage)),
      );
    });
  }

  if (filters.color !== "all") {
    result = result.filter((product) => {
      const premium = resolvePremiumProductBySlug(product.slug);
      if (!premium) return false;
      return getProductVariants(premium).some((variant) =>
        variant.colorName.toLowerCase().includes(filters.color.toLowerCase()),
      );
    });
  }

  if (filters.minPrice !== null) {
    result = result.filter((product) => product.price >= filters.minPrice!);
  }

  if (filters.maxPrice !== null) {
    result = result.filter((product) => product.price <= filters.maxPrice!);
  }

  return sortProducts(result, filters.sort);
}

export function applyProductFilters(
  products: Product[],
  brand: BrandFilterValue,
  sort: SortOption,
): Product[] {
  return applyAdvancedProductFilters(products, { ...DEFAULT_CATALOG_FILTERS, brand, sort });
}

export function getAvailableModels(products: Product[]): string[] {
  return [
    ...new Set(
      products
        .map((product) => resolvePremiumProductBySlug(product.slug)?.model)
        .filter((value): value is string => Boolean(value)),
    ),
  ].sort((a, b) => a.localeCompare(b, "de"));
}

export function getAvailableGenerations(products: Product[]): string[] {
  return [
    ...new Set(
      products
        .map((product) => resolvePremiumProductBySlug(product.slug)?.generation)
        .filter((value): value is string => Boolean(value)),
    ),
  ].sort((a, b) => b.localeCompare(a, "de"));
}

export function getAvailableStorages(products: Product[]): string[] {
  const storages = new Set<string>();
  for (const product of products) {
    const premium = resolvePremiumProductBySlug(product.slug);
    if (!premium) continue;
    for (const variant of getProductVariants(premium)) {
      for (const option of variant.storageOptions) {
        const base = option.storage.split(" · ")[0]?.trim();
        if (base) storages.add(base);
      }
    }
  }
  return [...storages].sort((a, b) => a.localeCompare(b, "de"));
}

export function getAvailableColors(products: Product[]): string[] {
  const colors = new Set<string>();
  for (const product of products) {
    const premium = resolvePremiumProductBySlug(product.slug);
    if (!premium) continue;
    for (const variant of getProductVariants(premium)) {
      colors.add(variant.colorName);
    }
  }
  return [...colors].sort((a, b) => a.localeCompare(b, "de"));
}

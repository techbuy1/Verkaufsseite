import type { CatalogCategoryId } from "@/data/catalogCategories";
import { catalogCategories } from "@/data/catalogCategories";
import type { Product } from "@/data/products";
import type { PremiumProduct } from "@/types/product";
import { resolvePremiumProductBySlug } from "@/lib/catalog";
import {
  applyAdvancedProductFilters,
  DEFAULT_CATALOG_FILTERS,
  getAvailableGenerations,
  getAvailableModels,
  getAvailableStorages,
  SORT_OPTIONS,
  type BrandFilterValue,
  type CatalogFilters,
  type SortOption,
} from "@/lib/filterProducts";
import { getProductVariants } from "@/lib/productVariants";

export type StoreCategoryFilter = CatalogCategoryId | "all" | "panzerfolien" | "gadgets";

export type StoreDisplayGroupId = "panzerfolien" | "gadgets" | "smartphones";

export interface StoreFilters extends CatalogFilters {
  category: StoreCategoryFilter;
  search: string;
  series: string;
  availableOnly: boolean;
}

export const DEFAULT_STORE_FILTERS: StoreFilters = {
  ...DEFAULT_CATALOG_FILTERS,
  category: "all",
  search: "",
  series: "all",
  availableOnly: true,
};

export const STORE_CATEGORY_TABS: { id: StoreCategoryFilter; label: string }[] = [
  { id: "all", label: "Alle" },
  { id: "panzerfolien", label: "Panzerfolien" },
  { id: "gadgets", label: "Gadgets" },
  { id: "smartphones", label: "Smartphones" },
];

const VALID_CATEGORIES = new Set<string>([
  "all",
  "panzerfolien",
  "gadgets",
  "smartphones",
]);

const VALID_BRANDS = new Set<BrandFilterValue>([
  "all",
  "apple",
  "samsung",
  "google",
  "xiaomi",
  "oneplus",
]);

const VALID_SORT: SortOption[] = [
  "recommended",
  "newest",
  "price-asc",
  "price-desc",
  "deals",
  "name-asc",
];

function resolvePremium(product: Product): PremiumProduct | undefined {
  return resolvePremiumProductBySlug(product.slug);
}

export function isPanzerfolieProduct(product: Product): boolean {
  return (
    /panzerfolie|displayschutz/i.test(product.name) ||
    /panzerfolie|displayschutz/.test(product.slug)
  );
}

export function isGadgetProduct(product: Product): boolean {
  if (product.catalogCategory !== "zubehoer" || isPanzerfolieProduct(product)) {
    return false;
  }
  if (isHuellenProduct(product)) return false;

  return (
    /powerbank|adapter|ladegerät|ladegeraet|ladekabel/i.test(product.name) ||
    /powerbank|adapter|ladeger|kabel/.test(product.slug)
  );
}

export function isHuellenProduct(product: Product): boolean {
  if (product.catalogCategory !== "zubehoer" || isPanzerfolieProduct(product)) {
    return false;
  }
  return (
    /hülle|huellen|silikon/i.test(product.name) ||
    /huelle|huellen|silikon/.test(product.slug)
  );
}

/** Startseite: Smartphones, Panzerfolien und Hüllen. */
export function isHomepageCatalogProduct(product: Product): boolean {
  return (
    product.catalogCategory === "smartphones" ||
    isPanzerfolieProduct(product) ||
    isHuellenProduct(product)
  );
}

/** Store-Katalog: nur Smartphones, Panzerfolien und Gadgets. */
export function isStoreCatalogProduct(product: Product): boolean {
  return (
    product.catalogCategory === "smartphones" ||
    isPanzerfolieProduct(product) ||
    isGadgetProduct(product)
  );
}

function dedupeProductsBySlug(products: Product[]): Product[] {
  const seen = new Set<string>();
  return products.filter((product) => {
    if (seen.has(product.slug)) return false;
    seen.add(product.slug);
    return true;
  });
}

export function filterStoreCatalogProducts(products: Product[]): Product[] {
  return dedupeProductsBySlug(products.filter(isStoreCatalogProduct));
}

export function filterHomepageCatalogProducts(products: Product[]): Product[] {
  return dedupeProductsBySlug(products.filter(isHomepageCatalogProduct));
}

function matchesStoreCategory(product: Product, category: StoreCategoryFilter): boolean {
  if (category === "all") return true;
  if (category === "panzerfolien") return isPanzerfolieProduct(product);
  if (category === "gadgets") return isGadgetProduct(product);
  if (category === "smartphones") return product.catalogCategory === "smartphones";
  return product.catalogCategory === category;
}

export function getProductSeries(product: Product): string {
  const premium = resolvePremium(product);
  if (!premium) return "Sonstige";

  const model = `${premium.model ?? ""} ${premium.name ?? ""}`.trim();

  if (premium.brand === "Apple") {
    const iphoneMatch = model.match(/iPhone\s+\d+\s*(?:Pro\s*Max|Pro|Plus|Air|e)?/i);
    if (iphoneMatch) return iphoneMatch[0].replace(/\s+/g, " ").trim();
    if (/^\d{2,4}$/.test(premium.generation)) {
      return `iPhone ${premium.generation}`;
    }
  }

  if (premium.brand === "Samsung") {
    if (/galaxy\s*z\s*fold/i.test(model)) return "Galaxy Z Fold";
    if (/galaxy\s*z\s*flip/i.test(model)) return "Galaxy Z Flip";
    if (/galaxy\s*a/i.test(model)) return "Galaxy A";
    if (/galaxy\s*s/i.test(model)) return "Galaxy S";
  }

  if (premium.brand === "Google") {
    const pixelMatch = model.match(/Pixel\s+\d+\s*(?:Pro\s*XL|Pro|a)?/i);
    if (pixelMatch) return pixelMatch[0].replace(/\s+/g, " ").trim();
    if (/pixel/i.test(model)) return "Pixel";
  }

  return premium.generation || premium.model || "Sonstige";
}

export function getAvailableSeries(
  products: Product[],
  category: StoreCategoryFilter,
): string[] {
  const relevant =
    category === "all"
      ? products
      : products.filter((product) => matchesStoreCategory(product, category));

  return [
    ...new Set(relevant.map((product) => getProductSeries(product)).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, "de"));
}

export function searchStoreProducts(products: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return products;

  const terms = q.split(/\s+/).filter(Boolean);

  return products.filter((product) => {
    const premium = resolvePremium(product);
    const haystack = [
      product.name,
      product.brand,
      product.category,
      product.slug.replace(/-/g, " "),
      product.storage ?? "",
      product.color ?? "",
      premium?.generation ?? "",
      premium?.model ?? "",
      ...(premium?.keywords ?? []),
      ...(product.storageOptions ?? []),
      ...(premium
        ? getProductVariants(premium).flatMap((variant) => [
            variant.colorName,
            ...variant.storageOptions.map((option) => option.storage),
          ])
        : []),
    ]
      .join(" ")
      .toLowerCase();

    return terms.every((term) => haystack.includes(term));
  });
}

export function applyStoreFilters(products: Product[], filters: StoreFilters): Product[] {
  let result = products;

  if (filters.availableOnly) {
    result = result.filter((product) => !product.soldOut);
  }

  if (filters.category !== "all") {
    result = result.filter((product) => matchesStoreCategory(product, filters.category));
  }

  result = searchStoreProducts(result, filters.search);

  if (filters.series !== "all") {
    result = result.filter((product) => getProductSeries(product) === filters.series);
  }

  return applyAdvancedProductFilters(result, filters);
}

export function getCategoryLabel(categoryId: CatalogCategoryId): string {
  return catalogCategories.find((category) => category.id === categoryId)?.label ?? categoryId;
}

export function getStoreCategoryLabel(categoryId: StoreCategoryFilter): string {
  if (categoryId === "panzerfolien") return "Panzerfolien";
  if (categoryId === "gadgets") return "Gadgets";
  if (categoryId === "all") return "Alle";
  if (categoryId === "smartphones") return "Smartphones";
  return getCategoryLabel(categoryId);
}

export function groupStoreProductsByCategory(
  products: Product[],
): { categoryId: CatalogCategoryId; label: string; products: Product[] }[] {
  return catalogCategories
    .map((category) => ({
      categoryId: category.id,
      label: category.label,
      products: products.filter((product) => product.catalogCategory === category.id),
    }))
    .filter((group) => group.products.length > 0);
}

/** Gruppierung für Store-Startansicht: Panzerfolien & Gadgets oben, dann Smartphones. */
export function groupStoreProductsForDisplay(
  products: Product[],
): { categoryId: StoreDisplayGroupId; label: string; products: Product[] }[] {
  const panzerfolien = products.filter(isPanzerfolieProduct);
  const gadgets = products.filter(isGadgetProduct);
  const smartphones = products.filter(
    (product) => product.catalogCategory === "smartphones",
  );

  return [
    panzerfolien.length > 0
      ? { categoryId: "panzerfolien" as const, label: "Panzerfolien", products: panzerfolien }
      : null,
    gadgets.length > 0
      ? { categoryId: "gadgets" as const, label: "Gadgets", products: gadgets }
      : null,
    smartphones.length > 0
      ? {
          categoryId: "smartphones" as const,
          label: "Smartphones",
          products: smartphones,
        }
      : null,
  ].filter((group): group is NonNullable<typeof group> => group !== null);
}

export function hasActiveStoreFilters(filters: StoreFilters): boolean {
  return (
    filters.category !== "all" ||
    filters.search.trim().length > 0 ||
    filters.brand !== "all" ||
    filters.series !== "all" ||
    filters.model !== "all" ||
    filters.generation !== "all" ||
    filters.storage !== "all" ||
    filters.color !== "all" ||
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.availableOnly !== DEFAULT_STORE_FILTERS.availableOnly ||
    filters.sort !== DEFAULT_STORE_FILTERS.sort
  );
}

export function parseStoreFilters(searchParams: URLSearchParams): StoreFilters {
  const categoryParam = searchParams.get("category") ?? "all";
  const brandParam = searchParams.get("brand") ?? "all";
  const sortParam = searchParams.get("sort") ?? DEFAULT_STORE_FILTERS.sort;

  return {
    ...DEFAULT_STORE_FILTERS,
    category: VALID_CATEGORIES.has(categoryParam)
      ? (categoryParam as StoreCategoryFilter)
      : "all",
    brand: VALID_BRANDS.has(brandParam as BrandFilterValue)
      ? (brandParam as BrandFilterValue)
      : "all",
    sort: VALID_SORT.includes(sortParam as SortOption)
      ? (sortParam as SortOption)
      : DEFAULT_STORE_FILTERS.sort,
    search: searchParams.get("q") ?? "",
    series: searchParams.get("series") ?? "all",
    model: searchParams.get("model") ?? "all",
    generation: searchParams.get("generation") ?? "all",
    storage: searchParams.get("storage") ?? "all",
    color: searchParams.get("color") ?? "all",
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null,
    availableOnly: searchParams.get("available") !== "0",
  };
}

export function buildStoreSearchParams(filters: StoreFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.category !== "all") params.set("category", filters.category);
  if (filters.brand !== "all") params.set("brand", filters.brand);
  if (filters.search.trim()) params.set("q", filters.search.trim());
  if (filters.series !== "all") params.set("series", filters.series);
  if (filters.model !== "all") params.set("model", filters.model);
  if (filters.generation !== "all") params.set("generation", filters.generation);
  if (filters.storage !== "all") params.set("storage", filters.storage);
  if (filters.color !== "all") params.set("color", filters.color);
  if (filters.minPrice !== null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== null) params.set("maxPrice", String(filters.maxPrice));
  if (!filters.availableOnly) params.set("available", "0");
  if (filters.sort !== DEFAULT_STORE_FILTERS.sort) params.set("sort", filters.sort);

  return params;
}

export {
  getAvailableGenerations,
  getAvailableModels,
  getAvailableStorages,
  SORT_OPTIONS,
};

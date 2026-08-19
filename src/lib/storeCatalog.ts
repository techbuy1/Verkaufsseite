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

export type StoreCategoryFilter = CatalogCategoryId | "all";

export interface StoreFilters extends CatalogFilters {
  category: StoreCategoryFilter;
  search: string;
  series: string;
}

export const DEFAULT_STORE_FILTERS: StoreFilters = {
  ...DEFAULT_CATALOG_FILTERS,
  category: "all",
  search: "",
  series: "all",
};

export const STORE_CATEGORY_TABS: { id: StoreCategoryFilter; label: string }[] = [
  { id: "all", label: "Alle" },
  ...catalogCategories.map((category) => ({
    id: category.id,
    label: category.label,
  })),
];

const VALID_CATEGORIES = new Set<string>([
  "all",
  ...catalogCategories.map((category) => category.id),
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
  "name-asc",
];

function resolvePremium(product: Product): PremiumProduct | undefined {
  return resolvePremiumProductBySlug(product.slug);
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
      : products.filter((product) => product.catalogCategory === category);

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

  if (filters.category !== "all") {
    result = result.filter((product) => product.catalogCategory === filters.category);
  }

  result = searchStoreProducts(result, filters.search);

  if (filters.series !== "all") {
    result = result.filter((product) => getProductSeries(product) === filters.series);
  }

  return applyAdvancedProductFilters(result, filters);
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
  if (filters.sort !== DEFAULT_STORE_FILTERS.sort) params.set("sort", filters.sort);

  return params;
}

export {
  getAvailableGenerations,
  getAvailableModels,
  getAvailableStorages,
  SORT_OPTIONS,
};

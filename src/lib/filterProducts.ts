import type { Product } from "@/data/products";

export type BrandFilterValue =
  | "all"
  | "apple"
  | "samsung"
  | "google"
  | "xiaomi"
  | "oneplus";

export type SortOption =
  | "recommended"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "deals";

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
  { id: "deals", label: "Angebote" },
  { id: "name-asc", label: "Name A-Z" },
];

function hasLegitimateDeal(product: Product): boolean {
  return Boolean(product.discount) || product.badge === "Sale";
}

const BRAND_LABELS: Record<Exclude<BrandFilterValue, "all">, string> = {
  apple: "Apple",
  samsung: "Samsung",
  google: "Google",
  xiaomi: "Xiaomi",
  oneplus: "OnePlus",
};

/** Listing DTO: soldOut is set from the compact catalog / accessory flags. */
export function isCatalogProductInStock(product: Product): boolean {
  return product.soldOut !== true;
}

function compareInStockFirst(a: Product, b: Product): number {
  const aIn = isCatalogProductInStock(a) ? 1 : 0;
  const bIn = isCatalogProductInStock(b) ? 1 : 0;
  return bIn - aIn;
}

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

  const bySecondary = (a: Product, b: Product): number => {
    switch (sort) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "name-asc":
        return a.name.localeCompare(b.name, "de");
      case "newest": {
        const genA = a.generation ?? "";
        const genB = b.generation ?? "";
        if (genA !== genB) return genB.localeCompare(genA, "de");
        const aNew = a.badge === "Neu" ? 1 : 0;
        const bNew = b.badge === "Neu" ? 1 : 0;
        if (aNew !== bNew) return bNew - aNew;
        return a.name.localeCompare(b.name, "de");
      }
      case "deals": {
        const aDeal = hasLegitimateDeal(a) ? 1 : 0;
        const bDeal = hasLegitimateDeal(b) ? 1 : 0;
        if (aDeal !== bDeal) return bDeal - aDeal;
        return a.price - b.price;
      }
      case "recommended":
      default: {
        const aNew = a.badge === "Neu" ? 1 : 0;
        const bNew = b.badge === "Neu" ? 1 : 0;
        if (aNew !== bNew) return bNew - aNew;
        const genA = a.generation ?? "";
        const genB = b.generation ?? "";
        if (genA !== genB) return genB.localeCompare(genA, "de");
        return a.name.localeCompare(b.name, "de");
      }
    }
  };

  // Immer: lagernde Geräte zuerst, danach die gewählte Sortierung.
  return sorted.sort((a, b) => {
    const stockOrder = compareInStockFirst(a, b);
    if (stockOrder !== 0) return stockOrder;
    return bySecondary(a, b);
  });
}

export function applyAdvancedProductFilters(
  products: Product[],
  filters: CatalogFilters,
): Product[] {
  let result = filterProductsByBrand(products, filters.brand);

  if (filters.model !== "all") {
    result = result.filter((product) => (product.model ?? product.name) === filters.model);
  }

  if (filters.generation !== "all") {
    result = result.filter((product) => product.generation === filters.generation);
  }

  if (filters.storage !== "all") {
    result = result.filter((product) =>
      (product.storageOptions ?? []).some((storage) => storage.includes(filters.storage)),
    );
  }

  if (filters.color !== "all") {
    const needle = filters.color.toLowerCase();
    result = result.filter((product) =>
      (product.colors ?? []).some((color) => color.label.toLowerCase().includes(needle)),
    );
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
        .map((product) => product.model ?? product.name)
        .filter((value): value is string => Boolean(value)),
    ),
  ].sort((a, b) => a.localeCompare(b, "de"));
}

export function getAvailableGenerations(products: Product[]): string[] {
  return [
    ...new Set(
      products
        .map((product) => product.generation)
        .filter((value): value is string => Boolean(value)),
    ),
  ].sort((a, b) => b.localeCompare(a, "de"));
}

export function getAvailableStorages(products: Product[]): string[] {
  const storages = new Set<string>();
  for (const product of products) {
    for (const storage of product.storageOptions ?? []) {
      const base = storage.split(" · ")[0]?.trim();
      if (base) storages.add(base);
    }
  }
  return [...storages].sort((a, b) => a.localeCompare(b, "de"));
}

export function getAvailableColors(products: Product[]): string[] {
  const colors = new Set<string>();
  for (const product of products) {
    for (const color of product.colors ?? []) {
      colors.add(color.label);
    }
  }
  return [...colors].sort((a, b) => a.localeCompare(b, "de"));
}

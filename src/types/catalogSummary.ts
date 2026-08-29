import type { CatalogCategoryId } from "@/data/catalogCategories";

export interface CatalogColorSummary {
  id: string;
  name: string;
  hex: string;
  image: string;
}

/** Compact shop listing record — no color × storage × condition trees. */
export interface CatalogSummaryProduct {
  id: string;
  slug: string;
  brand: string;
  name: string;
  category: string;
  catalogCategory: CatalogCategoryId;
  mainImage: string;
  priceFrom: number;
  regularPriceFrom?: number;
  inStock: boolean;
  badge?: "Neu" | "Sale";
  discount?: string;
  tagline?: string;
  generation?: string;
  model?: string;
  keywords?: string[];
  colors: CatalogColorSummary[];
  storageOptions: string[];
  defaultStorage?: string;
  defaultColor?: string;
  priceFromConditionLabel?: string;
}

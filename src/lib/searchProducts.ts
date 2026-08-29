import { accessoryProducts } from "@/data/accessoryCatalog";
import { applyGadgetPriceOverride } from "@/lib/gadgetPricing";
import { summaryToLegacyProduct } from "@/lib/catalogSummary";
import { formatPrice, type Product } from "@/data/products";
import type { CatalogSummaryProduct } from "@/types/catalogSummary";

export interface SearchableProduct extends Product {
  imageSrc: string;
  category: string;
  generation?: string;
  sku?: string;
}

interface SearchIndexEntry {
  product: SearchableProduct;
  haystack: string;
}

let summaryCatalog: CatalogSummaryProduct[] = [];
let cachedIndex: SearchIndexEntry[] | null = null;

export function setSearchSummaries(products: CatalogSummaryProduct[]): void {
  summaryCatalog = products;
  cachedIndex = null;
}

function buildSearchIndex(): SearchIndexEntry[] {
  const devices = summaryCatalog.map(summaryToLegacyProduct);
  const accessories = accessoryProducts
    .filter((product) => !product.hiddenFromListing)
    .map((product) => applyGadgetPriceOverride(product));
  return [...devices, ...accessories].map((product) => {
    const searchable: SearchableProduct = {
      ...product,
      generation: product.generation,
      sku: product.id.toUpperCase().replace(/-/g, ""),
    };
    const haystack = [
      product.name,
      product.brand,
      product.category,
      product.slug.replace(/-/g, " "),
      product.storage ?? "",
      product.color ?? "",
      product.generation ?? "",
      product.model ?? "",
      ...(summaryCatalog.find((entry) => entry.id === product.id)?.keywords ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return { product: searchable, haystack };
  });
}

function getSearchIndex(): SearchIndexEntry[] {
  if (!cachedIndex) cachedIndex = buildSearchIndex();
  return cachedIndex;
}

export function getSearchCatalog(): SearchableProduct[] {
  return getSearchIndex().map((entry) => entry.product);
}

export function invalidateSearchIndex(): void {
  cachedIndex = null;
}

export function searchProducts(query: string, limit = 8): SearchableProduct[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/).filter(Boolean);
  const results: SearchableProduct[] = [];

  for (const entry of getSearchIndex()) {
    if (terms.every((term) => entry.haystack.includes(term))) {
      results.push(entry.product);
      if (results.length >= limit) break;
    }
  }

  return results;
}

export function getProductHref(slug: string): string {
  return `/products/${slug}`;
}

export { formatPrice };

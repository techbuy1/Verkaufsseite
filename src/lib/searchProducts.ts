import {
  getShopCatalogProducts,
  resolvePremiumProductBySlug,
} from "@/lib/catalog";
import { formatPrice, type Product } from "@/data/products";

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

/**
 * Building the catalog is not cheap (syncs variants/prices/colors for every
 * product) and neither is re-resolving each product's premium record — doing
 * both from scratch on every keystroke (as this used to) freezes the page
 * while typing. Index built once per session and reused for every search.
 */
let cachedIndex: SearchIndexEntry[] | null = null;

function buildSearchIndex(): SearchIndexEntry[] {
  return getShopCatalogProducts().map((product) => {
    const premium = resolvePremiumProductBySlug(product.slug);
    const searchable: SearchableProduct = {
      ...product,
      generation: premium?.generation,
      sku: product.id.toUpperCase().replace(/-/g, ""),
    };
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

/** Call after admin edits change the catalog so search picks up new/changed products. */
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

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

export function getSearchCatalog(): SearchableProduct[] {
  return getShopCatalogProducts().map((product) => ({
    ...product,
    imageSrc: product.imageSrc,
    category: product.category,
    generation: resolvePremiumProductBySlug(product.slug)?.generation,
    sku: product.id.toUpperCase().replace(/-/g, ""),
  }));
}

export function searchProducts(query: string, limit = 8): SearchableProduct[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/).filter(Boolean);

  return getSearchCatalog()
    .filter((product) => {
      const premium = resolvePremiumProductBySlug(product.slug);
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

      return terms.every((term) => haystack.includes(term));
    })
    .slice(0, limit);
}

export function getProductHref(slug: string): string {
  return `/products/${slug}`;
}

export { formatPrice };

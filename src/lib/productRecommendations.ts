import type { Product } from "@/data/products";
import { getBuyableCatalogProducts, enrichProducts, type MerchandisedProduct } from "@/lib/productMerchandising";
import { resolvePremiumProductBySlug } from "@/lib/catalog";
import type { PremiumProduct } from "@/types/product";

const DEFAULT_LIMIT = 6;
const MIN_SECTION = 3;
const PRICE_RANGE_PCT = 0.25;

export interface ProductRecommendationSection {
  id: string;
  title: string;
  products: MerchandisedProduct[];
}

function excludeSlug(products: Product[], slug: string): Product[] {
  return products.filter((product) => product.slug !== slug);
}

function excludeIds(products: Product[], ids: Set<string>): Product[] {
  return products.filter((product) => !ids.has(product.id));
}

function uniqueTake(
  products: Product[],
  limit: number,
  used: Set<string>,
): MerchandisedProduct[] {
  const picked: MerchandisedProduct[] = [];
  for (const product of products) {
    if (used.has(product.id)) continue;
    used.add(product.id);
    picked.push(enrichProducts([product])[0]);
    if (picked.length >= limit) break;
  }
  return picked;
}

function byCategory(product: PremiumProduct, pool: Product[]): Product[] {
  return pool.filter((entry) => entry.catalogCategory === product.catalogCategory);
}

function byBrand(product: PremiumProduct, pool: Product[]): Product[] {
  return pool.filter(
    (entry) => entry.brand.toLowerCase() === product.brand.toLowerCase(),
  );
}

function byPriceRange(price: number, pool: Product[], pct = PRICE_RANGE_PCT): Product[] {
  const min = price * (1 - pct);
  const max = price * (1 + pct);
  let matches = pool.filter((entry) => entry.price >= min && entry.price <= max);
  if (matches.length < MIN_SECTION) {
    matches = pool.filter(
      (entry) => entry.price >= price * (1 - pct * 1.5) && entry.price <= price * (1 + pct * 1.5),
    );
  }
  return matches.sort(
    (a, b) => Math.abs(a.price - price) - Math.abs(b.price - price),
  );
}

export function getSimilarProducts(
  current: PremiumProduct,
  limit = DEFAULT_LIMIT,
): MerchandisedProduct[] {
  const pool = excludeSlug(getBuyableCatalogProducts(), current.slug);
  const sameCategory = byCategory(current, pool);
  const sameBrand = byBrand(current, sameCategory.length >= MIN_SECTION ? sameCategory : pool);
  return enrichProducts(sameBrand).slice(0, limit);
}

export function getBrandRecommendations(
  current: PremiumProduct,
  limit = DEFAULT_LIMIT,
): MerchandisedProduct[] {
  const pool = excludeSlug(getBuyableCatalogProducts(), current.slug);
  return enrichProducts(byBrand(current, pool)).slice(0, limit);
}

export function getPriceAlternatives(
  current: PremiumProduct,
  price: number,
  limit = DEFAULT_LIMIT,
): MerchandisedProduct[] {
  const pool = excludeSlug(getBuyableCatalogProducts(), current.slug);
  return enrichProducts(byPriceRange(price, pool)).slice(0, limit);
}

export function getProductPageRecommendations(
  current: PremiumProduct,
  price: number,
  catalog?: Product[],
): ProductRecommendationSection[] {
  const used = new Set<string>([current.id]);
  const pool = (catalog ?? getBuyableCatalogProducts()).filter((product) => !product.soldOut);
  const sections: ProductRecommendationSection[] = [];

  const similar = uniqueTake(
    byBrand(current, byCategory(current, excludeSlug(pool, current.slug))),
    DEFAULT_LIMIT,
    used,
  );
  if (similar.length >= MIN_SECTION) {
    sections.push({ id: "similar", title: "Ähnliche Geräte", products: similar });
  }

  const brand = uniqueTake(byBrand(current, excludeSlug(pool, current.slug)), DEFAULT_LIMIT, used);
  if (brand.length >= MIN_SECTION) {
    sections.push({
      id: "brand",
      title: `Mehr von ${current.brand}`,
      products: brand,
    });
  }

  const priceAlt = uniqueTake(
    byPriceRange(price, excludeSlug(pool, current.slug)),
    DEFAULT_LIMIT,
    used,
  );
  if (priceAlt.length >= MIN_SECTION) {
    sections.push({
      id: "price",
      title: "Alternativen in dieser Preisklasse",
      products: priceAlt,
    });
  }

  const fallback = uniqueTake(excludeIds(pool, used), DEFAULT_LIMIT, used);
  if (fallback.length >= MIN_SECTION) {
    sections.push({
      id: "also-like",
      title: "Das könnte dir auch gefallen",
      products: fallback,
    });
  }

  return sections;
}

export function resolveProductForPage(slug: string): PremiumProduct | undefined {
  return resolvePremiumProductBySlug(slug);
}

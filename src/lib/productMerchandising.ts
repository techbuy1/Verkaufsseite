import type { Product } from "@/data/products";
import {
  getHomepageDeviceProducts,
  getListableAccessoryProducts,
  getShopCatalogProducts,
  resolvePremiumProductBySlug,
} from "@/lib/catalog";
import {
  isHuellenProduct,
  isPanzerfolieProduct,
} from "@/lib/storeCatalog";
import {
  getTotalStock,
  isProductInStock,
  LOW_STOCK_THRESHOLD,
} from "@/lib/productAvailability";
import { premiumToLegacyProduct } from "@/lib/productAdapters";
import type { PremiumProduct } from "@/types/product";

export type MerchandisingBadge =
  | "Angebot"
  | "Neu"
  | "Nur noch wenige"
  | "Top Preis";

export interface MerchandisedProduct extends Product {
  merchandisingBadge?: MerchandisingBadge;
  /** Nur wenn im Katalog hinterlegt — kein erfundener Streichpreis. */
  showDealBadge: boolean;
}

const MIN_RAIL_SIZE = 4;
const MIN_ACCESSORY_RAIL_SIZE = 1;
const DEFAULT_RAIL_LIMIT = 8;

function resolvePremium(product: Product): PremiumProduct | undefined {
  return resolvePremiumProductBySlug(product.slug);
}

/** Startseiten-Rails für Geräte: Handys, iPads, MacBooks & Co. — ohne Folien/Hüllen. */
export function getHomepageDeviceRailProducts(): Product[] {
  return getHomepageDeviceProducts();
}

/** @deprecated Alias für Geräte-Rails auf der Startseite. */
export function getBuyableCatalogProducts(): Product[] {
  return getHomepageDeviceRailProducts();
}

function getAccessoryRailProducts(): Product[] {
  return getListableAccessoryProducts().filter(
    (product) => isPanzerfolieProduct(product) || isHuellenProduct(product),
  );
}

export function getMerchandisingBadge(
  product: Product,
  premium?: PremiumProduct,
): MerchandisingBadge | undefined {
  const resolved = premium ?? resolvePremium(product);
  if (!resolved) return product.badge === "Neu" ? "Neu" : undefined;

  if (product.discount || product.badge === "Sale") return "Angebot";
  if (product.badge === "Neu" || resolved.badge === "Neu") return "Neu";

  const stock = getTotalStock(resolved);
  if (stock > 0 && stock <= LOW_STOCK_THRESHOLD) return "Nur noch wenige";

  return undefined;
}

export function enrichProductMerchandising(product: Product): MerchandisedProduct {
  const premium = resolvePremium(product);
  const merchandisingBadge = getMerchandisingBadge(product, premium);
  return {
    ...product,
    merchandisingBadge,
    showDealBadge: Boolean(product.discount || product.badge === "Sale"),
    badge:
      merchandisingBadge === "Angebot"
        ? "Sale"
        : merchandisingBadge === "Neu"
          ? "Neu"
          : product.badge,
  };
}

export function enrichProducts(products: Product[]): MerchandisedProduct[] {
  return products.map(enrichProductMerchandising);
}

function uniqueById(products: Product[], limit = DEFAULT_RAIL_LIMIT): MerchandisedProduct[] {
  const seen = new Set<string>();
  const result: MerchandisedProduct[] = [];
  for (const product of products) {
    if (seen.has(product.id)) continue;
    seen.add(product.id);
    result.push(enrichProductMerchandising(product));
    if (result.length >= limit) break;
  }
  return result;
}

function sortByPriceAsc(products: Product[]): Product[] {
  return [...products].sort((a, b) => a.price - b.price);
}

function sortByPriceDesc(products: Product[]): Product[] {
  return [...products].sort((a, b) => b.price - a.price);
}

/** Produkte mit legitimer Rabatt-Angabe im Katalog. */
export function getDealProducts(limit = DEFAULT_RAIL_LIMIT): MerchandisedProduct[] {
  const buyable = getBuyableCatalogProducts();
  const deals = buyable.filter(
    (product) => Boolean(product.discount) || product.badge === "Sale",
  );
  return uniqueById(deals.length >= MIN_RAIL_SIZE ? deals : buyable, limit);
}

export function getFeaturedProducts(limit = DEFAULT_RAIL_LIMIT): MerchandisedProduct[] {
  return uniqueById(getBuyableCatalogProducts(), limit);
}

export function getSmartphoneHighlights(limit = DEFAULT_RAIL_LIMIT): MerchandisedProduct[] {
  const items = getHomepageDeviceRailProducts().filter(
    (product) => product.catalogCategory === "smartphones",
  );
  return uniqueById(items, limit);
}

export function getPanzerfolieHighlights(limit = DEFAULT_RAIL_LIMIT): MerchandisedProduct[] {
  const items = getAccessoryRailProducts().filter(isPanzerfolieProduct);
  return uniqueById(items, limit);
}

export function getHuellenHighlights(limit = DEFAULT_RAIL_LIMIT): MerchandisedProduct[] {
  const items = getAccessoryRailProducts().filter(isHuellenProduct);
  return uniqueById(items, limit);
}

export function getBrandHighlights(
  brand: string,
  limit = DEFAULT_RAIL_LIMIT,
): MerchandisedProduct[] {
  const items = getBuyableCatalogProducts().filter(
    (product) => product.brand.toLowerCase() === brand.toLowerCase(),
  );
  return uniqueById(items, limit);
}

export function getValueProducts(limit = DEFAULT_RAIL_LIMIT): MerchandisedProduct[] {
  const sorted = sortByPriceAsc(getBuyableCatalogProducts());
  const mid = sorted.filter((product) => product.price >= 400 && product.price <= 900);
  return uniqueById(mid.length >= MIN_RAIL_SIZE ? mid : sorted, limit);
}

export function getBudgetProducts(maxPrice: number, limit = DEFAULT_RAIL_LIMIT): MerchandisedProduct[] {
  const items = getBuyableCatalogProducts().filter((product) => product.price <= maxPrice);
  return uniqueById(items, limit);
}

export function getNewArrivals(limit = DEFAULT_RAIL_LIMIT): MerchandisedProduct[] {
  const items = getBuyableCatalogProducts().filter(
    (product) => product.badge === "Neu" || getMerchandisingBadge(product) === "Neu",
  );
  return uniqueById(items.length >= MIN_RAIL_SIZE ? items : getBuyableCatalogProducts(), limit);
}

export function getMoreRecommendations(limit = DEFAULT_RAIL_LIMIT): MerchandisedProduct[] {
  return uniqueById(sortByPriceDesc(getBuyableCatalogProducts()), limit);
}

export interface HomeProductSection {
  id: string;
  title: string;
  subtitle?: string;
  href?: string;
  products: MerchandisedProduct[];
}

export function buildHomeProductSections(deviceProducts?: Product[]): HomeProductSection[] {
  const buyable = (deviceProducts ?? getBuyableCatalogProducts()).filter(
    (product) => !product.soldOut,
  );
  const pick = (items: Product[], limit = DEFAULT_RAIL_LIMIT) => uniqueById(items, limit);

  const sections: HomeProductSection[] = [];

  const deals = pick(
    buyable.filter((product) => Boolean(product.discount) || product.badge === "Sale")
      .concat(buyable)
      .filter((product, index, list) => list.findIndex((entry) => entry.id === product.id) === index),
  );
  if (deals.length >= MIN_RAIL_SIZE) {
    sections.push({
      id: "deals",
      title: "Aktuelle Angebote",
      subtitle: "Gerade besonders attraktiv — nur echte Preise aus unserem Katalog.",
      href: "/store?sort=deals",
      products: deals,
    });
  }

  const smartphones = pick(
    buyable.filter((product) => product.catalogCategory === "smartphones"),
  );
  if (smartphones.length >= MIN_RAIL_SIZE) {
    sections.push({
      id: "smartphones",
      title: "Beliebte Smartphones",
      href: "/smartphones",
      products: smartphones,
    });
  }

  const apple = pick(
    buyable.filter((product) => product.brand.toLowerCase() === "apple"),
  );
  if (apple.length >= MIN_RAIL_SIZE) {
    sections.push({
      id: "apple",
      title: "Apple Highlights",
      href: "/iphone",
      products: apple,
    });
  }

  const samsung = pick(
    buyable.filter((product) => product.brand.toLowerCase() === "samsung"),
  );
  if (samsung.length >= MIN_RAIL_SIZE) {
    sections.push({
      id: "samsung",
      title: "Samsung Highlights",
      href: "/samsung",
      products: samsung,
    });
  }

  const under500 = pick(buyable.filter((product) => product.price <= 500));
  if (under500.length >= MIN_RAIL_SIZE) {
    sections.push({
      id: "under-500",
      title: "Unter 500 €",
      products: under500,
    });
  }

  // Panzerfolien und Hüllen laufen als eine gemeinsame Zubehör-Sektion.
  const accessories = uniqueById(
    [...getPanzerfolieHighlights(), ...getHuellenHighlights()],
    DEFAULT_RAIL_LIMIT,
  );
  if (accessories.length >= MIN_ACCESSORY_RAIL_SIZE) {
    sections.push({
      id: "panzerfolien-huellen",
      title: "Panzerfolien & Hüllen",
      subtitle: "Schutz und Stil — passend zu deinem Gerät.",
      href: "/store?category=panzerfolien",
      products: accessories,
    });
  }

  return sections;
}

/** Store: alle verfügbaren eBay-/Katalog-Produkte. */
export function getStoreInitialProducts(): Product[] {
  return getShopCatalogProducts();
}

export function premiumFromSlug(slug: string): PremiumProduct | undefined {
  return resolvePremiumProductBySlug(slug);
}

export function legacyFromPremium(product: PremiumProduct): Product {
  return premiumToLegacyProduct(product);
}

export function isBuyablePremium(product: PremiumProduct): boolean {
  return isProductInStock(product);
}

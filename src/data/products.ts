import type { CatalogCategoryId } from "./catalogCategories";
import type { HeroProduct } from "@/types/hero";
import {
  getCatalogProducts,
  getProductById,
} from "./catalogProducts";
import { resolvePremiumProduct } from "@/lib/catalog";
import { isProductVisibleInShop } from "@/lib/productAvailability";

export type {
  PremiumProduct,
  ProductImageVariant,
  StorageOption,
  ProductSpecifications,
  SpecRow,
  AddToCartPayload,
} from "@/types/product";

export {
  premiumProducts,
  getPremiumProductById,
  getPremiumProductBySlug,
  getPremiumProductsByCategory,
  getDefaultColor,
  getDefaultStorage,
  getColorVariant,
  getStorageOption,
  getProductPrice,
  getProductMinPrice,
  getMonthlyPrice,
} from "./premiumCatalog";

export interface ProductColorOption {
  id: string;
  label: string;
  hex: string;
  imageSrc?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  monthlyPrice?: number;
  badge?: "Neu" | "Sale";
  discount?: string;
  imageType: ProductImageType;
  imageSrc: string;
  slug: string;
  category: string;
  catalogCategory: CatalogCategoryId;
  storage?: string;
  color?: string;
  variant?: string;
  colors?: ProductColorOption[];
  storageOptions?: string[];
  /** Optional: Zustand des günstigsten verfügbaren Preises */
  priceFromConditionLabel?: string;
}

export type ProductImageType =
  | "iphone"
  | "iphone17"
  | "samsung"
  | "galaxy-s26"
  | "pixel"
  | "macbook"
  | "ipad"
  | "airpods"
  | "watch"
  | "gaming"
  | "generic";

export type { HeroProduct } from "@/types/hero";

export {
  heroCarouselProducts,
  heroProducts,
  heroSlides,
  HERO_SLIDE_INTERVAL_MS,
  type HeroSlide,
} from "./heroSlides";

export {
  getCatalogProducts,
  getCatalogProductsByCategory,
  getProductById,
} from "./catalogProducts";

/** @deprecated Galaxy showcase removed from homepage */
export const showcaseProducts: HeroProduct[] = [];

export const topOffers: Product[] = ["offer-iphone", "offer-iphone-17", "offer-samsung"]
  .map((id) => {
    const premium = resolvePremiumProduct(id);
    if (premium && !isProductVisibleInShop(premium)) return undefined;
    return getProductById(id);
  })
  .filter((product): product is Product => Boolean(product));

export function getProductsByCategory(category: string): Product[] {
  return getCatalogProducts().filter(
    (product) => product.category.toLowerCase() === category.toLowerCase(),
  );
}

export { navLinks } from "./navigation";

export function formatPrice(price: number): string {
  const formatted = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
  // Node's and the browser's ICU data can disagree on which whitespace
  // character sits between the number and "€" (regular vs. non-breaking vs.
  // narrow no-break space) — normalizing to a plain space keeps SSR and
  // client output byte-identical and avoids a hydration mismatch.
  return formatted.replace(/[  ]/g, " ");
}

export function formatMonthlyPrice(price: number): string {
  return `${price.toFixed(2).replace(".", ",")} €/Monat`;
}

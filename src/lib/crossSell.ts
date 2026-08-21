import { getRecommendedDeviceAccessoryIds } from "@/data/deviceAccessories";
import {
  crossSellRatings,
  DEFAULT_ACCESSORIES_BY_BRAND,
  DEFAULT_ACCESSORIES_BY_CATEGORY,
  MACBOOK_ACCESSORIES,
  SAMSUNG_PHONE_ACCESSORIES,
  APPLE_PHONE_ACCESSORIES,
} from "@/data/crossSellCatalog";
import {
  getAllCatalogProducts,
  resolvePremiumProduct as getPremium,
} from "@/lib/catalog";
import { isProductVisibleInShop } from "@/lib/productAvailability";
import type { CartItem } from "@/lib/cart";
import type { PremiumProduct } from "@/types/product";

export interface CrossSellProduct {
  id: string;
  productId: string;
  name: string;
  brand: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  slug: string;
}

function resolveAccessoryIds(product: PremiumProduct): string[] {
  const core = getRecommendedDeviceAccessoryIds(product);
  const extras = product.recommendedAccessories?.length
    ? product.recommendedAccessories
    : product.brand === "Apple" && product.catalogCategory === "smartphones"
      ? APPLE_PHONE_ACCESSORIES
      : product.brand === "Samsung" && product.catalogCategory === "smartphones"
        ? SAMSUNG_PHONE_ACCESSORIES
        : product.catalogCategory === "macbooks"
          ? MACBOOK_ACCESSORIES
          : (DEFAULT_ACCESSORIES_BY_BRAND[product.brand] ??
            DEFAULT_ACCESSORIES_BY_CATEGORY[product.catalogCategory] ??
            DEFAULT_ACCESSORIES_BY_CATEGORY.smartphones);

  return Array.from(new Set([...core, ...extras]));
}

export function getCrossSellProduct(productId: string): CrossSellProduct | null {
  const allProducts = getAllCatalogProducts();
  const catalog = allProducts.find((item) => item.id === productId);
  const premium = getPremium(productId);

  if (!catalog && !premium) return null;

  const name = catalog?.name ?? premium!.name;
  const brand = catalog?.brand ?? premium!.brand;
  const price = catalog?.price ?? premium!.storageOptions[0]?.price ?? 0;
  const image =
    catalog?.imageSrc ?? premium!.mainImage ?? premium!.images[0]?.image ?? "";
  const slug = catalog?.slug ?? premium!.slug;
  const ratingMeta = crossSellRatings[productId] ?? { rating: 4.7, reviewCount: 120 };

  return {
    id: productId,
    productId,
    name,
    brand,
    price,
    rating: ratingMeta.rating,
    reviewCount: ratingMeta.reviewCount,
    image,
    slug,
  };
}

export function getCartCrossSellRecommendations(
  cartItems: CartItem[],
  limit = 8,
): CrossSellProduct[] {
  const cartProductIds = new Set(cartItems.map((item) => item.productId));
  const collected: string[] = [];
  const allProducts = getAllCatalogProducts();

  for (const item of cartItems) {
    const product = getPremium(item.productId);
    if (product) {
      collected.push(...resolveAccessoryIds(product));
      if (product.similarProducts?.length) {
        collected.push(...product.similarProducts);
      }
    } else {
      const catalog = allProducts.find((entry) => entry.id === item.productId);
      if (catalog) {
        const fallback =
          DEFAULT_ACCESSORIES_BY_BRAND[catalog.brand] ??
          DEFAULT_ACCESSORIES_BY_CATEGORY[catalog.catalogCategory] ??
          DEFAULT_ACCESSORIES_BY_CATEGORY.smartphones;
        collected.push(...fallback);
      }
    }
  }

  const unique = [...new Set(collected)].filter((id) => !cartProductIds.has(id));

  return unique
    .map((id) => {
      const premium = getPremium(id);
      if (premium && !isProductVisibleInShop(premium)) return null;
      return getCrossSellProduct(id);
    })
    .filter((item): item is CrossSellProduct => item !== null)
    .slice(0, limit);
}

export function getAllCrossSellOptions(): { id: string; label: string }[] {
  return getAllCatalogProducts().map((product) => ({
    id: product.id,
    label: `${product.brand} ${product.name}`,
  }));
}

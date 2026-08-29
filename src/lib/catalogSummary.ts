import type { CatalogCategoryId } from "@/data/catalogCategories";
import type { Product, ProductColorOption, ProductImageType } from "@/data/products";
import type { CatalogSummaryProduct } from "@/types/catalogSummary";
import type { PremiumProduct } from "@/types/product";
import {
  getDefaultAvailableColorId,
  getDefaultAvailableStorage,
  getProductAvailabilityStatus,
  getProductMinAvailableConditionLabel,
  getProductMinAvailablePrice,
  getProductMinAvailableRegularPrice,
} from "@/lib/productAvailability";
import { getDefaultColor } from "@/lib/productVariants";

const imageTypeByCategory: Record<string, ProductImageType> = {
  Smartphones: "iphone17",
  Tablets: "ipad",
  MacBooks: "macbook",
  Laptops: "macbook",
  Smartwatches: "watch",
  Audio: "airpods",
  Zubehör: "generic",
};

function monthlyPrice(price: number) {
  return Math.round((price / 24) * 100) / 100;
}

export function toCatalogSummary(product: PremiumProduct): CatalogSummaryProduct {
  const defaultColorId = getDefaultAvailableColorId(product);
  const defaultColor = getDefaultColor(product);
  const defaultStorage = getDefaultAvailableStorage(product, defaultColorId);
  const minPrice = getProductMinAvailablePrice(product);
  const minRegularPrice = getProductMinAvailableRegularPrice(product);
  const status = getProductAvailabilityStatus(product);
  const promoDiscountPercent =
    minRegularPrice > minPrice
      ? Math.round((1 - minPrice / minRegularPrice) * 100)
      : 0;

  const colors = (product.images ?? []).map((image) => ({
    id: image.id,
    name: image.colorName,
    hex: image.colorCode,
    image: image.image,
  }));

  const storageOptions = [
    ...new Set(
      (product.storageOptions ?? []).map((option) => option.storage).filter(Boolean),
    ),
  ];

  return {
    id: product.id,
    slug: product.slug,
    brand: product.brand,
    name: product.name,
    category: product.category,
    catalogCategory: product.catalogCategory,
    mainImage: defaultColor.image || product.mainImage || colors[0]?.image || "",
    priceFrom: minPrice,
    regularPriceFrom: promoDiscountPercent > 0 ? minRegularPrice : undefined,
    inStock: status !== "out_of_stock" && status !== "archived",
    badge: product.badge,
    discount:
      product.discount ??
      (promoDiscountPercent > 0 ? `-${promoDiscountPercent}%` : undefined),
    tagline: product.tagline,
    generation: product.generation,
    model: product.model,
    keywords: product.keywords,
    colors,
    storageOptions,
    defaultStorage: defaultStorage.storage,
    defaultColor: defaultColor.colorName,
    priceFromConditionLabel: getProductMinAvailableConditionLabel(product),
  };
}

export function summaryToLegacyProduct(product: CatalogSummaryProduct): Product {
  const colors: ProductColorOption[] = product.colors.map((color) => ({
    id: color.id,
    label: color.name,
    hex: color.hex,
    imageSrc: color.image,
  }));

  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.priceFrom,
    regularPrice: product.regularPriceFrom,
    monthlyPrice: monthlyPrice(product.priceFrom),
    badge: product.badge,
    discount: product.discount,
    imageType: imageTypeByCategory[product.category] ?? "generic",
    imageSrc: product.mainImage,
    slug: product.slug,
    category: product.category,
    catalogCategory: product.catalogCategory as CatalogCategoryId,
    storage: product.defaultStorage,
    color: product.defaultColor,
    colors,
    storageOptions: product.storageOptions,
    priceFromConditionLabel: product.priceFromConditionLabel,
    soldOut: !product.inStock,
    model: product.model,
    generation: product.generation,
  };
}

export function isCatalogSummary(
  value: unknown,
): value is CatalogSummaryProduct {
  return (
    typeof value === "object" &&
    value !== null &&
    "priceFrom" in value &&
    "inStock" in value &&
    Array.isArray((value as CatalogSummaryProduct).colors) &&
    !("variants" in value && Array.isArray((value as { variants?: unknown }).variants))
  );
}

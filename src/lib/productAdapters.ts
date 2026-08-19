import type { PremiumProduct } from "@/types/product";
import type { Product, ProductColorOption, ProductImageType } from "@/data/products";
import {
  getDefaultAvailableColorId,
  getDefaultAvailableStorage,
  getProductMinAvailableConditionLabel,
  getProductMinAvailablePrice,
  isColorAvailable,
} from "@/lib/productAvailability";
import {
  getDefaultColor,
  getMonthlyPrice,
} from "@/lib/productVariants";

const imageTypeByCategory: Record<string, ProductImageType> = {
  Smartphones: "iphone17",
  Tablets: "ipad",
  MacBooks: "macbook",
  Laptops: "macbook",
  Smartwatches: "watch",
  Audio: "airpods",
  Zubehör: "generic",
};

/** Illustrierter Fallback-Typ für eine Produktkategorie — für Produkte ohne echte Fotografie. */
export function getImageTypeForCategory(category: string): ProductImageType {
  return imageTypeByCategory[category] ?? "generic";
}

export function premiumToLegacyProduct(product: PremiumProduct): Product {
  const defaultColorId = getDefaultAvailableColorId(product);
  const defaultColor = getDefaultColor(product);
  const minPrice = getProductMinAvailablePrice(product);
  const defaultStorage = getDefaultAvailableStorage(product, defaultColorId);

  const colors: ProductColorOption[] = product.images
    .filter((image) => isColorAvailable(product, image.id))
    .map((image) => ({
      id: image.id,
      label: image.colorName,
      hex: image.colorCode,
      imageSrc: image.image,
    }));

  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: minPrice,
    monthlyPrice: getMonthlyPrice(minPrice),
    badge: product.badge,
    discount: product.discount,
    imageType: imageTypeByCategory[product.category] ?? "generic",
    imageSrc: defaultColor.image,
    slug: product.slug,
    category: product.category,
    catalogCategory: product.catalogCategory,
    storage: defaultStorage.storage,
    color: defaultColor.colorName,
    colors,
    storageOptions: product.storageOptions.map((option) => option.storage),
    priceFromConditionLabel: getProductMinAvailableConditionLabel(product),
  };
}

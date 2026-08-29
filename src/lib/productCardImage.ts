import type { Product } from "@/data/products";
import { isHuellenProduct, isPanzerfolieProduct } from "@/lib/storeCatalog";

export type ProductCardImageScale =
  | "default"
  | "folie"
  | "case"
  | "cable";

/** Zentraler Scale-Faktor pro Produkttyp — keine Einzelwerte pro SKU. */
export function getProductCardImageScale(product: Product): ProductCardImageScale {
  if (isPanzerfolieProduct(product)) return "folie";
  if (isHuellenProduct(product)) return "case";
  if (
    product.catalogCategory === "zubehoer" &&
    (/kabel|cable|ladeger/i.test(product.slug) || /kabel|ladeger/i.test(product.name))
  ) {
    return "cable";
  }
  return "default";
}

export function productCardImageScaleClass(scale: ProductCardImageScale): string {
  switch (scale) {
    case "folie":
      return "product-card-image-scale--folie";
    case "case":
      return "product-card-image-scale--case";
    case "cable":
      return "product-card-image-scale--cable";
    default:
      return "product-card-image-scale--default";
  }
}

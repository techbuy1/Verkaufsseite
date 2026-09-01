"use client";

import { memo } from "react";
import type { ProductImageVariant } from "@/types/product";
import type { ProductImageType } from "@/data/products";
import { ProductGallery } from "./ProductGallery";

interface ProductMediaPanelProps {
  images: ProductImageVariant[];
  alt: string;
  activeIndex: number;
  fallbackType?: ProductImageType;
  brand?: string;
  productSlug?: string;
}

export const ProductMediaPanel = memo(function ProductMediaPanel({
  images,
  alt,
  activeIndex,
  fallbackType,
  brand,
  productSlug,
}: ProductMediaPanelProps) {
  // Kein zusätzlicher Rahmen mehr: die Bildbühne selbst trägt die
  // farbabhängige Fläche, damit es keinen sichtbaren Kasten-Übergang gibt.
  return (
    <div className="w-full">
      <ProductGallery
        images={images}
        alt={alt}
        activeIndex={activeIndex}
        fallbackType={fallbackType}
        brand={brand}
        productSlug={productSlug}
      />
    </div>
  );
});

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
}

export const ProductMediaPanel = memo(function ProductMediaPanel({
  images,
  alt,
  activeIndex,
  fallbackType,
}: ProductMediaPanelProps) {
  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-[20px] border border-border bg-white shadow-[var(--shadow-card)]">
        <div className="px-3 py-4 md:px-5 md:py-6">
          <ProductGallery
            images={images}
            alt={alt}
            activeIndex={activeIndex}
            fallbackType={fallbackType}
            stageClassName="bg-transparent"
          />
        </div>
      </div>
    </div>
  );
});

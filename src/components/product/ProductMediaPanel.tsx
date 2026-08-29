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
      <div className="rounded-[28px] bg-[#f5f5f7] px-4 py-7 sm:px-6 sm:py-9 md:px-8 md:py-10">
        <ProductGallery
          images={images}
          alt={alt}
          activeIndex={activeIndex}
          fallbackType={fallbackType}
        />
      </div>
    </div>
  );
});

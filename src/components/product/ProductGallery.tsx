"use client";

import Image from "next/image";
import { memo, useMemo } from "react";
import type { ProductImageVariant } from "@/types/product";
import type { ProductImageType } from "@/data/products";
import { VARIANT_IMAGE_PLACEHOLDER } from "@/data/productImageRegistry";
import { ProductImage } from "../ProductImage";

interface ProductGalleryProps {
  images: ProductImageVariant[];
  alt: string;
  /** Index der ausgewählten Farbe innerhalb `images`. */
  activeIndex?: number;
  /** Illustrierter Fallback, wenn keine echte Produktfotografie vorliegt. */
  fallbackType?: ProductImageType;
  /** Optional override for the main stage surface. */
  stageClassName?: string;
}

interface ViewShotProps {
  src: string;
  alt: string;
  label: string;
  fallbackType?: ProductImageType;
  priority?: boolean;
  sizes: string;
}

const ViewShot = memo(function ViewShot({
  src,
  alt,
  label,
  fallbackType,
  priority = false,
  sizes,
}: ViewShotProps) {
  const showFallback = src === VARIANT_IMAGE_PLACEHOLDER && fallbackType;

  return (
    <figure className="min-w-0">
      <div className="product-image-stage relative mx-auto aspect-[3/4] w-full max-w-[420px] lg:max-w-none">
        {showFallback ? (
          <div className="absolute inset-0">
            <ProductImage type={fallbackType} className="h-full w-full" />
          </div>
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            loading={priority ? undefined : "lazy"}
            sizes={sizes}
            placeholder="empty"
            className="object-contain object-center p-3 shop-image-seamless sm:p-4 md:p-5"
          />
        )}
      </div>
      <figcaption className="mt-3 text-center text-[11px] font-medium uppercase tracking-[0.16em] text-[#86868b]">
        {label}
      </figcaption>
    </figure>
  );
});

export const ProductGallery = memo(function ProductGallery({
  images,
  alt,
  activeIndex = 0,
  fallbackType,
}: ProductGalleryProps) {
  const colorIndex = images[activeIndex] ? activeIndex : 0;
  const color = images[colorIndex];

  const { front, back } = useMemo(() => {
    const nextFront = color.image;
    const extra = color.angles?.filter((angle) => angle && angle !== nextFront) ?? [];
    return { front: nextFront, back: extra[0] };
  }, [color]);

  const isPrimaryColor = colorIndex === 0;
  const dual = Boolean(back);
  const dualSizes = "(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 280px";
  const singleSizes = "(max-width: 1024px) 92vw, 520px";

  return (
    <div className="w-full">
      <div
        className={
          dual
            ? "grid grid-cols-1 items-center gap-8 sm:grid-cols-2 sm:gap-6 md:gap-10"
            : "mx-auto w-full max-w-[440px] lg:max-w-none"
        }
      >
        <ViewShot
          src={front}
          alt={`${alt} – ${color.colorName} Vorderseite`}
          label="Vorderseite"
          fallbackType={fallbackType}
          priority={isPrimaryColor}
          sizes={dual ? dualSizes : singleSizes}
        />
        {back ? (
          <ViewShot
            src={back}
            alt={`${alt} – ${color.colorName} Rückseite`}
            label="Rückseite"
            fallbackType={fallbackType}
            sizes={dualSizes}
          />
        ) : null}
      </div>
    </div>
  );
});

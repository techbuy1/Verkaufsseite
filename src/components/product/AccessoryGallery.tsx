"use client";

import Image from "next/image";
import { memo, useRef, useState } from "react";
import type { ProductImageType } from "@/data/products";
import { VARIANT_IMAGE_PLACEHOLDER } from "@/data/productImageRegistry";
import { ChevronLeftIcon, ChevronRightIcon } from "../Icons";
import { ProductImage } from "../ProductImage";

interface AccessoryGalleryProps {
  images: string[];
  alt: string;
  fallbackType?: ProductImageType;
  imageScaleClass?: string;
}

const SWIPE_THRESHOLD = 50;

export const AccessoryGallery = memo(function AccessoryGallery({
  images,
  alt,
  fallbackType,
  imageScaleClass = "accessory-detail-image-scale--default",
}: AccessoryGalleryProps) {
  const galleryImages = images.length > 0 ? images : [VARIANT_IMAGE_PLACEHOLDER];
  const [index, setIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const touchStartX = useRef<number | null>(null);

  function goTo(nextIndex: number) {
    const normalized = (nextIndex + galleryImages.length) % galleryImages.length;
    if (normalized === index) return;
    setIndex(normalized);
  }

  const currentImage = galleryImages[index] ?? galleryImages[0];
  const showFallback = currentImage === VARIANT_IMAGE_PLACEHOLDER && fallbackType;

  return (
    <div className="w-full">
      <div
        className="product-image-stage product-image-stage--accessory-pdp group relative mx-auto aspect-[4/5] w-full max-w-[560px] lg:max-w-none"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const startX = touchStartX.current;
          const endX = e.changedTouches[0]?.clientX;
          if (startX === null || endX === undefined) return;
          const delta = startX - endX;
          if (Math.abs(delta) < SWIPE_THRESHOLD) return;
          goTo(delta > 0 ? index + 1 : index - 1);
          touchStartX.current = null;
        }}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <div className={`accessory-detail-image-inner ${imageScaleClass}`}>
          {showFallback ? (
            <div className="absolute inset-0">
              <ProductImage type={fallbackType} className="h-full w-full" />
            </div>
          ) : (
            <Image
              src={currentImage}
              alt={`${alt} – Ansicht ${index + 1}`}
              fill
              priority={index === 0}
              loading={index === 0 ? undefined : "lazy"}
              sizes="(max-width: 1024px) 100vw, 560px"
              placeholder="empty"
              className={`shop-image-seamless object-contain object-center transition-transform duration-200 ease-out ${
                isZoomed ? "scale-[1.02]" : "scale-100"
              }`}
            />
          )}
        </div>

        {galleryImages.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Vorherige Ansicht"
              onClick={() => goTo(index - 1)}
              className="tap-feedback absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/90 text-text-secondary opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-150 hover:text-text-primary group-hover:opacity-100 md:left-3"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Nächste Ansicht"
              onClick={() => goTo(index + 1)}
              className="tap-feedback absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/90 text-text-secondary opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-150 hover:text-text-primary group-hover:opacity-100 md:right-3"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {galleryImages.length > 1 && (
        <div className="mt-5 flex justify-center gap-3 overflow-x-auto pb-1 scrollbar-hide md:mt-6">
          {galleryImages.map((image, thumbIndex) => {
            const isActive = thumbIndex === index;
            const isPlaceholder = image === VARIANT_IMAGE_PLACEHOLDER && fallbackType;
            return (
              <button
                key={`${image}-${thumbIndex}`}
                type="button"
                aria-label={`Ansicht ${thumbIndex + 1}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => goTo(thumbIndex)}
                className={`shop-product-thumb relative h-14 w-14 shrink-0 rounded-xl transition-opacity duration-150 md:h-16 md:w-16 ${
                  isActive
                    ? "opacity-100 ring-2 ring-accent ring-offset-2 ring-offset-background-secondary"
                    : "opacity-55 hover:opacity-90"
                }`}
              >
                {isPlaceholder ? (
                  <div className="absolute inset-0 p-1">
                    <ProductImage type={fallbackType} className="h-full w-full" />
                  </div>
                ) : (
                  <Image
                    src={image}
                    alt={`${alt} – Vorschau ${thumbIndex + 1}`}
                    fill
                    sizes="64px"
                    loading="lazy"
                    className="object-contain object-center p-1.5"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ProductImageVariant } from "@/types/product";
import type { ProductImageType } from "@/data/products";
import { VARIANT_IMAGE_PLACEHOLDER } from "@/data/productImageRegistry";
import { ChevronLeftIcon, ChevronRightIcon } from "../Icons";
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

const SWIPE_THRESHOLD = 50;

export function ProductGallery({
  images,
  alt,
  activeIndex = 0,
  fallbackType,
  stageClassName,
}: ProductGalleryProps) {
  const colorIndex = images[activeIndex] ? activeIndex : 0;
  const color = images[colorIndex];

  // Alle echten Ansichten der aktuell gewählten Farbe: Hauptfoto + optionale
  // weitere Winkel (z. B. Rückseite) — nur vorhanden, wenn Assets existieren.
  const angles = useMemo(
    () => (color.angles?.length ? [color.image, ...color.angles] : [color.image]),
    [color],
  );

  const [angleIndex, setAngleIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Beim Farbwechsel immer wieder mit der ersten Ansicht (Vorderseite) starten.
  useEffect(() => {
    setAngleIndex(0);
  }, [color.id]);

  function goToAngle(index: number) {
    const next = (index + angles.length) % angles.length;
    if (next === angleIndex) return;
    setIsAnimating(true);
    window.setTimeout(() => {
      setAngleIndex(next);
      setIsAnimating(false);
    }, 200);
  }

  const currentImage = angles[angleIndex] ?? angles[0];
  const showFallback = currentImage === VARIANT_IMAGE_PLACEHOLDER && fallbackType;

  return (
    <div className="w-full">
      <div
        className={`product-image-stage group relative mx-auto aspect-[4/5] w-full max-w-[560px] lg:max-w-none ${
          stageClassName ?? "product-image-stage--on-card"
        }`}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const startX = touchStartX.current;
          const endX = e.changedTouches[0]?.clientX;
          if (startX === null || endX === undefined) return;
          const delta = startX - endX;
          if (Math.abs(delta) < SWIPE_THRESHOLD) return;
          goToAngle(delta > 0 ? angleIndex + 1 : angleIndex - 1);
          touchStartX.current = null;
        }}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        {showFallback ? (
          <div
            className={`absolute inset-0 transition-all duration-300 ease-out ${
              isAnimating ? "scale-[0.97] opacity-0" : "scale-100 opacity-100"
            }`}
          >
            <ProductImage type={fallbackType} className="h-full w-full" />
          </div>
        ) : (
          <Image
            key={currentImage}
            src={currentImage}
            alt={`${alt} – ${color.colorName}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 560px"
            placeholder="empty"
            className={`object-contain object-center p-6 transition-all duration-300 ease-out shop-image-seamless md:p-8 ${
              isAnimating
                ? "scale-[0.97] opacity-0"
                : isZoomed
                  ? "scale-[1.02] opacity-100"
                  : "scale-100 opacity-100"
            }`}
          />
        )}

        {angles.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Vorherige Ansicht"
              onClick={() => goToAngle(angleIndex - 1)}
              className="tap-feedback absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/90 text-text-secondary opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-200 hover:text-text-primary group-hover:opacity-100 md:left-3"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Nächste Ansicht"
              onClick={() => goToAngle(angleIndex + 1)}
              className="tap-feedback absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/90 text-text-secondary opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-200 hover:text-text-primary group-hover:opacity-100 md:right-3"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {angles.length > 1 && (
        <div className="mt-5 flex justify-center gap-3 overflow-x-auto pb-1 scrollbar-hide md:mt-6">
          {angles.map((angleImage, index) => {
            const isActive = index === angleIndex;
            const isPlaceholder = angleImage === VARIANT_IMAGE_PLACEHOLDER && fallbackType;
            return (
              <button
                key={`${color.id}-${index}`}
                type="button"
                aria-label={`${color.colorName} – Ansicht ${index + 1}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => goToAngle(index)}
                className={`shop-product-thumb relative h-14 w-14 shrink-0 rounded-xl transition-all duration-200 md:h-16 md:w-16 ${
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
                    src={angleImage}
                    alt={`${color.colorName} – Ansicht ${index + 1}`}
                    fill
                    sizes="64px"
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
}

"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ProductImageType } from "@/data/products";
import { VARIANT_IMAGE_PLACEHOLDER } from "@/data/productImageRegistry";
import { ProductImage } from "./ProductImage";

interface ProductImageSwitchProps {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  /** Illustrierter Fallback, wenn keine echte Produktfotografie vorliegt (src === Platzhalter). */
  fallbackType?: ProductImageType;
}

export function ProductImageSwitch({
  src,
  alt,
  sizes,
  priority = false,
  className = "object-contain p-3",
  containerClassName = "",
  fallbackType,
}: ProductImageSwitchProps) {
  const [displaySrc, setDisplaySrc] = useState(src);
  const [visible, setVisible] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setLoadFailed(false);
    if (src === displaySrc) return;

    setVisible(false);
    const timer = window.setTimeout(() => {
      setDisplaySrc(src);
      setVisible(true);
    }, 110);

    return () => window.clearTimeout(timer);
  }, [src, displaySrc]);

  if (
    (loadFailed || displaySrc === VARIANT_IMAGE_PLACEHOLDER) &&
    fallbackType
  ) {
    return (
      <div
        className={`absolute inset-0 transition-all duration-[220ms] ease-out ${
          visible ? "scale-100 opacity-100" : "scale-[0.98] opacity-0"
        } ${containerClassName}`}
      >
        <ProductImage type={fallbackType} className="h-full w-full" />
      </div>
    );
  }

  return (
    <Image
      key={displaySrc}
      src={displaySrc}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      placeholder="empty"
      onError={() => setLoadFailed(true)}
      className={`shop-image-seamless ${className} transition-all duration-[220ms] ease-out ${
        visible ? "scale-100 opacity-100" : "scale-[0.98] opacity-0"
      } ${containerClassName}`}
    />
  );
}

"use client";

import Image from "next/image";
import { formatPrice, type ProductImageType } from "@/data/products";
import { VARIANT_IMAGE_PLACEHOLDER } from "@/data/productImageRegistry";
import { ProductImage } from "../ProductImage";

interface StickyCartBarProps {
  visible: boolean;
  productName: string;
  productImage: string;
  fallbackType?: ProductImageType;
  price: number;
  taxAccepted: boolean;
  canPurchase?: boolean;
  onAddToCart: () => void;
}

export function StickyCartBar({
  visible,
  productName,
  productImage,
  fallbackType,
  price,
  taxAccepted,
  canPurchase = true,
  onAddToCart,
}: StickyCartBarProps) {
  const isUnavailable = !canPurchase;

  return (
    <div
      className={`fixed left-0 right-0 top-[72px] z-40 border-b border-border bg-surface-card/92 backdrop-blur-xl transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full pointer-events-none"
      }`}
    >
      <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-5 py-3 md:px-8 lg:px-10">
        <div className="shop-product-thumb relative hidden h-11 w-11 shrink-0 sm:block">
          {productImage === VARIANT_IMAGE_PLACEHOLDER && fallbackType ? (
            <ProductImage type={fallbackType} className="h-full w-full" />
          ) : (
            <Image
              src={productImage}
              alt={productName}
              fill
              sizes="44px"
              className="object-contain object-center"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-text-primary">{productName}</p>
          <p className="text-[13px] text-text-secondary">{formatPrice(price)}</p>
        </div>

        <button
          type="button"
          disabled={!taxAccepted || isUnavailable}
          onClick={onAddToCart}
          className="btn-techbuy-primary shrink-0 px-5 py-2.5 text-[14px] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isUnavailable ? "Ausverkauft" : "In den Warenkorb"}
        </button>
      </div>
    </div>
  );
}

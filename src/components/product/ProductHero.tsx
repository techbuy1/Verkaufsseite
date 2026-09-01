"use client";

import type { PremiumProduct } from "@/types/product";
import { formatPrice } from "@/data/products";
import { getImageTypeForCategory } from "@/lib/productAdapters";
import { AddToCartButton } from "./AddToCartButton";
import { ColorPicker } from "./ColorPicker";
import { ProductGallery } from "./ProductGallery";
import { ProductTrustBadges } from "./ProductTrustBadges";
import { StoragePicker } from "./StoragePicker";

interface ProductHeroProps {
  product: PremiumProduct;
  selectedColorId: string;
  selectedStorage: string;
  price: number;
  onColorChange: (colorId: string) => void;
  onStorageChange: (storage: string) => void;
  onAddToCart: () => void;
}

export function ProductHero({
  product,
  selectedColorId,
  selectedStorage,
  price,
  onColorChange,
  onStorageChange,
  onAddToCart,
}: ProductHeroProps) {
  const activeColorIndex = product.images.findIndex((image) => image.id === selectedColorId);

  const priceBlock = (
    <div>
      <p className="text-[13px] font-medium text-[#6e6e73]">Preis</p>
      <p className="mt-1 text-[28px] font-semibold tracking-tight text-[#1d1d1f] lg:text-[32px]">
        {formatPrice(price)}
      </p>
    </div>
  );

  const configurator = (
    <div className="space-y-8">
      {product.images.length > 1 && (
        <ColorPicker
          colors={product.images}
          selectedColorId={selectedColorId}
          onChange={onColorChange}
        />
      )}

      {product.storageOptions.length > 1 && (
        <StoragePicker
          options={product.storageOptions}
          selectedStorage={selectedStorage}
          onChange={onStorageChange}
        />
      )}

      <div className="hidden lg:block">
        <AddToCartButton onClick={onAddToCart} />
        <ProductTrustBadges />
      </div>
    </div>
  );

  return (
    <section className="pb-10 pt-6 md:pb-14 md:pt-8">
      {/* Mobile: name */}
      <header className="mb-6 text-center lg:hidden">
        <p className="mb-1 text-[13px] font-medium text-[#6e6e73]">{product.brand}</p>
        <h1 className="text-[32px] font-bold tracking-[-0.03em] text-[#1d1d1f]">
          {product.name}
        </h1>
        <p className="mt-2 text-[17px] text-[#6e6e73]">{product.tagline}</p>
      </header>

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
        {/* Gallery — on mobile: after title, before price */}
        <div className="order-1 lg:sticky lg:top-28 lg:order-1">
          <ProductGallery
            images={product.images}
            alt={product.name}
            activeIndex={activeColorIndex >= 0 ? activeColorIndex : 0}
            fallbackType={getImageTypeForCategory(product.category)}
            brand={product.brand}
            productSlug={product.slug}
          />
        </div>

        {/* Info — on mobile: after gallery */}
        <div className="order-2 flex flex-col lg:order-2 lg:pt-2">
          {/* Desktop title */}
          <header className="mb-8 hidden lg:block">
            <p className="mb-1 text-[13px] font-medium text-[#6e6e73]">{product.brand}</p>
            <h1 className="text-[40px] font-bold tracking-[-0.03em] text-[#1d1d1f] xl:text-[48px]">
              {product.name}
            </h1>
            <p className="mt-3 text-[19px] leading-relaxed text-[#6e6e73]">{product.tagline}</p>
          </header>

          {/* Desktop: price first */}
          <div className="mb-8 hidden lg:block">{priceBlock}</div>

          {/* Mobile: price before colors */}
          <div className="order-1 mb-8 text-center lg:hidden">{priceBlock}</div>

          {configurator}
        </div>
      </div>
    </section>
  );
}

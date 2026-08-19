"use client";

import Link from "next/link";
import { useState } from "react";
import {
  formatPrice,
  type Product,
  type ProductColorOption,
} from "@/data/products";
import { ProductImageSwitch } from "./ProductImageSwitch";
import { TiltCard } from "./motion/TiltCard";

interface CategoryProductCardProps {
  product: Product;
}

export function CategoryProductCard({ product }: CategoryProductCardProps) {
  const [selectedColor, setSelectedColor] = useState<ProductColorOption | null>(
    product.colors?.[0] ?? null,
  );

  const imageSrc =
    selectedColor?.imageSrc && selectedColor.imageSrc.length > 0
      ? selectedColor.imageSrc
      : product.imageSrc;

  const productHref = `/products/${product.slug}`;

  return (
    <TiltCard maxTilt={2} scale={1.005} className="h-full">
      <article className="product-card-hover flex h-full min-w-0 flex-col rounded-[16px] border border-border bg-surface-card p-3 shadow-[var(--shadow-card)] sm:p-3.5">
        <div className="mb-1.5 min-w-0">
          {product.badge && (
            <span className="badge-techbuy mb-1 !px-1.5 !py-0 text-[9px]">{product.badge}</span>
          )}
          <h3 className="line-clamp-2 text-[14px] font-semibold leading-snug tracking-tight text-text-primary sm:text-[15px]">
            {product.name}
          </h3>
          {selectedColor && (
            <p className="mt-0.5 truncate text-[11px] text-text-secondary">
              {product.name} – {selectedColor.label}
            </p>
          )}
        </div>

        <Link
          href={productHref}
          className="product-image-stage product-image-stage--on-card relative mb-2 block h-[140px] w-full sm:h-[150px]"
        >
          <ProductImageSwitch
            src={imageSrc}
            alt={`${product.name}${selectedColor ? ` – ${selectedColor.label}` : ""}`}
            sizes="(max-width: 768px) 80vw, (max-width: 1024px) 40vw, 22vw"
            className="object-contain p-2"
            fallbackType={product.imageType}
          />
        </Link>

        {product.colors && product.colors.length > 0 && (
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {product.colors.map((color) => {
              const isSelected = selectedColor?.id === color.id;
              return (
                <button
                  key={color.id}
                  type="button"
                  aria-label={`Farbe ${color.label}`}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedColor(color)}
                  className={`h-2.5 w-2.5 rounded-full transition-transform ${
                    isSelected ? "swatch-ring-active scale-110" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              );
            })}
          </div>
        )}

        <div className="mt-auto">
          <p className="text-[10px] font-medium text-text-secondary">Ab</p>
          <p className="text-[16px] font-semibold tracking-tight text-text-primary">
            {formatPrice(product.price)}
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            <Link
              href={productHref}
              className="btn-techbuy-primary !min-h-8 h-8 min-w-0 flex-1 !px-2.5 !text-[12px]"
            >
              Kaufen
            </Link>
            <Link
              href={productHref}
              className="shrink-0 text-[12px] font-medium text-text-secondary transition-colors hover:text-accent"
            >
              Mehr erfahren
            </Link>
          </div>
        </div>
      </article>
    </TiltCard>
  );
}

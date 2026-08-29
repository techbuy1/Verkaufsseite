"use client";

import Link from "next/link";
import { useState } from "react";
import { Product, formatPrice } from "@/data/products";
import { useShop } from "@/context/ShopContext";
import { Button } from "./Button";
import { HeartIcon } from "./Icons";
import { ProductImageSwitch } from "./ProductImageSwitch";

interface ProductCardProps {
  product: Product;
  variant?: "light" | "dark";
  size?: "default" | "compact";
  index?: number;
  priority?: boolean;
}

const IMAGE_HEIGHT_COMPACT = "h-[96px]";
const IMAGE_HEIGHT_TABLET = "h-[132px]";
const IMAGE_HEIGHT_DEFAULT = "h-[190px] md:h-[210px]";

export function ProductCard({
  product,
  size = "default",
  priority = false,
}: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useShop();
  const [selectedColorId, setSelectedColorId] = useState(product.colors?.[0]?.id);
  const wishlisted = isInWishlist(product.id);
  const isCompact = size === "compact";
  const isTabletCategory = product.catalogCategory === "tablets";
  const imageHeightClass = isCompact
    ? isTabletCategory
      ? IMAGE_HEIGHT_TABLET
      : IMAGE_HEIGHT_COMPACT
    : isTabletCategory
      ? "h-[210px] md:h-[230px]"
      : IMAGE_HEIGHT_DEFAULT;
  const productHref = `/products/${product.slug}`;

  const selectedColor = product.colors?.find((color) => color.id === selectedColorId);
  const imageSrc = selectedColor?.imageSrc ?? product.imageSrc;
  const colorLabel = selectedColor?.label;

  if (isCompact) {
    return (
      <article className="product-card-hover group relative flex h-full w-full min-w-0 flex-col rounded-[14px] border border-border bg-surface-card p-1.5 shadow-[var(--shadow-card)] sm:p-2">
        <button
          onClick={() => toggleWishlist(product.id)}
          className={`absolute right-1 top-1 z-10 rounded-full p-0.5 transition-colors duration-200 ${
            wishlisted ? "text-accent" : "text-text-secondary hover:text-accent"
          }`}
          aria-label={wishlisted ? "Von Wunschliste entfernen" : "Zur Wunschliste hinzufügen"}
        >
          <HeartIcon filled={wishlisted} />
        </button>

        {(product.badge || product.soldOut) && (
          <span
            className={`mb-0.5 inline-block w-fit !px-1.5 !py-0 text-[8px] ${
              product.soldOut ? "badge-techbuy bg-text-secondary/10 text-text-secondary" : "badge-techbuy"
            }`}
          >
            {product.soldOut ? "Ausverkauft" : product.badge}
          </span>
        )}

        <p className="mb-0 text-[8px] font-medium uppercase tracking-wide text-text-secondary">
          {product.brand}
        </p>

        <Link
          href={productHref}
          className="mb-0.5 line-clamp-2 pr-5 text-[11px] font-semibold leading-snug tracking-tight text-text-primary hover:underline sm:text-[12px]"
        >
          {product.name}
        </Link>

        <Link
          href={productHref}
          className={`product-image-stage product-image-stage--on-card product-image-float relative mb-0.5 block w-full ${imageHeightClass}`}
        >
          <ProductImageSwitch
            src={imageSrc}
            alt={`${product.name}${colorLabel ? ` – ${colorLabel}` : ""}`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            className="object-contain"
            fallbackType={product.imageType}
          />
        </Link>

        {product.colors && product.colors.length > 0 && (
          <div className="mb-1 flex flex-wrap items-center gap-1">
            {product.colors.map((color) => (
              <button
                key={color.id}
                type="button"
                aria-label={`Farbe ${color.label}`}
                aria-pressed={selectedColorId === color.id}
                title={color.label}
                onClick={() => setSelectedColorId(color.id)}
                className={`h-2 w-2 rounded-full transition-transform duration-200 ${
                  selectedColorId === color.id ? "swatch-ring-active scale-110" : "hover:scale-110"
                }`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
            {colorLabel && (
              <span className="truncate text-[8px] text-text-secondary">{colorLabel}</span>
            )}
          </div>
        )}

        <div className="mb-1">
          <p className="text-[8px] font-medium leading-none text-text-secondary">Ab</p>
          <p className="text-[13px] font-semibold tracking-tight text-text-primary">
            {formatPrice(product.price)}
          </p>
          {product.priceFromConditionLabel && (
            <p className="mt-0.5 line-clamp-1 text-[8px] leading-tight text-text-secondary">
              in Zustand „{product.priceFromConditionLabel}“
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center gap-1">
          <Link
            href={productHref}
            className={
              product.soldOut
                ? "btn-techbuy-secondary !min-h-6 h-6 min-w-0 flex-1 !px-1.5 !text-[10px]"
                : "btn-techbuy-primary !min-h-6 h-6 min-w-0 flex-1 !px-1.5 !text-[10px]"
            }
          >
            {product.soldOut ? "Ausverkauft" : "Kaufen"}
          </Link>
          <Link
            href={productHref}
            className="shrink-0 text-[10px] font-medium text-text-secondary transition-colors duration-200 hover:text-accent"
          >
            Mehr erfahren
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="product-card-hover group relative flex h-full flex-col rounded-[22px] border border-border bg-surface-card p-5 shadow-[var(--shadow-card)] md:p-6">
      <button
        onClick={() => toggleWishlist(product.id)}
        className={`absolute right-5 top-5 z-10 rounded-full p-2 transition-colors duration-200 ${
          wishlisted ? "text-accent" : "text-text-secondary hover:text-accent"
        }`}
        aria-label={wishlisted ? "Von Wunschliste entfernen" : "Zur Wunschliste hinzufügen"}
      >
        <HeartIcon filled={wishlisted} />
      </button>

      <Link
        href={productHref}
        className={`product-image-stage product-image-stage--on-card product-image-float relative mb-5 block w-full ${imageHeightClass}`}
      >
        <ProductImageSwitch
          src={imageSrc}
          alt={`${product.name}${colorLabel ? ` – ${colorLabel}` : ""}`}
          sizes="(max-width: 768px) 100vw, 33vw"
          priority={priority}
          className="object-contain p-4"
          fallbackType={product.imageType}
        />
      </Link>

      <div className="flex flex-1 flex-col">
        <div className="mb-2 flex items-center gap-2">
          {product.soldOut ? (
            <span className="badge-techbuy bg-text-secondary/10 text-text-secondary">
              Ausverkauft
            </span>
          ) : (
            product.badge && <span className="badge-techbuy">{product.badge}</span>
          )}
          {product.discount && (
            <span className="text-[12px] font-medium text-sale">{product.discount}</span>
          )}
        </div>

        <p className="mb-0.5 text-[12px] text-text-secondary">{product.brand}</p>

        <h3 className="mb-3 text-[17px] font-semibold tracking-tight text-text-primary md:text-[19px]">
          {product.name}
        </h3>

        {product.colors && product.colors.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {product.colors.map((color) => (
              <button
                key={color.id}
                type="button"
                aria-label={`Farbe ${color.label}`}
                aria-pressed={selectedColorId === color.id}
                title={color.label}
                onClick={() => setSelectedColorId(color.id)}
                className={`h-3 w-3 rounded-full transition-transform duration-200 ${
                  selectedColorId === color.id ? "swatch-ring-active scale-110" : "hover:scale-110"
                }`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
            {colorLabel && (
              <span className="text-[12px] text-text-secondary">{colorLabel}</span>
            )}
          </div>
        )}

        {product.storageOptions && product.storageOptions.length > 0 && (
          <p className="mb-4 text-[12px] text-text-secondary">
            {product.storageOptions.join(" · ")}
          </p>
        )}

        <p className="mb-1 text-[17px] font-semibold text-text-primary">
          Ab {formatPrice(product.price)}
        </p>
        {product.priceFromConditionLabel && (
          <p className="mb-1 text-[12px] text-text-secondary">
            in Zustand „{product.priceFromConditionLabel}“
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-2">
          <Button variant={product.soldOut ? "secondary" : "primary"} size="sm" href={productHref}>
            {product.soldOut ? "Ausverkauft" : "Kaufen"}
          </Button>
          <Button variant="ghost" size="sm" href={productHref}>
            Mehr erfahren
          </Button>
        </div>
      </div>
    </article>
  );
}

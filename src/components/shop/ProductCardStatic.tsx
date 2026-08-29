import Link from "next/link";
import { formatPrice, type Product } from "@/data/products";
import { ProductImageSwitch } from "@/components/ProductImageSwitch";
import { VARIANT_IMAGE_PLACEHOLDER } from "@/data/productImageRegistry";
import type { MerchandisedProduct } from "@/lib/productMerchandising";
import {
  getProductCardImageScale,
  productCardImageScaleClass,
} from "@/lib/productCardImage";

export interface ProductCardStaticProps {
  product: Product | MerchandisedProduct;
  size?: "default" | "compact" | "rail";
  ctaLabel?: string;
  priority?: boolean;
}

function badgeLabel(product: Product | MerchandisedProduct): string | undefined {
  const merch = product as MerchandisedProduct;
  if (product.soldOut) return "Ausverkauft";
  if (merch.merchandisingBadge) return merch.merchandisingBadge;
  if (product.badge === "Sale") return "Angebot";
  return product.badge;
}

export function ProductCardStatic({
  product,
  size = "compact",
  ctaLabel,
  priority = false,
}: ProductCardStaticProps) {
  const href = `/products/${product.slug}`;
  const badge = badgeLabel(product);
  const isRail = size === "rail";
  const isCompact = size === "compact" || isRail;
  const imageSrc = product.imageSrc ?? VARIANT_IMAGE_PLACEHOLDER;
  const imageScaleClass = productCardImageScaleClass(getProductCardImageScale(product));

  const cardPadding = isRail ? "p-2.5 sm:p-3" : isCompact ? "p-1.5 sm:p-2" : "p-5 md:p-6";
  const radius = isRail ? "rounded-[16px]" : isCompact ? "rounded-[14px]" : "rounded-[22px]";

  return (
    <article
      className={`product-card-hover group relative flex h-full w-full min-w-0 flex-col border border-border bg-surface-card shadow-[var(--shadow-card)] ${cardPadding} ${radius}`}
    >
      {badge && (
        <span
          className={`mb-1 inline-block w-fit ${
            product.soldOut
              ? "badge-techbuy bg-text-secondary/10 text-text-secondary"
              : badge === "Angebot"
                ? "badge-techbuy bg-sale/10 text-sale"
                : "badge-techbuy"
          } ${isCompact ? "!px-1.5 !py-0 text-[8px]" : ""}`}
        >
          {badge}
        </span>
      )}

      {!isCompact && (
        <p className="mb-0.5 text-[12px] text-text-secondary">{product.brand}</p>
      )}

      {isCompact && (
        <p className="mb-0 text-[8px] font-medium uppercase tracking-wide text-text-secondary sm:text-[9px]">
          {product.brand}
        </p>
      )}

      <Link
        href={href}
        className={`line-clamp-2 font-semibold tracking-tight text-text-primary hover:underline ${
          isCompact
            ? "mb-0.5 min-h-[2.4em] text-[11px] leading-snug sm:text-[12px]"
            : "mb-3 min-h-[2.6em] text-[17px] md:text-[19px]"
        }`}
      >
        {product.name}
      </Link>

      <Link href={href} className="product-card-image-frame mb-1 block">
        <div className={`product-card-image-inner ${imageScaleClass}`}>
          <ProductImageSwitch
            src={imageSrc}
            alt={product.name}
            sizes={
              isRail
                ? "(max-width: 640px) 78vw, (max-width: 1024px) 42vw, 220px"
                : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            }
            priority={priority}
            fallbackType={product.imageType}
            className="object-contain object-center"
          />
        </div>
      </Link>

      {product.storageOptions && product.storageOptions.length > 0 && isRail && (
        <p className="mb-1 line-clamp-1 text-[10px] text-text-secondary">
          {product.storageOptions.slice(0, 3).join(" · ")}
        </p>
      )}

      <div className="mt-auto flex flex-col">
        {isCompact && (
          <p className="text-[8px] font-medium leading-none text-text-secondary">Ab</p>
        )}
        {product.regularPrice && (
          <p
            className={`text-text-secondary line-through ${isCompact ? "text-[10px]" : "text-[13px]"}`}
          >
            {formatPrice(product.regularPrice)}
          </p>
        )}
        <div className="flex flex-wrap items-baseline gap-1.5">
          <p
            className={`font-semibold tracking-tight text-text-primary ${
              isCompact ? "text-[13px] sm:text-[14px]" : "text-[17px]"
            }`}
          >
            {isCompact ? formatPrice(product.price) : `Ab ${formatPrice(product.price)}`}
          </p>
          {product.discount && (
            <span className={`font-medium text-sale ${isCompact ? "text-[10px]" : "text-[12px]"}`}>
              {product.discount}
            </span>
          )}
        </div>
        {product.priceFromConditionLabel && isCompact && (
          <p className="mt-0.5 line-clamp-1 text-[8px] leading-tight text-text-secondary">
            in Zustand „{product.priceFromConditionLabel}“
          </p>
        )}

        <Link
          href={href}
          className={`mt-2 inline-flex min-h-[44px] w-full items-center justify-center rounded-full text-center font-medium transition-colors duration-200 sm:min-h-[36px] ${
            product.soldOut
              ? "btn-techbuy-secondary !text-[11px] sm:!text-[12px]"
              : "btn-techbuy-primary !text-[11px] sm:!text-[12px]"
          }`}
        >
          {product.soldOut ? "Ausverkauft" : ctaLabel ?? (isRail ? "Jetzt ansehen" : "Zum Angebot")}
        </Link>
      </div>
    </article>
  );
}

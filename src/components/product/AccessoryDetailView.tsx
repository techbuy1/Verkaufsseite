"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product, ProductColorOption } from "@/data/products";
import { formatPrice } from "@/data/products";
import { getAccessoryGalleryImages } from "@/data/accessoryImageAssets";
import { useShopCartActions } from "@/context/ShopContext";
import {
  getAccessoryAdvantages,
  getAccessoryDeliveryItems,
  getAccessoryDetailImageScaleClass,
  getAccessoryLongDescription,
  getAccessoryShortDescription,
  getAccessoryUnitCount,
} from "@/lib/accessoryDetail";
import {
  getSmartphoneCompatibilityGroups,
  productNeedsDeviceSelection,
} from "@/lib/deviceCompatibility";
import { isHuellenProduct, isPanzerfolieProduct } from "@/lib/storeCatalog";
import { AccessoryGallery } from "./AccessoryGallery";
import { ProductDeliveryCard } from "./ProductDeliveryCard";

interface AccessoryDetailViewProps {
  product: Product;
}

export function AccessoryDetailView({ product }: AccessoryDetailViewProps) {
  const { addToCart, openCart } = useShopCartActions();
  const [selectedColor, setSelectedColor] = useState<ProductColorOption | null>(
    product.colors?.[0] ?? null,
  );
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

  const needsDevice = productNeedsDeviceSelection(product);
  // Katalog einmal beziehen, nicht bei jeder Dropdown-Auswahl neu berechnen.
  const deviceGroups = useMemo(
    () => (needsDevice ? getSmartphoneCompatibilityGroups() : []),
    [needsDevice],
  );
  const selectedDeviceLabel = useMemo(() => {
    if (!selectedDeviceId) return undefined;
    for (const group of deviceGroups) {
      const match = group.options.find((option) => option.id === selectedDeviceId);
      if (match) return match.label;
    }
    return undefined;
  }, [deviceGroups, selectedDeviceId]);

  const galleryImages = getAccessoryGalleryImages(product.id, product.imageSrc);
  const description = getAccessoryShortDescription(product);
  const longDescription = getAccessoryLongDescription(product);
  const advantages = getAccessoryAdvantages(product);
  const deliveryItems = getAccessoryDeliveryItems(product, selectedDeviceLabel);
  const unitCount = getAccessoryUnitCount(product);
  const imageScaleClass = getAccessoryDetailImageScaleClass(product);
  const storeHref = isPanzerfolieProduct(product)
    ? "/store?category=panzerfolien"
    : isHuellenProduct(product)
      ? "/store"
      : "/store?category=gadgets";

  const canAddToCart = !needsDevice || Boolean(selectedDeviceId);

  function handleAddToCart() {
    if (!canAddToCart) return;
    addToCart({
      productId: product.id,
      quantity: 1,
      deviceId: needsDevice ? selectedDeviceId : undefined,
    });
    openCart();
  }

  return (
    <div className="bg-background pb-10 pt-[72px] md:pt-[76px]">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8 lg:px-10">
        <nav className="mb-4 text-[13px] text-text-secondary">
          <Link href="/store" className="hover:text-accent hover:underline">
            Store
          </Link>
          <span className="mx-2">/</span>
          <Link href={storeHref} className="hover:text-accent hover:underline">
            Zubehör
          </Link>
          <span className="mx-2">/</span>
          <span className="text-text-primary">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-8 xl:gap-12">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="pt-3 lg:pt-4">
              <div className="overflow-hidden rounded-[20px] border border-border bg-white shadow-[var(--shadow-card)]">
                <div className="px-3 py-4 md:px-5 md:py-6">
                  <AccessoryGallery
                    images={galleryImages}
                    alt={product.name}
                    fallbackType={product.imageType}
                    imageScaleClass={imageScaleClass}
                  />
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0 pt-3 lg:pt-4">
            <header className="mb-5 text-center lg:text-left">
              <p className="text-[13px] font-medium uppercase tracking-wide text-text-secondary">
                {product.brand}
              </p>
              <h1 className="mt-1 text-[26px] font-bold tracking-[-0.03em] text-text-primary lg:text-[32px] xl:text-[36px]">
                {product.name}
              </h1>
              <p className="mt-2 text-[14px] leading-relaxed text-text-secondary lg:text-[15px]">
                {description}
              </p>
              <p className="mt-4 text-[28px] font-semibold tracking-tight text-text-primary lg:text-[30px]">
                {formatPrice(product.price)}
              </p>
            </header>

            {product.colors && product.colors.length > 1 && (
              <div className="mb-5">
                <p className="mb-2 text-[13px] font-medium text-text-primary">Farbe</p>
                <div className="flex flex-wrap items-center gap-2">
                  {product.colors.map((color) => {
                    const isSelected = selectedColor?.id === color.id;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        aria-label={`Farbe ${color.label}`}
                        aria-pressed={isSelected}
                        onClick={() => setSelectedColor(color)}
                        className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
                          isSelected
                            ? "bg-accent text-white"
                            : "border border-border bg-surface-card text-text-primary hover:border-accent"
                        }`}
                      >
                        {color.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {needsDevice && (
              <div className="mb-5 rounded-[20px] border border-border bg-surface-card p-4 shadow-[var(--shadow-card)] sm:p-5">
                <p className="text-[13px] font-medium text-text-primary">Kompatibilität</p>
                <label
                  htmlFor="accessory-device-select"
                  className="mt-2 block text-[13px] text-text-secondary"
                >
                  Für welches Smartphone?
                </label>
                <select
                  id="accessory-device-select"
                  value={selectedDeviceId}
                  onChange={(event) => setSelectedDeviceId(event.target.value)}
                  className="shop-filter-control mt-2 min-h-[44px] w-full text-[15px]"
                >
                  <option value="">Smartphone-Modell auswählen</option>
                  {deviceGroups.map((group) => (
                    <optgroup key={group.brand} label={group.brand}>
                      {group.options.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {selectedDeviceLabel ? (
                  <p className="mt-2 text-[13px] font-medium text-[#1a7f37]">
                    ✓ Passgenau für dein ausgewähltes Modell
                  </p>
                ) : (
                  <p className="mt-2 text-[13px] text-text-secondary">
                    Bitte wähle dein Smartphone-Modell aus, um fortzufahren.
                  </p>
                )}
                {unitCount > 1 && (
                  <p className="mt-2 text-[13px] font-medium text-text-primary">
                    {unitCount} Stück im Lieferumfang
                  </p>
                )}
              </div>
            )}

            <div className="rounded-[20px] border border-border bg-surface-card p-4 shadow-[var(--shadow-card)] sm:p-5">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="btn-techbuy-primary min-h-[48px] w-full !text-[15px] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {canAddToCart ? "In den Warenkorb" : "Bitte Smartphone auswählen"}
              </button>
              <p className="mt-3 text-center text-[12px] text-text-secondary">
                Kostenloser Versand ab 50 € · 30 Tage Rückgabe
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-[24px] border border-white/50 bg-white/30 px-6 py-7 backdrop-blur-md md:px-8 md:py-8">
                <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-text-primary">
                  Produktinfo
                </h2>
                {longDescription.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-4 text-[15px] leading-relaxed text-text-secondary first:mt-4"
                  >
                    {paragraph}
                  </p>
                ))}
                {advantages.length > 0 && (
                  <ul className="mt-5 space-y-2 border-t border-border pt-5">
                    {advantages.map((advantage) => (
                      <li
                        key={advantage}
                        className="flex items-center gap-2 text-[14px] text-text-primary"
                      >
                        <span className="text-[#1a7f37]">✓</span>
                        {advantage}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <ProductDeliveryCard items={deliveryItems} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

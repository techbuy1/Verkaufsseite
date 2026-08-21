"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ConditionId, PremiumProduct } from "@/types/product";
import {
  getColorVariant,
  getDefaultAvailableColorId,
  getDefaultAvailableStorage,
  getProductPrice,
  getStorageOptionsForColor,
} from "@/data/premiumCatalog";
import { formatPrice } from "@/data/products";
import { getColorDefinitionsForSlug } from "@/data/productImageMap";
import {
  getColorAvailabilityMap,
  getConditionAvailabilityMap,
  getDefaultAvailableConditionId,
  getStorageAvailabilityMap,
  getVariantStock,
  isPresaleProduct,
  LOW_STOCK_THRESHOLD,
  validateVariantPurchase,
} from "@/lib/productAvailability";
import { CONDITION_IDS } from "@/lib/conditions";
import { getImageTypeForCategory } from "@/lib/productAdapters";
import { getProductModelPath } from "@/lib/productModels";
import { useShop } from "@/context/ShopContext";
import {
  DEVICE_ACCESSORY,
  emptyDeviceAddonSelection,
  screenProtectorIdFromChoice,
  type DeviceAddonSelection,
} from "@/data/deviceAccessories";
import { ProductAccessoriesPicker } from "./ProductAccessoriesPicker";
import { ProductDeliveryCard } from "./ProductDeliveryCard";
import { ProductInfo } from "./ProductInfo";
import { ProductMediaPanel } from "./ProductMediaPanel";
import { ProductNewsletterSection } from "./ProductNewsletterSection";
import { ProductTabs } from "./ProductTabs";
import { PurchaseBox } from "./PurchaseBox";
import { StickyCartBar } from "./StickyCartBar";
import type { ConditionSelectorOption } from "./ConditionSelector";

interface ProductDetailViewProps {
  product: PremiumProduct;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const { addToCart, openCart } = useShop();
  const defaultColorId = getDefaultAvailableColorId(product);
  const defaultStorage = getDefaultAvailableStorage(product, defaultColorId).storage;
  const [selectedColorId, setSelectedColorId] = useState(defaultColorId);
  const [selectedStorage, setSelectedStorage] = useState(defaultStorage);
  const [selectedCondition, setSelectedCondition] = useState<ConditionId>(
    getDefaultAvailableConditionId(product, defaultColorId, defaultStorage),
  );
  const [taxAccepted, setTaxAccepted] = useState(false);
  const [addons, setAddons] = useState<DeviceAddonSelection>(emptyDeviceAddonSelection);

  const [showStickyBar, setShowStickyBar] = useState(false);

  const purchaseRef = useRef<HTMLDivElement>(null);

  const colorAvailability = useMemo(() => getColorAvailabilityMap(product), [product]);

  const selectedColor = useMemo(
    () => getColorVariant(product, selectedColorId),
    [product, selectedColorId],
  );

  const registryColors = useMemo(
    () => getColorDefinitionsForSlug(product.slug) ?? [],
    [product.slug],
  );

  const selectedRegistryColor = useMemo(
    () =>
      registryColors.find((color) => color.id === selectedColor.id) ??
      registryColors.find(
        (color) => color.name.toLowerCase() === selectedColor.colorName.toLowerCase(),
      ),
    [registryColors, selectedColor],
  );

  const colorStorageOptions = useMemo(
    () => getStorageOptionsForColor(product, selectedColorId),
    [product, selectedColorId],
  );

  const storageAvailability = useMemo(
    () => getStorageAvailabilityMap(product, selectedColorId),
    [product, selectedColorId],
  );

  const conditionAvailability = useMemo(
    () => getConditionAvailabilityMap(product, selectedColorId, selectedStorage),
    [product, selectedColorId, selectedStorage],
  );

  const conditionOptions: ConditionSelectorOption[] = useMemo(
    () =>
      CONDITION_IDS.map((condition) => {
        const entry = conditionAvailability[condition];
        return {
          condition,
          label: entry.label,
          price: entry.price,
          stock: entry.stock,
          active: entry.active,
          available: entry.available,
          note: entry.note,
          savings: entry.savings,
          basePrice: entry.basePrice,
        };
      }),
    [conditionAvailability],
  );

  const price = useMemo(
    () => getProductPrice(product, selectedStorage, selectedColorId, selectedCondition),
    [product, selectedStorage, selectedColorId, selectedCondition],
  );

  const newBasePrice = useMemo(
    () => getProductPrice(product, selectedStorage, selectedColorId, "new"),
    [product, selectedStorage, selectedColorId],
  );

  const savingsVsNew = Math.max(0, Math.round((newBasePrice - price) * 100) / 100);

  const variantStock = useMemo(
    () => getVariantStock(product, selectedColorId, selectedStorage, selectedCondition),
    [product, selectedColorId, selectedStorage, selectedCondition],
  );

  const purchaseValidation = useMemo(
    () =>
      validateVariantPurchase(
        product,
        selectedColorId,
        selectedStorage,
        1,
        selectedCondition,
      ),
    [product, selectedColorId, selectedStorage, selectedCondition],
  );

  useEffect(() => {
    if (!colorAvailability[selectedColorId]) {
      const nextColorId = getDefaultAvailableColorId(product);
      const nextStorage = getDefaultAvailableStorage(product, nextColorId).storage;
      setSelectedColorId(nextColorId);
      setSelectedStorage(nextStorage);
      setSelectedCondition(
        getDefaultAvailableConditionId(product, nextColorId, nextStorage),
      );
      return;
    }

    const stockForSelection = storageAvailability[selectedStorage] ?? 0;
    if (stockForSelection <= 0) {
      const fallback = getDefaultAvailableStorage(product, selectedColorId).storage;
      if (fallback) {
        setSelectedStorage(fallback);
        setSelectedCondition(
          getDefaultAvailableConditionId(product, selectedColorId, fallback),
        );
      }
      return;
    }

    const current = conditionAvailability[selectedCondition];
    if (current?.available) return;

    const nextCondition = getDefaultAvailableConditionId(
      product,
      selectedColorId,
      selectedStorage,
    );
    if (nextCondition !== selectedCondition) {
      setSelectedCondition(nextCondition);
    }
  }, [
    colorAvailability,
    conditionAvailability,
    product,
    selectedColorId,
    selectedCondition,
    selectedStorage,
    storageAvailability,
  ]);

  const activeColorIndex = product.images.findIndex((img) => img.id === selectedColor.id);
  const modelPath = getProductModelPath(product.slug);

  useEffect(() => {
    const target = purchaseRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  function handleColorChange(colorId: string) {
    if (!colorAvailability[colorId]) return;
    const nextStorage = getDefaultAvailableStorage(product, colorId).storage;
    setSelectedColorId(colorId);
    setSelectedStorage(nextStorage);
    setSelectedCondition(getDefaultAvailableConditionId(product, colorId, nextStorage));
  }

  function handleStorageChange(storage: string) {
    setSelectedStorage(storage);
    setSelectedCondition(
      getDefaultAvailableConditionId(product, selectedColorId, storage),
    );
  }

  function handleAddToCart() {
    if (!taxAccepted || !purchaseValidation.ok) return;
    addToCart({
      productId: product.id,
      colorId: selectedColor.id,
      storage: selectedStorage,
      condition: selectedCondition,
    });

    const foilId = screenProtectorIdFromChoice(addons.screenProtector);
    if (foilId) addToCart({ productId: foilId });
    if (addons.clearCase) addToCart({ productId: DEVICE_ACCESSORY.caseClear.id });
    if (addons.usbCable) addToCart({ productId: DEVICE_ACCESSORY.cableUsbc.id });
    if (addons.siliconeCase) {
      addToCart({
        productId: DEVICE_ACCESSORY.caseSiliconeApple.id,
        colorId: addons.siliconeColorId,
      });
    }

    openCart();
  }

  const purchaseBoxProps = {
    price,
    stock: variantStock,
    colors: product.images,
    colorAvailability,
    storageOptions: colorStorageOptions,
    storageAvailability,
    conditionOptions,
    selectedColorId: selectedColor.id,
    selectedStorage,
    selectedCondition,
    taxAccepted,
    onColorChange: handleColorChange,
    onStorageChange: handleStorageChange,
    onConditionChange: setSelectedCondition,
    onTaxChange: setTaxAccepted,
    onAddToCart: handleAddToCart,
    canPurchase: purchaseValidation.ok,
    isPresale: isPresaleProduct(product),
    presaleShipLabel: product.presaleShipLabel,
    lowStockHint:
      variantStock > 0 && variantStock <= LOW_STOCK_THRESHOLD
        ? `Nur noch ${variantStock} verfügbar`
        : undefined,
  };

  const mediaProps = {
    images: product.images,
    alt: product.name,
    activeIndex: activeColorIndex >= 0 ? activeColorIndex : 0,
    fallbackType: getImageTypeForCategory(product.category),
    modelPath,
    colorHex: selectedColor.colorCode,
    colorModelPath: selectedRegistryColor?.model,
    screenTextureUrl: selectedRegistryColor?.wallpaper,
    accentColor: selectedColor.colorCode,
  };

  const titleLine = `${product.brand} ${product.name}${
    selectedStorage ? ` ${selectedStorage}` : ""
  }${selectedColor.colorName ? ` ${selectedColor.colorName}` : ""}`;

  const selectedConditionLabel =
    conditionAvailability[selectedCondition]?.label ?? selectedCondition;

  const savingsHint =
    savingsVsNew > 0 ? (
      <p className="mt-1 text-[12px] font-medium text-accent">
        {formatPrice(savingsVsNew)} günstiger als Neu
      </p>
    ) : null;

  return (
    <>
      <StickyCartBar
        visible={showStickyBar}
        productName={`${product.brand} ${product.name}`}
        productImage={selectedColor.image}
        fallbackType={getImageTypeForCategory(product.category)}
        price={price}
        taxAccepted={taxAccepted}
        canPurchase={purchaseValidation.ok}
        onAddToCart={handleAddToCart}
      />

      <div className="bg-background pb-10 pt-[72px] md:pt-[76px]">
        <div className="mx-auto max-w-[1280px] px-5 md:px-8 lg:px-10">
          {/* ——— Mobile ——— */}
          <div className="lg:hidden">
            <header className="pt-3 text-center">
              <h1 className="text-[26px] font-bold tracking-[-0.03em] text-text-primary">
                {titleLine}
              </h1>
              {product.shortDescription && (
                <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">
                  {product.shortDescription}
                </p>
              )}
            </header>

            <div className="mt-4">
              <ProductMediaPanel {...mediaProps} />
            </div>

            <div className="mt-4 text-center">
              <p className="text-[28px] font-semibold tracking-tight text-text-primary">
                {formatPrice(price)}
              </p>
              {savingsHint}
              <p className="mt-1 text-[12px] text-text-secondary">
                {selectedConditionLabel} · inkl. MwSt.
              </p>
            </div>

            <div ref={purchaseRef} className="mt-5 space-y-3">
              <PurchaseBox {...purchaseBoxProps} hidePrice compact />
              <ProductAccessoriesPicker
                product={product}
                selection={addons}
                onChange={setAddons}
              />
            </div>

            <div className="mt-7 space-y-4">
              <ProductInfo product={product} />
              <ProductDeliveryCard items={product.deliveryContent} />
            </div>
          </div>

          {/* ——— Desktop: sticky media | scrolling config ——— */}
          <div className="hidden lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-8 xl:gap-12">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="pt-4">
                <ProductMediaPanel {...mediaProps} />
              </div>
            </aside>

            <div className="min-w-0 pt-4 pb-3">
              <header className="mb-4 flex items-start justify-between gap-5">
                <div className="min-w-0">
                  <h1 className="text-[32px] font-bold tracking-[-0.03em] text-text-primary xl:text-[36px]">
                    {titleLine}
                  </h1>
                  {product.shortDescription && (
                    <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
                      {product.shortDescription}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[30px] font-semibold tracking-tight text-text-primary xl:text-[34px]">
                    {formatPrice(price)}
                  </p>
                  {savingsHint}
                  <p className="mt-1 text-[12px] text-text-secondary">
                    {selectedConditionLabel} · inkl. MwSt.
                  </p>
                </div>
              </header>

              <div ref={purchaseRef} className="space-y-3.5">
                <PurchaseBox {...purchaseBoxProps} hidePrice />
                <ProductAccessoriesPicker
                  product={product}
                  selection={addons}
                  onChange={setAddons}
                />
              </div>

              <div className="mt-5">
                <ProductInfo product={product} showHeading />
              </div>

              <div className="mt-4">
                <ProductDeliveryCard items={product.deliveryContent} />
              </div>
            </div>
          </div>

          <ProductTabs product={product} />
        </div>

        <ProductNewsletterSection />
      </div>
    </>
  );
}

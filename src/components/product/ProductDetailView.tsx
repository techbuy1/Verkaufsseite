"use client";

import { memo, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { ConditionId, PremiumProduct } from "@/types/product";
import {
  getColorVariant,
  getDefaultAvailableColorId,
  getDefaultAvailableStorage,
  getProductPrice,
  getProductRegularPrice,
} from "@/data/premiumCatalog";
import { formatPrice } from "@/data/products";
import { getColorDefinitionsForSlug } from "@/data/productImageMap";
import {
  buildProductConfigIndex,
  getConditionAvailabilityFromIndex,
  getDefaultAvailableConditionId,
  getVariantStock,
  isPresaleProduct,
  isProductInStock,
  LOW_STOCK_THRESHOLD,
  validateVariantPurchase,
} from "@/lib/productAvailability";
import { CONDITION_DEFINITIONS, CONDITION_IDS } from "@/lib/conditions";
import { getImageTypeForCategory } from "@/lib/productAdapters";
import { getProductModelPath } from "@/lib/productModels";
import { useShopCartActions } from "@/context/ShopContext";
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

type SelectionState = {
  colorId: string;
  storage: string;
  condition: ConditionId;
};

type SelectionAction =
  | { type: "SET_ALL"; colorId: string; storage: string; condition: ConditionId }
  | { type: "SET_STORAGE"; storage: string; condition: ConditionId }
  | { type: "SET_CONDITION"; condition: ConditionId };

function createInitialSelection(product: PremiumProduct): SelectionState {
  const colorId = getDefaultAvailableColorId(product);
  const storage = getDefaultAvailableStorage(product, colorId).storage;
  return {
    colorId,
    storage,
    condition: getDefaultAvailableConditionId(product, colorId, storage),
  };
}

function selectionReducer(
  state: SelectionState,
  action: SelectionAction,
): SelectionState {
  switch (action.type) {
    case "SET_ALL":
      return {
        colorId: action.colorId,
        storage: action.storage,
        condition: action.condition,
      };
    case "SET_STORAGE":
      return { ...state, storage: action.storage, condition: action.condition };
    case "SET_CONDITION":
      return { ...state, condition: action.condition };
  }
}

const MemoProductInfo = memo(ProductInfo);
const MemoProductDeliveryCard = memo(ProductDeliveryCard);
const MemoProductTabs = memo(ProductTabs);
const MemoProductNewsletterSection = memo(ProductNewsletterSection);

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const { addToCart, openCart } = useShopCartActions();
  const configIndex = useMemo(() => buildProductConfigIndex(product), [product]);
  const [selection, dispatchSelection] = useReducer(
    selectionReducer,
    product,
    createInitialSelection,
  );
  const { colorId: selectedColorId, storage: selectedStorage, condition: selectedCondition } =
    selection;

  const [taxAccepted, setTaxAccepted] = useState(false);
  const [addons, setAddons] = useState<DeviceAddonSelection>(emptyDeviceAddonSelection);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const purchaseRef = useRef<HTMLDivElement>(null);

  const colorAvailability = configIndex.colorAvailability;
  const storageAvailability = useMemo(
    () => configIndex.storageByColor[selectedColorId] ?? {},
    [configIndex.storageByColor, selectedColorId],
  );
  const colorStorageOptions = useMemo(
    () => configIndex.storageOptionsByColor[selectedColorId] ?? [],
    [configIndex.storageOptionsByColor, selectedColorId],
  );
  const conditionAvailability = useMemo(
    () => getConditionAvailabilityFromIndex(configIndex, selectedColorId, selectedStorage),
    [configIndex, selectedColorId, selectedStorage],
  );

  const selectedColor = useMemo(
    () => getColorVariant(configIndex.synced, selectedColorId),
    [configIndex.synced, selectedColorId],
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

  const conditionOptions: ConditionSelectorOption[] = useMemo(
    () =>
      CONDITION_IDS.map((condition) => {
        const entry = conditionAvailability[condition];
        return {
          condition,
          label: entry?.label ?? CONDITION_DEFINITIONS[condition].label,
          price: entry?.price ?? 0,
          stock: entry?.stock ?? 0,
          active: entry?.active ?? true,
          available: entry?.available ?? false,
          note: entry?.note,
          savings: entry?.savings,
          basePrice: entry?.basePrice,
        };
      }).filter((entry) => entry.active),
    [conditionAvailability],
  );

  const price = useMemo(
    () => getProductPrice(product, selectedStorage, selectedColorId, selectedCondition),
    [product, selectedStorage, selectedColorId, selectedCondition],
  );

  // Regulärpreis ohne aktives Angebot — nur für den Streichpreis, nie für
  // die eigentliche Kaufberechnung (die bleibt bei `price`).
  const regularPrice = useMemo(
    () => getProductRegularPrice(product, selectedStorage, selectedColorId, selectedCondition),
    [product, selectedStorage, selectedColorId, selectedCondition],
  );
  const activePromotionPercent =
    regularPrice > price ? Math.round((1 - price / regularPrice) * 100) : 0;

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
      const next = createInitialSelection(product);
      dispatchSelection({ type: "SET_ALL", ...next });
      return;
    }

    const stockForSelection = storageAvailability[selectedStorage] ?? 0;
    if (stockForSelection <= 0) {
      const fallback = getDefaultAvailableStorage(product, selectedColorId).storage;
      if (fallback) {
        dispatchSelection({
          type: "SET_STORAGE",
          storage: fallback,
          condition: getDefaultAvailableConditionId(product, selectedColorId, fallback),
        });
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
      dispatchSelection({ type: "SET_CONDITION", condition: nextCondition });
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
  const fallbackType = getImageTypeForCategory(product.category);

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

  const handleColorChange = useCallback(
    (colorId: string) => {
      if (!configIndex.colorAvailability[colorId]) return;
      const nextStorage = getDefaultAvailableStorage(product, colorId).storage;
      dispatchSelection({
        type: "SET_ALL",
        colorId,
        storage: nextStorage,
        condition: getDefaultAvailableConditionId(product, colorId, nextStorage),
      });
    },
    [configIndex.colorAvailability, product],
  );

  const handleStorageChange = useCallback(
    (storage: string) => {
      const stock = configIndex.storageByColor[selectedColorId]?.[storage] ?? 0;
      if (stock <= 0 && !isPresaleProduct(product)) return;
      dispatchSelection({
        type: "SET_STORAGE",
        storage,
        condition: getDefaultAvailableConditionId(product, selectedColorId, storage),
      });
    },
    [configIndex.storageByColor, product, selectedColorId],
  );

  const handleConditionChange = useCallback((condition: ConditionId) => {
    dispatchSelection({ type: "SET_CONDITION", condition });
  }, []);

  const handleAddToCart = useCallback(() => {
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
  }, [
    addToCart,
    addons,
    openCart,
    product.id,
    purchaseValidation.ok,
    selectedColor.id,
    selectedCondition,
    selectedStorage,
    taxAccepted,
  ]);

  const fullyOutOfStock = !isProductInStock(product);
  const isPresale = isPresaleProduct(product);
  const lowStockHint =
    variantStock > 0 && variantStock <= LOW_STOCK_THRESHOLD
      ? `Nur noch ${variantStock} verfügbar`
      : undefined;

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
        fallbackType={fallbackType}
        price={price}
        taxAccepted={taxAccepted}
        canPurchase={purchaseValidation.ok}
        onAddToCart={handleAddToCart}
      />

      <div className="bg-background pb-10 pt-[72px] md:pt-[76px]">
        <div className="mx-auto max-w-[1280px] px-5 md:px-8 lg:px-10">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-8 xl:gap-12">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="pt-3 lg:pt-4">
                <ProductMediaPanel
                  images={product.images}
                  alt={product.name}
                  activeIndex={activeColorIndex >= 0 ? activeColorIndex : 0}
                  fallbackType={fallbackType}
                  modelPath={modelPath}
                  colorHex={selectedColor.colorCode}
                  colorModelPath={selectedRegistryColor?.model}
                  screenTextureUrl={selectedRegistryColor?.wallpaper}
                  accentColor={selectedColor.colorCode}
                />
              </div>
            </aside>

            <div className="min-w-0 pt-3 lg:pt-4">
              <header className="mb-4 text-center lg:flex lg:items-start lg:justify-between lg:gap-5 lg:text-left">
                <div className="min-w-0">
                  <h1 className="text-[26px] font-bold tracking-[-0.03em] text-text-primary lg:text-[32px] xl:text-[36px]">
                    {titleLine}
                  </h1>
                  {product.shortDescription && (
                    <p className="mt-2 text-[14px] leading-relaxed text-text-secondary lg:text-[15px]">
                      {product.shortDescription}
                    </p>
                  )}
                </div>
                <div className="mt-3 shrink-0 lg:mt-0 lg:text-right">
                  {activePromotionPercent > 0 && (
                    <p className="text-[15px] text-text-secondary line-through">
                      {formatPrice(regularPrice)}
                    </p>
                  )}
                  <div className="flex items-baseline gap-2 lg:justify-end">
                    <p className="text-[28px] font-semibold tracking-tight text-text-primary lg:text-[30px] xl:text-[34px]">
                      {formatPrice(price)}
                    </p>
                    {activePromotionPercent > 0 && (
                      <span className="badge-techbuy bg-sale/10 text-sale">
                        -{activePromotionPercent}%
                      </span>
                    )}
                  </div>
                  {savingsHint}
                  <p className="mt-1 text-[12px] text-text-secondary">
                    {selectedConditionLabel} · inkl. MwSt.
                  </p>
                </div>
              </header>

              <div ref={purchaseRef} className="space-y-3 lg:space-y-3.5">
                <PurchaseBox
                  price={price}
                  stock={variantStock}
                  colors={product.images}
                  colorAvailability={colorAvailability}
                  storageOptions={colorStorageOptions}
                  storageAvailability={storageAvailability}
                  conditionOptions={conditionOptions}
                  selectedColorId={selectedColor.id}
                  selectedStorage={selectedStorage}
                  selectedCondition={selectedCondition}
                  taxAccepted={taxAccepted}
                  onColorChange={handleColorChange}
                  onStorageChange={handleStorageChange}
                  onConditionChange={handleConditionChange}
                  onTaxChange={setTaxAccepted}
                  onAddToCart={handleAddToCart}
                  canPurchase={purchaseValidation.ok}
                  isPresale={isPresale}
                  presaleShipLabel={product.presaleShipLabel}
                  fullyOutOfStock={fullyOutOfStock}
                  lowStockHint={lowStockHint}
                  hidePrice
                  compact
                />
                <ProductAccessoriesPicker
                  product={product}
                  selection={addons}
                  onChange={setAddons}
                />
              </div>

              <div className="mt-5 space-y-4 lg:mt-5">
                <MemoProductInfo product={product} showHeading />
                <MemoProductDeliveryCard items={product.deliveryContent} />
              </div>
            </div>
          </div>

          <MemoProductTabs product={product} />
        </div>

        <MemoProductNewsletterSection />
      </div>
    </>
  );
}

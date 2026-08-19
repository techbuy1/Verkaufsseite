import type {
  ConditionId,
  ConditionOption,
  PremiumProduct,
  StorageOption,
} from "@/types/product";
import {
  ensureStorageConditions,
  getConditionOption,
  getDefaultAvailableCondition,
  getPurchasableConditions,
  getStorageMinAvailablePrice,
  getStorageOptionTotalStock,
  isConditionId,
} from "@/lib/conditions";
import {
  getDefaultColor,
  getDefaultStorage,
  getProductVariants,
  getStorageOption,
  getVariantByColorId,
  syncProductVariants,
} from "@/lib/productVariants";

export type ProductAvailabilityStatus = "available" | "out_of_stock" | "archived";

export const LOW_STOCK_THRESHOLD = 3;
export const DEFAULT_VARIANT_STOCK = 24;

export function getStorageOptionStock(
  option: StorageOption,
  fallback = DEFAULT_VARIANT_STOCK,
): number {
  const ensured = ensureStorageConditions(option, fallback);
  if (Array.isArray(option.conditions) && option.conditions.length > 0) {
    return getStorageOptionTotalStock(ensured, true);
  }
  if (typeof option.stock === "number" && Number.isFinite(option.stock)) {
    return Math.max(0, Math.floor(option.stock));
  }
  return Math.max(0, Math.floor(fallback));
}

export function normalizeVariantStock(
  option: StorageOption,
  product: PremiumProduct,
): StorageOption {
  const fallback =
    typeof product.stock === "number" && Number.isFinite(product.stock)
      ? product.stock
      : DEFAULT_VARIANT_STOCK;
  return ensureStorageConditions(option, fallback);
}

export function getConditionStock(
  product: PremiumProduct,
  colorId: string,
  storage: string,
  condition: ConditionId,
): number {
  const synced = syncProductVariants(product);
  const option = getStorageOption(synced, storage, colorId);
  const entry = getConditionOption(option, condition);
  if (!entry.active) return 0;
  return entry.stock;
}

export function getVariantStock(
  product: PremiumProduct,
  colorId: string,
  storage: string,
  condition?: ConditionId,
): number {
  if (condition) {
    return getConditionStock(product, colorId, storage, condition);
  }
  const synced = syncProductVariants(product);
  const option = getStorageOption(synced, storage, colorId);
  return getStorageOptionStock(option, synced.stock ?? DEFAULT_VARIANT_STOCK);
}

export function getColorStockTotal(product: PremiumProduct, colorId: string): number {
  const variant = getVariantByColorId(syncProductVariants(product), colorId);
  return variant.storageOptions.reduce(
    (sum, option) => sum + getStorageOptionStock(option, product.stock ?? DEFAULT_VARIANT_STOCK),
    0,
  );
}

export function isColorAvailable(product: PremiumProduct, colorId: string): boolean {
  return getColorStockTotal(product, colorId) > 0;
}

export function isStorageOptionAvailable(
  product: PremiumProduct,
  colorId: string,
  storage: string,
): boolean {
  return getVariantStock(product, colorId, storage) > 0;
}

export function isConditionAvailable(
  product: PremiumProduct,
  colorId: string,
  storage: string,
  condition: ConditionId,
): boolean {
  return getConditionStock(product, colorId, storage, condition) > 0;
}

export function getTotalStock(product: PremiumProduct): number {
  const variants = getProductVariants(syncProductVariants(product));
  return variants.reduce(
    (sum, variant) =>
      sum +
      variant.storageOptions.reduce(
        (variantSum, option) =>
          variantSum + getStorageOptionStock(option, product.stock ?? DEFAULT_VARIANT_STOCK),
        0,
      ),
    0,
  );
}

export function getProductAvailabilityStatus(
  product: PremiumProduct,
): ProductAvailabilityStatus {
  if (product.manualArchive) return "archived";
  return getTotalStock(product) > 0 ? "available" : "out_of_stock";
}

export function isProductVisibleInShop(product: PremiumProduct): boolean {
  return !product.manualArchive && getTotalStock(product) > 0;
}

export function isProductAvailable(product: PremiumProduct): boolean {
  return isProductVisibleInShop(product);
}

export function isLowStockProduct(product: PremiumProduct): boolean {
  const total = getTotalStock(product);
  return total > 0 && total <= LOW_STOCK_THRESHOLD;
}

export function getAvailablePremiumProducts(products: PremiumProduct[]): PremiumProduct[] {
  return products.filter(isProductVisibleInShop);
}

export function getProductMinAvailablePrice(product: PremiumProduct): number {
  const variants = getProductVariants(syncProductVariants(product));
  let min = Infinity;

  for (const variant of variants) {
    for (const option of variant.storageOptions) {
      const price = getStorageMinAvailablePrice(option);
      if (price !== null && price > 0 && price < min) {
        min = price;
      }
    }
  }

  return min === Infinity ? 0 : Math.round(min * 100) / 100;
}

export function getProductMinAvailableConditionLabel(
  product: PremiumProduct,
): string | undefined {
  const variants = getProductVariants(syncProductVariants(product));
  let best: ConditionOption | null = null;

  for (const variant of variants) {
    for (const option of variant.storageOptions) {
      for (const condition of getPurchasableConditions(option)) {
        if (!best || condition.price < best.price) {
          best = condition;
        }
      }
    }
  }

  return best?.label;
}

export function getDefaultAvailableColorId(product: PremiumProduct): string {
  const synced = syncProductVariants(product);
  const available = synced.images.find((image) => isColorAvailable(synced, image.id));
  return available?.id ?? getDefaultColor(synced).id;
}

export function getDefaultAvailableStorage(
  product: PremiumProduct,
  colorId?: string,
): StorageOption {
  const synced = syncProductVariants(product);
  const resolvedColorId = colorId ?? getDefaultAvailableColorId(synced);
  const options = getVariantByColorId(synced, resolvedColorId).storageOptions;
  const available = options.find(
    (option) =>
      getStorageOptionStock(option, synced.stock ?? DEFAULT_VARIANT_STOCK) > 0,
  );
  return available ?? getDefaultStorage(synced, resolvedColorId);
}

export function getDefaultAvailableConditionId(
  product: PremiumProduct,
  colorId: string,
  storage: string,
): ConditionId {
  const option = getStorageOption(syncProductVariants(product), storage, colorId);
  return getDefaultAvailableCondition(option).condition;
}

export function getColorAvailabilityMap(product: PremiumProduct): Record<string, boolean> {
  const synced = syncProductVariants(product);
  return Object.fromEntries(
    synced.images.map((image) => [image.id, isColorAvailable(synced, image.id)]),
  );
}

export function getStorageAvailabilityMap(
  product: PremiumProduct,
  colorId: string,
): Record<string, number> {
  const synced = syncProductVariants(product);
  const variant = getVariantByColorId(synced, colorId);
  return Object.fromEntries(
    variant.storageOptions.map((option) => [
      option.storage,
      getStorageOptionStock(option, synced.stock ?? DEFAULT_VARIANT_STOCK),
    ]),
  );
}

export function getConditionAvailabilityMap(
  product: PremiumProduct,
  colorId: string,
  storage: string,
): Record<ConditionId, { available: boolean; stock: number; active: boolean; price: number; label: string; note?: string }> {
  const option = getStorageOption(syncProductVariants(product), storage, colorId);
  const ensured = ensureStorageConditions(option);
  return Object.fromEntries(
    (ensured.conditions ?? []).map((entry) => [
      entry.condition,
      {
        available: entry.active && entry.stock > 0 && entry.price > 0,
        stock: entry.stock,
        active: entry.active,
        price: entry.price,
        label: entry.label,
        note: entry.note,
      },
    ]),
  ) as Record<
    ConditionId,
    { available: boolean; stock: number; active: boolean; price: number; label: string; note?: string }
  >;
}

export interface PurchaseValidationResult {
  ok: boolean;
  maxQuantity: number;
  message?: string;
}

export function validateVariantPurchase(
  product: PremiumProduct,
  colorId: string,
  storage: string,
  quantity = 1,
  condition?: ConditionId,
): PurchaseValidationResult {
  const resolvedCondition =
    condition ?? getDefaultAvailableConditionId(product, colorId, storage);
  const stock = getConditionStock(product, colorId, storage, resolvedCondition);

  if (stock <= 0) {
    return {
      ok: false,
      maxQuantity: 0,
      message: "Nicht verfügbar",
    };
  }

  if (quantity > stock) {
    return {
      ok: false,
      maxQuantity: stock,
      message: `Nur noch ${stock} verfügbar`,
    };
  }

  return { ok: true, maxQuantity: stock };
}

export interface CheckoutLineItem {
  productId: string;
  quantity: number;
  colorId?: string;
  color?: string;
  colorName?: string;
  storage?: string;
  condition?: ConditionId | string;
}

export interface CheckoutStockError {
  productId: string;
  message: string;
}

export function validateCheckoutStock(
  items: CheckoutLineItem[],
  products: PremiumProduct[],
): CheckoutStockError[] {
  const errors: CheckoutStockError[] = [];

  for (const item of items) {
    const product = products.find((entry) => entry.id === item.productId);
    if (!product) continue;

    const colorRef = item.colorId ?? item.color ?? item.colorName;
    const colorId =
      (colorRef
        ? product.images.find(
            (image) => image.id === colorRef || image.colorName === colorRef,
          )?.id
        : undefined) ?? getDefaultAvailableColorId(product);
    const storage =
      item.storage ?? getDefaultAvailableStorage(product, colorId).storage;
    const condition = isConditionId(item.condition)
      ? item.condition
      : getDefaultAvailableConditionId(product, colorId, storage);

    const validation = validateVariantPurchase(
      product,
      colorId,
      storage,
      item.quantity,
      condition,
    );

    if (!validation.ok) {
      errors.push({
        productId: item.productId,
        message:
          validation.maxQuantity === 0
            ? "Diese Variante ist leider nicht mehr verfügbar."
            : validation.message ?? "Nicht genügend Bestand verfügbar.",
      });
    }
  }

  return errors;
}

export function reduceVariantStock(
  product: PremiumProduct,
  colorId: string | undefined,
  storage: string | undefined,
  quantity: number,
  condition?: ConditionId | string,
): PremiumProduct {
  const synced = syncProductVariants(product);
  const resolvedColorId = colorId ?? getDefaultAvailableColorId(synced);
  const resolvedStorage =
    storage ?? getDefaultAvailableStorage(synced, resolvedColorId).storage;
  const resolvedCondition = isConditionId(condition)
    ? condition
    : getDefaultAvailableConditionId(synced, resolvedColorId, resolvedStorage);

  const variants = synced.variants?.map((variant) => {
    if (variant.id !== resolvedColorId) return variant;
    return {
      ...variant,
      storageOptions: variant.storageOptions.map((option) => {
        if (option.storage !== resolvedStorage) return option;
        const ensured = ensureStorageConditions(
          option,
          synced.stock ?? DEFAULT_VARIANT_STOCK,
        );
        const conditions = (ensured.conditions ?? []).map((entry) => {
          if (entry.condition !== resolvedCondition) return entry;
          return {
            ...entry,
            stock: Math.max(0, entry.stock - quantity),
          };
        });
        return ensureStorageConditions({ ...ensured, conditions });
      }),
    };
  });

  return syncProductVariants({
    ...synced,
    variants,
    stock: Math.max(0, getTotalStock(synced) - quantity),
  });
}

export function getAvailabilityStats(products: PremiumProduct[]) {
  let availableCount = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let totalStockUnits = 0;

  for (const product of products) {
    const total = getTotalStock(product);
    totalStockUnits += total;
    const status = getProductAvailabilityStatus(product);

    if (status === "available") {
      availableCount += 1;
      if (isLowStockProduct(product)) lowStockCount += 1;
    } else {
      outOfStockCount += 1;
    }
  }

  return {
    availableCount,
    lowStockCount,
    outOfStockCount,
    totalStockUnits,
  };
}

export function getAdminStatusLabel(product: PremiumProduct): {
  emoji: string;
  label: string;
  shopVisible: boolean;
} {
  const status = getProductAvailabilityStatus(product);
  if (status === "archived") {
    return { emoji: "⚫", label: "Manuell archiviert", shopVisible: false };
  }
  if (status === "out_of_stock") {
    return { emoji: "⚫", label: "Ausverkauft", shopVisible: false };
  }
  if (isLowStockProduct(product)) {
    return { emoji: "🟠", label: "Niedriger Bestand", shopVisible: true };
  }
  return { emoji: "🟢", label: "Verfügbar", shopVisible: true };
}

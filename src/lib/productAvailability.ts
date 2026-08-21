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
  getEffectiveConditionStock,
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

export type ProductAvailabilityStatus =
  | "available"
  | "out_of_stock"
  | "archived"
  | "presale";

export const LOW_STOCK_THRESHOLD = 3;
/** Kein Fake-Bestand — ohne expliziten Stock gilt 0 (Shop blendet aus). */
export const DEFAULT_VARIANT_STOCK = 0;

export function isPresaleProduct(product: PremiumProduct): boolean {
  return product.saleMode === "presale" && !product.manualArchive;
}

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
  return getEffectiveConditionStock(option, condition);
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
  if (isPresaleProduct(product)) {
    const variant = getVariantByColorId(syncProductVariants(product), colorId);
    return variant.storageOptions.some((option) =>
      ensureStorageConditions(option).conditions?.some(
        (entry) => entry.active && entry.price > 0,
      ),
    );
  }
  return getColorStockTotal(product, colorId) > 0;
}

export function isStorageOptionAvailable(
  product: PremiumProduct,
  colorId: string,
  storage: string,
): boolean {
  if (isPresaleProduct(product)) {
    const option = getStorageOption(syncProductVariants(product), storage, colorId);
    return (ensureStorageConditions(option).conditions ?? []).some(
      (entry) => entry.active && entry.price > 0,
    );
  }
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
  if (isPresaleProduct(product)) return "presale";
  return getTotalStock(product) > 0 ? "available" : "out_of_stock";
}

export function isProductVisibleInShop(product: PremiumProduct): boolean {
  if (product.manualArchive) return false;
  if (isPresaleProduct(product)) return true;
  return getTotalStock(product) > 0;
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
  const allowZero = isPresaleProduct(product);

  for (const variant of variants) {
    for (const option of variant.storageOptions) {
      if (allowZero) {
        for (const condition of ensureStorageConditions(option).conditions ?? []) {
          if (condition.active && condition.price > 0 && condition.price < min) {
            min = condition.price;
          }
        }
      } else {
        const price = getStorageMinAvailablePrice(option);
        if (price !== null && price > 0 && price < min) {
          min = price;
        }
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
): Record<ConditionId, { available: boolean; stock: number; active: boolean; price: number; label: string; note?: string; savings: number; basePrice: number }> {
  const option = getStorageOption(syncProductVariants(product), storage, colorId);
  const ensured = ensureStorageConditions(option);
  const allowZero = isPresaleProduct(product);
  const basePrice =
    ensured.conditions?.find((entry) => entry.condition === "new")?.price ||
    ensured.price ||
    0;

  return Object.fromEntries(
    (ensured.conditions ?? []).map((entry) => {
      const stock = getEffectiveConditionStock(ensured, entry.condition);
      const price = entry.price;
      const savings = Math.max(0, Math.round((basePrice - price) * 100) / 100);
      return [
        entry.condition,
        {
          available:
            entry.active &&
            price > 0 &&
            (stock > 0 || allowZero),
          stock,
          active: entry.active,
          price,
          label: entry.label,
          note: entry.note,
          savings,
          basePrice,
        },
      ];
    }),
  ) as Record<
    ConditionId,
    {
      available: boolean;
      stock: number;
      active: boolean;
      price: number;
      label: string;
      note?: string;
      savings: number;
      basePrice: number;
    }
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
  const presale = isPresaleProduct(product);

  if (stock <= 0 && !presale) {
    return {
      ok: false,
      maxQuantity: 0,
      message: "Nicht verfügbar",
    };
  }

  if (presale && stock <= 0) {
    return { ok: true, maxQuantity: Math.max(quantity, 99) };
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
        const ownStock =
          ensured.conditions?.find((entry) => entry.condition === resolvedCondition)
            ?.stock ?? 0;

        let conditions = ensured.conditions ?? [];
        if (ownStock > 0) {
          conditions = conditions.map((entry) =>
            entry.condition === resolvedCondition
              ? { ...entry, stock: Math.max(0, entry.stock - quantity) }
              : entry,
          );
        } else if (resolvedCondition !== "new") {
          conditions = conditions.map((entry) =>
            entry.condition === "new"
              ? { ...entry, stock: Math.max(0, entry.stock - quantity) }
              : entry,
          );
        } else {
          conditions = conditions.map((entry) =>
            entry.condition === "new"
              ? { ...entry, stock: Math.max(0, entry.stock - quantity) }
              : entry,
          );
        }

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
  let presaleCount = 0;
  let totalStockUnits = 0;

  for (const product of products) {
    const total = getTotalStock(product);
    totalStockUnits += total;
    const status = getProductAvailabilityStatus(product);

    if (status === "available") {
      availableCount += 1;
      if (isLowStockProduct(product)) lowStockCount += 1;
    } else if (status === "presale") {
      presaleCount += 1;
    } else if (status === "out_of_stock") {
      outOfStockCount += 1;
    }
  }

  return {
    availableCount,
    lowStockCount,
    outOfStockCount,
    presaleCount,
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
    return { emoji: "⚫", label: "Archiviert", shopVisible: false };
  }
  if (status === "presale") {
    return { emoji: "🔵", label: "Vorverkauf", shopVisible: true };
  }
  if (status === "out_of_stock") {
    return { emoji: "⚫", label: "Ausverkauft", shopVisible: false };
  }
  if (isLowStockProduct(product)) {
    return { emoji: "🟠", label: "Niedriger Bestand", shopVisible: true };
  }
  return { emoji: "🟢", label: "Verfügbar", shopVisible: true };
}

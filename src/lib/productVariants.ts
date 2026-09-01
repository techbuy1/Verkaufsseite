import type {
  ConditionId,
  PremiumProduct,
  ProductImageVariant,
  ProductVariant,
  StorageOption,
} from "@/types/product";
import {
  buildVariantSku,
  ensureStorageConditions,
  getEffectivePriceForConditionEntry,
  getConditionOption,
  getDefaultAvailableCondition,
  getPurchasableConditions,
  getStorageMinAvailablePrice,
} from "@/lib/conditions";
import { normalizeVariantStock } from "@/lib/productAvailability";
import { applyPromotionToPrice, findApplicablePromotion, getActivePromotions } from "@/lib/promotions";

const STORAGE_ORDER = ["128 GB", "256 GB", "512 GB", "1 TB", "2 TB"];

export function slugifyColorId(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function sortStorageOptions(options: StorageOption[]): StorageOption[] {
  return [...options].sort((a, b) => {
    const ai = STORAGE_ORDER.indexOf(a.storage.split(" · ")[0] ?? a.storage);
    const bi = STORAGE_ORDER.indexOf(b.storage.split(" · ")[0] ?? b.storage);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

function buildUnionStorageOptions(variants: ProductVariant[]): StorageOption[] {
  const map = new Map<string, number>();
  for (const variant of variants) {
    for (const option of variant.storageOptions) {
      const ensured = ensureStorageConditions(option);
      const minAvailable = getStorageMinAvailablePrice(ensured);
      const price =
        minAvailable ??
        (ensured.price > 0
          ? ensured.price
          : Math.min(
              ...getPurchasableConditions(ensured).map((c) => c.price),
              ensured.conditions?.[0]?.price ?? Infinity,
            ));
      const resolved = Number.isFinite(price) && price !== Infinity ? price : 0;
      const current = map.get(option.storage);
      if (current === undefined || (resolved > 0 && resolved < current) || current <= 0) {
        map.set(option.storage, resolved > 0 ? resolved : current ?? 0);
      }
    }
  }
  return sortStorageOptions(
    [...map.entries()].map(([storage, price]) => ({ storage, price })),
  );
}

function withSkus(
  product: PremiumProduct,
  variant: ProductVariant,
  option: StorageOption,
): StorageOption {
  const ensured = ensureStorageConditions(option, product.stock);
  return {
    ...ensured,
    conditions: ensured.conditions?.map((entry) => ({
      ...entry,
      sku:
        entry.sku ||
        buildVariantSku({
          brand: product.brand,
          model: product.model || product.name,
          colorName: variant.colorName,
          storage: ensured.storage,
          condition: entry.condition,
        }),
    })),
  };
}

function legacyToVariants(product: PremiumProduct): ProductVariant[] {
  if (product.images.length === 0) return [];

  return product.images.map((image) => ({
    id: image.id,
    colorName: image.colorName,
    colorCode: image.colorCode,
    image: image.image,
    angles: image.angles,
    storageOptions: product.storageOptions.length
      ? sortStorageOptions(
          product.storageOptions.map((option) =>
            withSkus(
              product,
              {
                id: image.id,
                colorName: image.colorName,
                colorCode: image.colorCode,
                image: image.image,
                storageOptions: [],
              },
              normalizeVariantStock(option, product),
            ),
          ),
        )
      : [
          withSkus(
            product,
            {
              id: image.id,
              colorName: image.colorName,
              colorCode: image.colorCode,
              image: image.image,
              storageOptions: [],
            },
            ensureStorageConditions(
              { storage: "Standard", price: 0, stock: product.stock ?? 0 },
              product.stock ?? 0,
            ),
          ),
        ],
  }));
}

export function getProductVariants(product: PremiumProduct): ProductVariant[] {
  if (product.variants?.length) return product.variants;
  return legacyToVariants(product);
}

const syncedProductCache = new WeakMap<PremiumProduct, PremiumProduct>();

function computeSyncedProduct(product: PremiumProduct): PremiumProduct {
  const variants = product.variants?.length
    ? product.variants.map((variant) => {
        const id = variant.id || slugifyColorId(variant.colorName);
        const nextVariant = { ...variant, id };
        return {
          ...nextVariant,
          storageOptions: sortStorageOptions(
            variant.storageOptions.map((option) =>
              withSkus(product, nextVariant, normalizeVariantStock(option, product)),
            ),
          ),
        };
      })
    : legacyToVariants(product);

  const images: ProductImageVariant[] = variants.map((variant) => ({
    id: variant.id,
    colorName: variant.colorName,
    colorCode: variant.colorCode,
    image: variant.image,
    imageMissing: variant.imageMissing ?? false,
    angles: variant.angles,
  }));

  const storageOptions = buildUnionStorageOptions(variants);

  return {
    ...product,
    variants,
    images,
    storageOptions,
    mainImage: product.mainImage ?? images[0]?.image,
    galleryImages: images.map((image) => image.image),
    adminSpecs: {
      ...product.adminSpecs,
      storage: [...new Set(storageOptions.map((option) => option.storage))].join(" · "),
    },
  };
}

export function syncProductVariants(product: PremiumProduct): PremiumProduct {
  const cached = syncedProductCache.get(product);
  if (cached) return cached;
  const synced = computeSyncedProduct(product);
  syncedProductCache.set(product, synced);
  return synced;
}

export function getDefaultColor(product: PremiumProduct): ProductImageVariant {
  return syncProductVariants(product).images[0];
}

export function getColorVariant(
  product: PremiumProduct,
  colorId: string,
): ProductImageVariant {
  const synced = syncProductVariants(product);
  return synced.images.find((image) => image.id === colorId) ?? synced.images[0];
}

export function getVariantByColorId(
  product: PremiumProduct,
  colorId: string,
): ProductVariant {
  const variants = getProductVariants(syncProductVariants(product));
  return variants.find((variant) => variant.id === colorId) ?? variants[0];
}

export function getStorageOptionsForColor(
  product: PremiumProduct,
  colorId: string,
): StorageOption[] {
  return getVariantByColorId(product, colorId).storageOptions;
}

export function getDefaultStorage(
  product: PremiumProduct,
  colorId?: string,
): StorageOption {
  const options = colorId
    ? getStorageOptionsForColor(product, colorId)
    : syncProductVariants(product).storageOptions;
  return options[0] ?? { storage: "Standard", price: 0 };
}

export function getStorageOption(
  product: PremiumProduct,
  storage: string,
  colorId?: string,
): StorageOption {
  const options = colorId
    ? getStorageOptionsForColor(product, colorId)
    : syncProductVariants(product).storageOptions;

  return (
    options.find((option) => option.storage === storage) ??
    getDefaultStorage(product, colorId)
  );
}

/** Preis ohne aktive Angebote — die bestehende Zustands-/Override-Preislogik, unverändert. */
export function getProductRegularPrice(
  product: PremiumProduct,
  storage: string,
  colorId?: string,
  condition?: ConditionId,
): number {
  const option = getStorageOption(product, storage, colorId);
  const ensured = ensureStorageConditions(option);

  if (condition) {
    const entry = ensured.conditions?.find((c) => c.condition === condition);
    if (!entry) return 0;
    return roundStoredPrice(getEffectivePriceForConditionEntry(ensured, entry));
  }

  const available = getPurchasableConditions(ensured);
  if (available.length > 0) {
    return roundStoredPrice(
      Math.min(
        ...available.map((c) => getEffectivePriceForConditionEntry(ensured, c)),
      ),
    );
  }

  const neu = ensured.conditions?.find((entry) => entry.condition === "new");
  if (neu) {
    return roundStoredPrice(getEffectivePriceForConditionEntry(ensured, neu));
  }
  return roundStoredPrice(ensured.price);
}

/**
 * Öffentlicher Preis — Regulärpreis mit einer eventuell aktiven Promotion
 * angewendet (zentrale Pricing-Engine, siehe `@/lib/promotions`). Alle
 * Aufrufer (Cart, Checkout, PDP, Karten) bekommen den Angebotspreis
 * automatisch, ohne eigene Promotion-Logik zu duplizieren.
 */
export function getProductPrice(
  product: PremiumProduct,
  storage: string,
  colorId?: string,
  condition?: ConditionId,
): number {
  const regularPrice = getProductRegularPrice(product, storage, colorId, condition);
  const promotion = findApplicablePromotion(getActivePromotions(), product.id, {
    colorId,
    storage,
    condition,
  });
  if (!promotion) return regularPrice;
  const salePrice = applyPromotionToPrice(regularPrice, promotion, product.id);
  return salePrice ?? regularPrice;
}

function roundStoredPrice(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Niedrigster Preis über alle Farb-/Speicher-Kombinationen (Basis „Neu“ für „Ab …“). */
export function getProductMinPrice(product: PremiumProduct): number {
  const variants = getProductVariants(syncProductVariants(product));
  let min = Infinity;

  for (const variant of variants) {
    for (const option of variant.storageOptions) {
      const ensured = ensureStorageConditions(option);
      const neu = ensured.conditions?.find((entry) => entry.condition === "new");
      const price = neu?.price && neu.price > 0 ? neu.price : ensured.price;
      if (Number.isFinite(price) && price > 0 && price < min) {
        min = price;
      }
    }
  }

  return min === Infinity ? 0 : Math.round(min * 100) / 100;
}

export {
  getDefaultAvailableColorId,
  getDefaultAvailableStorage,
  getDefaultAvailableConditionId,
  getProductMinAvailablePrice,
} from "@/lib/productAvailability";

export function normalizeStoragePrice(value: string | number): number {
  const raw = typeof value === "number" ? value : parseFloat(String(value).replace(",", ".").trim());
  if (!Number.isFinite(raw)) return 0;
  return Math.round(raw * 100) / 100;
}

export function validateVariantPrices(product: PremiumProduct): string[] {
  const variants = getProductVariants(syncProductVariants(product));
  const errors: string[] = [];
  const seenSkus = new Set<string>();

  for (const variant of variants) {
    if (variant.storageOptions.length === 0) {
      errors.push(`Mindestens eine Speicheroption für „${variant.colorName}“ erforderlich.`);
      continue;
    }

    for (const option of variant.storageOptions) {
      if (!option.storage.trim()) {
        errors.push(`Speichergröße fehlt (${variant.colorName}).`);
      }

      const ensured = ensureStorageConditions(option);
      const active = (ensured.conditions ?? []).filter((c) => c.active);

      if (active.length === 0) {
        continue;
      }

      for (const condition of active) {
        // Ein Preis von 0 blockiert das Speichern nicht mehr – Produkte dürfen
        // ohne hinterlegten Preis gepflegt werden (Preis wird später ergänzt).
        if (condition.sku) {
          const key = condition.sku.toUpperCase();
          if (seenSkus.has(key)) {
            errors.push(`Doppelte SKU: ${condition.sku}`);
          }
          seenSkus.add(key);
        }
      }
    }
  }

  return errors;
}

export function getAllColorNames(product: PremiumProduct): string[] {
  return syncProductVariants(product).images.map((image) => image.colorName);
}

export function getAllStorageSizes(product: PremiumProduct): string[] {
  return syncProductVariants(product).storageOptions.map((option) => option.storage);
}

export function isValidVariantSelection(
  product: PremiumProduct,
  colorId: string,
  storage: string,
  condition?: ConditionId,
): boolean {
  const option = getStorageOptionsForColor(product, colorId).find(
    (entry) => entry.storage === storage,
  );
  if (!option) return false;
  if (!condition) return true;
  const entry = getConditionOption(option, condition);
  return entry.active;
}

export function getMonthlyPrice(price: number) {
  return Math.round((price / 24) * 100) / 100;
}

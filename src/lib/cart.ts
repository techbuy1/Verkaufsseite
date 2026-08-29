import {
  getColorVariant,
  getDefaultAvailableColorId,
  getDefaultAvailableStorage,
  getDefaultColor,
  getDefaultStorage,
  getPremiumProductById,
  getProductPrice,
  getStorageOption,
} from "@/data/premiumCatalog";
import { getProductById } from "@/data/catalogProducts";
import {
  getConditionLabel,
  getDefaultAvailableCondition,
  isConditionId,
} from "@/lib/conditions";
import {
  getDefaultAvailableConditionId,
  getVariantStock,
  validateVariantPurchase,
} from "@/lib/productAvailability";
import { productNeedsDeviceSelection, resolveDeviceLabel } from "@/lib/deviceCompatibility";
import type { AddToCartPayload, ConditionId, PremiumProduct } from "@/types/product";

function resolveProduct(productId: string): PremiumProduct | undefined {
  // Shop no longer persists the full catalog in localStorage. Seed is only
  // used when it actually has sellable stock (dev/admin). Otherwise the cart
  // uses the PDP snapshot on the payload.
  return getPremiumProductById(productId);
}

export interface CartItem {
  lineId: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  /** Basispreis für Zustand „Neu“ der gewählten Variante */
  basePrice?: number;
  quantity: number;
  slug?: string;
  brand?: string;
  color?: string;
  colorName?: string;
  storage?: string;
  condition?: ConditionId;
  conditionLabel?: string;
  stock?: number;
  /** Stabile Produkt-ID des kompatiblen Smartphones (gerätespezifisches Zubehör). */
  deviceId?: string;
  /** Anzeigename, z. B. "Apple iPhone 17 Pro" — abgeleitet aus deviceId. */
  deviceLabel?: string;
}

export const CART_STORAGE_KEY = "techbuy-cart";

export function createCartLineId(
  productId: string,
  colorId: string,
  storage: string,
  condition: ConditionId = "new",
  deviceId?: string,
): string {
  const base = `${productId}__${colorId}__${storage.replace(/\s+/g, "-")}__${condition}`;
  return deviceId ? `${base}__${deviceId}` : base;
}

export function getMaxQuantityForCartItem(item: CartItem): number {
  const product = resolveProduct(item.productId);
  if (!product) return item.stock && item.stock > 0 ? item.stock : 99;

  const colorId = item.color ?? getDefaultAvailableColorId(product);
  const storage = item.storage ?? getDefaultAvailableStorage(product, colorId).storage;
  const condition =
    item.condition ?? getDefaultAvailableConditionId(product, colorId, storage);
  const live = getVariantStock(product, colorId, storage, condition);
  if (live > 0) return live;
  return item.stock && item.stock > 0 ? item.stock : 99;
}

function buildSnapshotCartItem(payload: AddToCartPayload): CartItem | null {
  if (typeof payload.unitPrice !== "number" || payload.unitPrice <= 0) return null;
  const condition: ConditionId = isConditionId(payload.condition) ? payload.condition : "new";
  const colorId = payload.colorId ?? "default";
  const storage = payload.storage ?? "Standard";
  return {
    lineId: createCartLineId(payload.productId, colorId, storage, condition, payload.deviceId),
    productId: payload.productId,
    name: payload.name ?? payload.productId,
    image: payload.image ?? "",
    price: payload.unitPrice,
    quantity: payload.quantity ?? 1,
    slug: payload.slug,
    brand: payload.brand,
    color: colorId,
    colorName: payload.colorName,
    storage,
    condition,
    conditionLabel: getConditionLabel(condition),
    stock: payload.stock ?? 99,
    deviceId: payload.deviceId,
    deviceLabel: resolveDeviceLabel(payload.deviceId),
  };
}

export function buildCartItem(payload: AddToCartPayload): CartItem | null {
  const product = resolveProduct(payload.productId);
  if (product) {
    const colorId = payload.colorId ?? getDefaultAvailableColorId(product);
    const color = getColorVariant(product, colorId);
    const storageOption = getStorageOption(
      product,
      payload.storage ?? getDefaultAvailableStorage(product, colorId).storage,
      colorId,
    );
    const resolvedCondition = isConditionId(payload.condition)
      ? payload.condition
      : getDefaultAvailableCondition(storageOption).condition;
    const price = getProductPrice(
      product,
      storageOption.storage,
      colorId,
      resolvedCondition,
    );
    const basePrice = getProductPrice(
      product,
      storageOption.storage,
      colorId,
      "new",
    );
    const requestedQuantity = payload.quantity ?? 1;
    const validation = validateVariantPurchase(
      product,
      colorId,
      storageOption.storage,
      requestedQuantity,
      resolvedCondition,
    );

    if (!validation.ok) {
      return buildSnapshotCartItem({
        ...payload,
        name: payload.name ?? product.name,
        brand: payload.brand ?? product.brand,
        slug: payload.slug ?? product.slug,
        image: payload.image ?? color.image,
        colorName: payload.colorName ?? color.colorName,
      });
    }

    return {
      lineId: createCartLineId(
        product.id,
        color.id,
        storageOption.storage,
        resolvedCondition,
      ),
      productId: product.id,
      name: product.name,
      image: color.image,
      price,
      basePrice,
      quantity: Math.min(requestedQuantity, validation.maxQuantity),
      slug: product.slug,
      brand: product.brand,
      color: color.id,
      colorName: color.colorName,
      storage: storageOption.storage,
      condition: resolvedCondition,
      conditionLabel: getConditionLabel(resolvedCondition),
      stock: validation.maxQuantity,
    };
  }

  const snapshot = buildSnapshotCartItem(payload);
  if (snapshot) return snapshot;

  const legacy = getProductById(payload.productId);
  if (!legacy) return null;

  // Gerätespezifisches Zubehör (Panzerfolien, Hüllen) darf nicht ohne
  // ausgewähltes Smartphone-Modell in den Warenkorb gelangen.
  if (productNeedsDeviceSelection(legacy) && !payload.deviceId) return null;

  const deviceLabel = resolveDeviceLabel(payload.deviceId);
  if (payload.deviceId && !deviceLabel) return null;

  const storage = payload.storage ?? legacy.storage ?? "Standard";
  const colorOption =
    legacy.colors?.find((entry) => entry.id === payload.colorId) ??
    legacy.colors?.[0];
  const colorId = colorOption?.id ?? payload.colorId ?? legacy.color ?? "default";
  const colorName = colorOption?.label ?? legacy.color;
  const condition: ConditionId = isConditionId(payload.condition)
    ? payload.condition
    : "new";

  return {
    lineId: createCartLineId(legacy.id, colorId, storage, condition, payload.deviceId),
    productId: legacy.id,
    name: legacy.name,
    image: colorOption?.imageSrc ?? legacy.imageSrc,
    price: legacy.price,
    quantity: payload.quantity ?? 1,
    slug: legacy.slug,
    brand: legacy.brand,
    color: colorId,
    colorName,
    storage,
    condition,
    conditionLabel: getConditionLabel(condition),
    deviceId: payload.deviceId,
    deviceLabel,
  };
}

export function getCartItemVariantLabel(item: CartItem): string | null {
  const parts = [
    item.deviceLabel ? `Für ${item.deviceLabel}` : undefined,
    item.colorName,
    item.storage,
    item.conditionLabel,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function getCartItemProductHref(item: CartItem): string {
  if (item.slug) return `/products/${item.slug}`;
  const premium = getPremiumProductById(item.productId);
  if (premium) return `/products/${premium.slug}`;
  return "/zubehoer";
}

export const FREE_SHIPPING_THRESHOLD = 0;
export const SHIPPING_COST = 0;

export function getShippingCost(_subtotal: number): number {
  return 0;
}

export function getCartTotal(subtotal: number, discount = 0): number {
  return Math.max(0, roundMoney(subtotal - discount + getShippingCost(subtotal)));
}

export function getCartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function parseStoredCart(raw: string | null): CartItem[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Array<Partial<CartItem> & { id?: string }>;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item): CartItem | null => {
        if (!item || typeof item.name !== "string") return null;

        const productId = item.productId ?? item.id;
        if (!productId) return null;

        const condition: ConditionId = isConditionId(item.condition)
          ? item.condition
          : "new";

        const lineId =
          item.lineId ??
          createCartLineId(
            productId,
            item.color ?? "default",
            item.storage ?? "default",
            condition,
            item.deviceId,
          );

        const baseItem: CartItem = {
          lineId,
          productId,
          name: item.name,
          image: item.image ?? "",
          price: typeof item.price === "number" ? item.price : 0,
          quantity: Math.max(1, Math.floor(item.quantity ?? 1)),
          color: item.color,
          colorName: item.colorName,
          storage: item.storage,
          condition,
          conditionLabel: item.conditionLabel ?? getConditionLabel(condition),
          stock: item.stock,
          deviceId: item.deviceId,
          deviceLabel: item.deviceLabel ?? resolveDeviceLabel(item.deviceId),
        };

        const maxQuantity = getMaxQuantityForCartItem(baseItem);
        if (maxQuantity <= 0) return null;

        return {
          ...baseItem,
          quantity: Math.min(baseItem.quantity, maxQuantity),
          stock: maxQuantity,
        };
      })
      .filter((item): item is CartItem => item !== null && item.price > 0);
  } catch {
    return [];
  }
}

export function resolveCartItemPrice(item: CartItem): CartItem {
  const product = resolveProduct(item.productId);
  if (!product) return item;

  const colorId = item.color ?? getDefaultColor(product).id;
  const color = getColorVariant(product, colorId);
  const storage = getStorageOption(
    product,
    item.storage ?? getDefaultStorage(product, colorId).storage,
    colorId,
  );
  const condition =
    item.condition ?? getDefaultAvailableConditionId(product, colorId, storage.storage);
  const maxQuantity = getMaxQuantityForCartItem({
    ...item,
    color: colorId,
    storage: storage.storage,
    condition,
  });
  const liveStock = getVariantStock(product, colorId, storage.storage, condition);
  if (liveStock <= 0) return item;

  return {
    ...item,
    image: color.image,
    price: getProductPrice(product, storage.storage, colorId, condition),
    basePrice: getProductPrice(product, storage.storage, colorId, "new"),
    colorName: color.colorName,
    storage: storage.storage,
    condition,
    conditionLabel: getConditionLabel(condition),
    stock: maxQuantity,
    // 0 when the variant is out of stock — callers drop items at quantity 0.
    quantity: Math.min(item.quantity, maxQuantity),
  };
}

export { formatPrice } from "@/data/products";

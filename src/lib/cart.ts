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
import { getProductById as getStoredProductById } from "@/lib/productStore";
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
import type { AddToCartPayload, ConditionId, PremiumProduct } from "@/types/product";

function resolveProduct(productId: string): PremiumProduct | undefined {
  return getStoredProductById(productId) ?? getPremiumProductById(productId);
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
}

export const CART_STORAGE_KEY = "techbuy-cart";

export function createCartLineId(
  productId: string,
  colorId: string,
  storage: string,
  condition: ConditionId = "new",
): string {
  return `${productId}__${colorId}__${storage.replace(/\s+/g, "-")}__${condition}`;
}

export function getMaxQuantityForCartItem(item: CartItem): number {
  const product = resolveProduct(item.productId);
  if (!product) return 99;

  const colorId = item.color ?? getDefaultAvailableColorId(product);
  const storage = item.storage ?? getDefaultAvailableStorage(product, colorId).storage;
  const condition =
    item.condition ?? getDefaultAvailableConditionId(product, colorId, storage);
  return getVariantStock(product, colorId, storage, condition);
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

    if (!validation.ok) return null;

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

  const legacy = getProductById(payload.productId);
  if (!legacy) return null;

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
    lineId: createCartLineId(legacy.id, colorId, storage, condition),
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
  };
}

export function getCartItemVariantLabel(item: CartItem): string | null {
  const parts = [item.colorName, item.storage, item.conditionLabel].filter(Boolean);
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
    quantity: Math.min(item.quantity, maxQuantity > 0 ? maxQuantity : item.quantity),
  };
}

export { formatPrice } from "@/data/products";

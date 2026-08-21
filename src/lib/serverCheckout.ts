import { accessoryProducts } from "@/data/accessoryCatalog";
import { calculateAccessoryDiscounts } from "@/lib/accessoryPricing";
import {
  priceAllDeviceUpsells,
  upsellsToCheckoutLines,
  type DeviceUpsellSelectionInput,
  type PricedDeviceUpsell,
} from "@/lib/checkoutUpsell";
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_COST,
} from "@/lib/cart";
import { getConditionLabel, isConditionId } from "@/lib/conditions";
import {
  getDefaultAvailableConditionId,
  validateCheckoutStock,
} from "@/lib/productAvailability";
import { getSeedProducts } from "@/lib/productStore";
import {
  getDefaultColor,
  getDefaultStorage,
  getProductPrice,
  getColorVariant,
} from "@/lib/productVariants";
import type { ConditionId } from "@/types/product";

export type PaymentProvider = "stripe" | "paypal";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "pending_review"
  | "denied";

/** Client may only send identifiers — never trusted prices. */
export interface CheckoutLineInput {
  productId: string;
  lineId?: string;
  quantity: number;
  colorId?: string;
  colorName?: string;
  color?: string;
  storage?: string;
  condition?: ConditionId | string;
}

export interface PricedCheckoutLine {
  productId: string;
  lineId?: string;
  productName: string;
  image?: string;
  storage?: string;
  colorId?: string;
  colorName?: string;
  condition?: ConditionId;
  conditionLabel?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface ValidatedCartTotals {
  lines: PricedCheckoutLine[];
  upsells: PricedDeviceUpsell[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  currency: "EUR";
}

export type CartValidationResult =
  | { ok: true; cart: ValidatedCartTotals }
  | { ok: false; message: string; status: number };

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Single source of truth for checkout pricing (Stripe + PayPal).
 * Ignores any client-supplied price fields.
 */
export function calculateProductUnitPrice(input: {
  productId: string;
  storage?: string;
  colorId?: string;
  colorName?: string;
  color?: string;
  condition?: ConditionId | string;
}): number | null {
  const products = getSeedProducts();
  const premium = products.find((product) => product.id === input.productId);

  if (premium) {
    const colorRef = input.colorId ?? input.color ?? input.colorName;
    const colorId =
      (colorRef
        ? premium.images.find(
            (image) => image.id === colorRef || image.colorName === colorRef,
          )?.id
        : undefined) ?? getDefaultColor(premium).id;
    const storage = input.storage ?? getDefaultStorage(premium, colorId).storage;
    const condition = isConditionId(input.condition)
      ? input.condition
      : getDefaultAvailableConditionId(premium, colorId, storage);
    const price = getProductPrice(premium, storage, colorId, condition);
    return price > 0 ? roundMoney(price) : null;
  }

  const accessory = accessoryProducts.find(
    (product) => product.id === input.productId,
  );
  if (!accessory || accessory.price <= 0) return null;
  return roundMoney(accessory.price);
}

export function validateAndPriceCart(
  items: CheckoutLineInput[],
  upsellSelections?: DeviceUpsellSelectionInput[],
): CartValidationResult {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, message: "Warenkorb ist leer.", status: 400 };
  }

  const products = getSeedProducts();
  const stockErrors = validateCheckoutStock(items, products);
  if (stockErrors.length > 0) {
    return {
      ok: false,
      message: stockErrors[0]?.message ?? "Nicht genügend Bestand verfügbar.",
      status: 409,
    };
  }

  const lines: PricedCheckoutLine[] = [];

  for (const item of items) {
    const quantity = Math.max(1, Math.floor(item.quantity || 0));
    if (!item.productId || quantity < 1) {
      return {
        ok: false,
        message: "Ungültige Warenkorbposition.",
        status: 400,
      };
    }

    const premium = products.find((product) => product.id === item.productId);
    const accessory = accessoryProducts.find(
      (product) => product.id === item.productId,
    );

    if (!premium && !accessory) {
      return {
        ok: false,
        message: "Ein Produkt im Warenkorb wurde nicht gefunden.",
        status: 400,
      };
    }

    const colorRef = item.colorId ?? item.color ?? item.colorName;
    let colorId: string | undefined;
    let colorName: string | undefined;
    let storage: string | undefined;
    let condition: ConditionId | undefined;
    let image: string | undefined;
    let productName: string;

    if (premium) {
      colorId =
        (colorRef
          ? premium.images.find(
              (imageEntry) =>
                imageEntry.id === colorRef || imageEntry.colorName === colorRef,
            )?.id
          : undefined) ?? getDefaultColor(premium).id;
      const color = getColorVariant(premium, colorId);
      colorName = color.colorName;
      image = color.image;
      storage = item.storage ?? getDefaultStorage(premium, colorId).storage;
      condition = isConditionId(item.condition)
        ? item.condition
        : getDefaultAvailableConditionId(premium, colorId, storage);
      productName = premium.name;
    } else {
      productName = accessory!.name;
      image = accessory!.imageSrc;
      storage = item.storage;
      colorName = item.colorName ?? item.color;
    }

    const unitPrice = calculateProductUnitPrice({
      productId: item.productId,
      storage,
      colorId,
      colorName,
      condition,
    });

    if (unitPrice === null || unitPrice <= 0) {
      return {
        ok: false,
        message: `Preis für „${productName}“ konnte nicht ermittelt werden.`,
        status: 400,
      };
    }

    lines.push({
      productId: item.productId,
      lineId: item.lineId,
      productName,
      image,
      storage,
      colorId,
      colorName,
      condition,
      conditionLabel: condition ? getConditionLabel(condition) : undefined,
      quantity,
      unitPrice,
      lineTotal: roundMoney(unitPrice * quantity),
    });
  }

  if (lines.length === 0) {
    return {
      ok: false,
      message: "Ungültige Produkte im Warenkorb.",
      status: 400,
    };
  }

  const smartphoneDevices = lines
    .filter((line) => {
      const premium = products.find((product) => product.id === line.productId);
      return Boolean(
        line.lineId && premium && premium.catalogCategory === "smartphones",
      );
    })
    .map((line) => ({
      lineId: line.lineId!,
      productId: line.productId,
      productName: line.productName,
    }));

  const upsellResult = priceAllDeviceUpsells(upsellSelections, smartphoneDevices);
  if (!upsellResult.ok) {
    return { ok: false, message: upsellResult.message, status: 400 };
  }

  const upsellCheckoutLines = upsellsToCheckoutLines(upsellResult.priced);
  for (const upsellLine of upsellCheckoutLines) {
    lines.push({
      productId: upsellLine.productId,
      lineId: upsellLine.lineId,
      productName: upsellLine.productName,
      quantity: upsellLine.quantity,
      unitPrice: upsellLine.unitPrice,
      lineTotal: upsellLine.lineTotal,
    });
  }

  const merchandiseSubtotal = roundMoney(
    lines
      .filter((line) => !line.productId.startsWith("upsell-"))
      .reduce((sum, line) => sum + line.lineTotal, 0),
  );
  const upsellSubtotal = roundMoney(
    upsellResult.priced.reduce((sum, entry) => sum + entry.lineTotal, 0),
  );

  // Legacy cart accessory volume discounts only on non-upsell catalog accessories
  const accessoryPricing = calculateAccessoryDiscounts(
    lines.filter((line) => !line.productId.startsWith("upsell-")),
  );
  const discount = accessoryPricing.totalDiscount;
  const subtotal = roundMoney(merchandiseSubtotal + upsellSubtotal);
  const shipping = 0;
  const total = roundMoney(subtotal + shipping - discount);

  return {
    ok: true,
    cart: {
      lines,
      upsells: upsellResult.priced,
      subtotal,
      shipping,
      discount,
      total,
      currency: "EUR",
    },
  };
}

export function formatEuroAmount(value: number): string {
  return roundMoney(value).toFixed(2);
}

export { FREE_SHIPPING_THRESHOLD, SHIPPING_COST };

import { calculateAccessoryDiscounts } from "@/lib/accessoryPricing";
import { productNeedsDeviceSelection } from "@/lib/deviceCompatibility";
import { getAccessoryProducts } from "@/lib/catalog";
import { readServerGadgetPriceOverrides } from "@/lib/serverGadgetPricing";
import {
  priceAllDeviceUpsells,
  upsellsToCheckoutLines,
  type DeviceUpsellSelectionInput,
  type PricedDeviceUpsell,
} from "@/lib/checkoutUpsell";
import {
  FREE_SHIPPING_THRESHOLD,
  getShippingCost,
  SHIPPING_COST,
} from "@/lib/cart";
import { getConditionLabel, isConditionId } from "@/lib/conditions";
import {
  getDefaultAvailableConditionId,
  validateCheckoutStock,
} from "@/lib/productAvailability";
import { readServerProducts } from "@/lib/serverProductCatalog";
import { readServerConditionPricingRules } from "@/lib/serverConditionPricingRules";
import { readServerPromotions } from "@/lib/serverPromotions";
import {
  getDefaultColor,
  getDefaultStorage,
  getProductPrice,
  getColorVariant,
  getStorageOptionsForColor,
} from "@/lib/productVariants";
import type { ConditionId, PremiumProduct } from "@/types/product";

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
  /** Stabile Produkt-ID des kompatiblen Smartphones — für gerätespezifisches Zubehör. */
  deviceId?: string;
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
  deviceId?: string;
  /** Serverseitig aus dem Gerätekatalog aufgelöst — nie ein Client-Freitext. */
  deviceLabel?: string;
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
 * Ignores any client-supplied price fields — uses admin catalog when persisted.
 */
export function calculateProductUnitPrice(
  input: {
    productId: string;
    storage?: string;
    colorId?: string;
    colorName?: string;
    color?: string;
    condition?: ConditionId | string;
  },
  products: PremiumProduct[],
): number | null {
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

  const accessory = getAccessoryProducts().find(
    (product) => product.id === input.productId,
  );
  if (!accessory || accessory.price <= 0) return null;
  return roundMoney(accessory.price);
}

export async function validateAndPriceCart(
  items: CheckoutLineInput[],
  upsellSelections?: DeviceUpsellSelectionInput[],
): Promise<CartValidationResult> {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, message: "Warenkorb ist leer.", status: 400 };
  }

  await readServerConditionPricingRules();
  await readServerPromotions();
  await readServerGadgetPriceOverrides();
  const { products } = await readServerProducts();
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
    const accessory = getAccessoryProducts().find(
      (product) => product.id === item.productId,
    );

    if (!premium && !accessory) {
      return {
        ok: false,
        message: "Ein Produkt im Warenkorb wurde nicht gefunden.",
        status: 400,
      };
    }

    let colorId: string | undefined;
    let colorName: string | undefined;
    let storage: string | undefined;
    let condition: ConditionId | undefined;
    let image: string | undefined;
    let productName: string;

    if (premium) {
      // Alle vom Client übergebenen Farb-Referenzen (ID, Name) prüfen. Tolerant
      // gegenüber umbenannten IDs (Treffer über den Namen genügt), aber eine
      // ausdrücklich gewählte Farbe, die es nicht gibt, wird abgelehnt statt
      // still auf die Standardfarbe zurückzufallen (manipulierter/veralteter
      // Warenkorb).
      const colorRefs = [item.colorId, item.color, item.colorName].filter(
        (value): value is string => Boolean(value),
      );
      const matchedImage =
        colorRefs.length > 0
          ? premium.images.find((imageEntry) =>
              colorRefs.some(
                (ref) =>
                  imageEntry.id === ref || imageEntry.colorName === ref,
              ),
            )
          : undefined;
      if (colorRefs.length > 0 && !matchedImage) {
        return {
          ok: false,
          message:
            "Diese Farbe ist für das gewählte Produkt nicht verfügbar. Bitte wähle eine andere Farbe.",
          status: 409,
        };
      }
      colorId = matchedImage?.id ?? getDefaultColor(premium).id;
      const color = getColorVariant(premium, colorId);
      colorName = color.colorName;
      image = color.image;

      const storageOptions = getStorageOptionsForColor(premium, colorId);
      if (
        item.storage &&
        !storageOptions.some((option) => option.storage === item.storage)
      ) {
        return {
          ok: false,
          message:
            "Diese Speichergröße ist für das gewählte Produkt nicht verfügbar. Bitte wähle eine andere Speichergröße.",
          status: 409,
        };
      }
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

    let deviceLabel: string | undefined;
    if (accessory && productNeedsDeviceSelection(accessory)) {
      const device = item.deviceId
        ? products.find(
            (entry) => entry.id === item.deviceId && entry.catalogCategory === "smartphones",
          )
        : undefined;

      if (!device) {
        return {
          ok: false,
          message: `Bitte wähle ein Smartphone-Modell für „${productName}“ aus.`,
          status: 400,
        };
      }

      deviceLabel = `${device.brand} ${device.model}`;
    }

    const unitPrice = calculateProductUnitPrice(
      {
        productId: item.productId,
        storage,
        colorId,
        colorName,
        condition,
      },
      products,
    );

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
      deviceId: deviceLabel ? item.deviceId : undefined,
      deviceLabel,
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
  // Selbe Regel wie im Warenkorb (getShippingCost in @/lib/cart): kostenlos
  // ab FREE_SHIPPING_THRESHOLD, sonst SHIPPING_COST — serverseitig neu
  // berechnet, nie aus dem Client übernommen.
  const shipping = getShippingCost(subtotal);
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

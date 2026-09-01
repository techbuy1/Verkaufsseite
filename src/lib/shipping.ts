import type { PremiumProduct } from "@/types/product";
import { isShippingCarrier } from "@/lib/shippingCarriers";
import {
  normalizeOrderItems,
  type ShopOrder,
  type ShopOrderDevice,
  type ShopOrderItem,
} from "@/lib/orderStore";

/**
 * Zentrale Logik für den Versand-Workflow der Admin-Bestelldetailseite:
 * welche Positionen eine Gerätekennung (IMEI/Seriennummer) brauchen, ob eine
 * Bestellung versandbereit ist und welche Geräte-/Zubehördaten in die
 * Versandbestätigung gehören.
 *
 * Wird sowohl von der Validierung (`/api/admin/orders/[id]/ship`) als auch von
 * der Detail-Ansicht (`/api/admin/orders/[id]` GET) und der Versandmail genutzt
 * – eine Quelle der Wahrheit, keine parallele Datenstruktur.
 */

/** Katalogkategorien, deren verkaufte Geräte vor Versand eine Kennung brauchen. */
const TRACKABLE_DEVICE_CATEGORIES: ReadonlySet<string> = new Set([
  "smartphones",
  "tablets",
  "macbooks",
  "laptops",
]);

/**
 * True, wenn diese Bestellposition ein echtes Gerät ist, dem vor Versand eine
 * IMEI/Seriennummer zugeordnet sein muss. Zubehör (Panzerfolie, Hülle, Kabel,
 * Netzteil, Audio …) ist nie im Geräte-Katalog und braucht daher keine Kennung.
 */
export function orderItemRequiresDeviceId(
  item: Pick<ShopOrderItem, "productId">,
  products: PremiumProduct[],
): boolean {
  const premium = products.find((product) => product.id === item.productId);
  if (!premium) return false;
  return TRACKABLE_DEVICE_CATEGORIES.has(premium.catalogCategory);
}

/** True, sobald mindestens eine Kennung (IMEI, IMEI 2 oder Seriennummer) gesetzt ist. */
export function deviceHasIdentifier(device: ShopOrderDevice): boolean {
  return Boolean(
    device.imei?.trim() ||
      device.imei2?.trim() ||
      device.serialNumber?.trim(),
  );
}

export interface ShippingDeviceUnit {
  imei?: string;
  imei2?: string;
  serialNumber?: string;
}

export interface ShippingLineInfo {
  productId: string;
  productName: string;
  color?: string;
  storage?: string;
  conditionLabel?: string;
  compatibleDeviceLabel?: string;
  quantity: number;
  requiresDeviceId: boolean;
  units: ShippingDeviceUnit[];
}

function toUnit(device: ShopOrderDevice): ShippingDeviceUnit {
  const unit: ShippingDeviceUnit = {};
  if (device.imei?.trim()) unit.imei = device.imei.trim();
  if (device.imei2?.trim()) unit.imei2 = device.imei2.trim();
  if (device.serialNumber?.trim()) unit.serialNumber = device.serialNumber.trim();
  return unit;
}

/** Aufbereitete Zeilen für Admin-Ansicht und Versandmail (Geräte + Zubehör getrennt). */
export function getShippingLines(
  order: ShopOrder,
  products: PremiumProduct[],
): { devices: ShippingLineInfo[]; accessories: ShippingLineInfo[] } {
  const devices: ShippingLineInfo[] = [];
  const accessories: ShippingLineInfo[] = [];

  for (const item of normalizeOrderItems(order.items)) {
    const requiresDeviceId = orderItemRequiresDeviceId(item, products);
    const line: ShippingLineInfo = {
      productId: item.productId,
      productName: item.productName,
      color: item.color || undefined,
      storage: item.storage || undefined,
      conditionLabel: item.conditionLabel || undefined,
      compatibleDeviceLabel: item.compatibleDeviceLabel || undefined,
      quantity: Math.max(1, item.quantity || 1),
      requiresDeviceId,
      units: item.devices.map(toUnit),
    };
    (requiresDeviceId ? devices : accessories).push(line);
  }

  return { devices, accessories };
}

export interface ShippingValidationInput {
  carrier?: string | null;
  trackingNumber?: string | null;
}

export interface ShippingValidationResult {
  ok: boolean;
  errors: string[];
}

/**
 * Prüft vor „Versanddaten an Kunden senden", ob alles Nötige vorhanden ist.
 * Technische Fehler (DB, Mail) werden NICHT hier behandelt – nur fachliche
 * Voraussetzungen, damit die UI klare Meldungen zeigen kann.
 */
export function validateOrderForShipping(
  order: ShopOrder,
  products: PremiumProduct[],
  input: ShippingValidationInput,
): ShippingValidationResult {
  const errors: string[] = [];

  if (!order.customerEmail?.trim()) {
    errors.push("Für diese Bestellung ist keine Kunden-E-Mail-Adresse hinterlegt.");
  }
  if (order.paymentStatus !== "paid") {
    errors.push("Nur bezahlte Bestellungen können versendet werden.");
  }

  const carrier = input.carrier?.trim() ?? "";
  if (!carrier || !isShippingCarrier(carrier)) {
    errors.push("Bitte einen gültigen Versanddienstleister auswählen.");
  }

  const trackingNumber = input.trackingNumber?.trim() ?? "";
  if (!trackingNumber) {
    errors.push("Bitte zuerst eine Sendungsnummer eintragen.");
  }

  const { devices } = getShippingLines(order, products);
  const deviceMissingId = devices.some((line) =>
    line.units.some((unit) => !unit.imei && !unit.imei2 && !unit.serialNumber),
  );
  if (deviceMissingId) {
    errors.push(
      "Dem verkauften Gerät wurde noch keine IMEI oder Seriennummer zugeordnet.",
    );
  }

  return { ok: errors.length === 0, errors };
}

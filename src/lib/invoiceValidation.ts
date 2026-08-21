import { companySettings, isTaxMode, type TaxMode } from "@/lib/companySettings";
import type { ShopOrder, ShopOrderDevice, ShopOrderItem } from "@/lib/orderStore";
import { normalizeOrderItems } from "@/lib/orderStore";

export interface InvoiceReadiness {
  ok: boolean;
  missing: string[];
}

function deviceLabel(item: ShopOrderItem, index: number): string {
  const variant = [item.storage, item.color, item.conditionLabel]
    .filter(Boolean)
    .join(" · ");
  const base = `${item.productName}${variant ? ` (${variant})` : ""}`;
  return item.quantity > 1 ? `${base} – Gerät ${index + 1}` : base;
}

export function getInvoiceReadiness(order: ShopOrder): InvoiceReadiness {
  const missing: string[] = [];
  const items = normalizeOrderItems(order.items);

  if (!order.customerEmail?.trim()) missing.push("Kunden-E-Mail fehlt.");
  if (!order.customerFirstName?.trim() || !order.customerLastName?.trim()) {
    missing.push("Kundenname fehlt.");
  }
  if (
    !order.shippingStreet?.trim() ||
    !order.shippingHouseNumber?.trim() ||
    !order.shippingPostalCode?.trim() ||
    !order.shippingCity?.trim() ||
    !order.shippingCountry?.trim()
  ) {
    missing.push("Lieferadresse ist unvollständig.");
  }

  if (!companySettings.companyName?.trim()) {
    missing.push("Unternehmensname (companySettings) fehlt.");
  }
  if (!companySettings.street?.trim() || !companySettings.city?.trim()) {
    missing.push("Unternehmensadresse (companySettings) fehlt.");
  }
  if (!companySettings.vatId?.trim() && !companySettings.taxNumber?.trim()) {
    missing.push("USt-IdNr. oder Steuernummer (companySettings) fehlt.");
  }

  if (order.paymentStatus !== "paid") {
    missing.push("Bestellung ist noch nicht als bezahlt markiert.");
  }

  for (const item of items) {
    item.devices.forEach((device, index) => {
      const label = deviceLabel(item, index);
      const hasId =
        Boolean(device.imei?.trim()) || Boolean(device.serialNumber?.trim());
      if (!hasId) {
        missing.push(`${label}: IMEI oder Seriennummer fehlt.`);
      }
      if (!isTaxMode(device.taxMode)) {
        missing.push(`${label}: Steuerart nicht gewählt.`);
      }
    });
  }

  return { ok: missing.length === 0, missing };
}

export interface TaxBucketLine {
  item: ShopOrderItem;
  device: ShopOrderDevice;
  deviceIndex: number;
  unitPrice: number;
  taxMode: TaxMode;
}

/** Expand order into one billing line per physical device. */
export function expandOrderDevices(order: ShopOrder): TaxBucketLine[] {
  const items = normalizeOrderItems(order.items);
  const lines: TaxBucketLine[] = [];
  for (const item of items) {
    item.devices.forEach((device, deviceIndex) => {
      lines.push({
        item,
        device,
        deviceIndex,
        unitPrice: item.unitPrice,
        taxMode: device.taxMode as TaxMode,
      });
    });
  }
  return lines;
}

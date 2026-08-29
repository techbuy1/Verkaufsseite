import type { Product } from "@/data/products";
import { getAllPremiumProducts } from "@/lib/catalog";
import { isHuellenProduct, isPanzerfolieProduct } from "@/lib/storeCatalog";

/**
 * Zubehör, das für ein bestimmtes Smartphone-Modell passgenau gefertigt ist
 * (Panzerfolien, Hüllen) — hier muss der Kunde vor dem Kauf sein Gerät wählen.
 * Universelles Zubehör (Kabel, Ladegeräte, Powerbanks, Adapter, Audio, …)
 * braucht keine Geräteauswahl.
 */
export function productNeedsDeviceSelection(product: Product): boolean {
  return isPanzerfolieProduct(product) || isHuellenProduct(product);
}

export interface DeviceCompatibilityOption {
  /** Stabile Produkt-ID aus dem Smartphone-Katalog — wird als Compatibility-ID gespeichert. */
  id: string;
  brand: string;
  model: string;
  /** Anzeigename inkl. Hersteller, z. B. "Apple iPhone 17 Pro". */
  label: string;
}

export interface DeviceCompatibilityGroup {
  brand: string;
  options: DeviceCompatibilityOption[];
}

/**
 * Alle aktuellen Smartphone-Modelle aus dem bestehenden Gerätekatalog, gruppiert
 * nach Hersteller — Datenquelle für das Modell-Dropdown auf Zubehör-Produktseiten.
 * Neue Smartphones erscheinen automatisch, sobald sie im Katalog existieren.
 *
 * Zubehör hat aktuell keine eigene Kompatibilitätsliste (kein `compatibleDeviceIds`
 * o. Ä. im Datenmodell) — deshalb werden alle nicht manuell archivierten
 * Smartphones angeboten, unabhängig vom aktuellen Verkaufsbestand des Geräts
 * selbst (ein Kunde kann ein älteres, evtl. ausverkauftes Modell besitzen und
 * trotzdem passendes Zubehör dafür kaufen).
 */
export function getSmartphoneCompatibilityGroups(): DeviceCompatibilityGroup[] {
  const options = getAllPremiumProducts()
    .filter((product) => product.catalogCategory === "smartphones" && !product.manualArchive)
    .map((product) => ({
      id: product.id,
      brand: product.brand,
      model: product.model,
      label: `${product.brand} ${product.model}`,
    }))
    .sort((a, b) => a.brand.localeCompare(b.brand, "de") || a.model.localeCompare(b.model, "de"));

  const groups = new Map<string, DeviceCompatibilityOption[]>();
  for (const option of options) {
    const bucket = groups.get(option.brand);
    if (bucket) {
      bucket.push(option);
    } else {
      groups.set(option.brand, [option]);
    }
  }

  return Array.from(groups.entries()).map(([brand, brandOptions]) => ({
    brand,
    options: brandOptions,
  }));
}

/** Anzeigename für eine gespeicherte Device-ID — z. B. für Warenkorb/Bestellung. */
export function resolveDeviceLabel(deviceId: string | undefined): string | undefined {
  if (!deviceId) return undefined;
  const product = getAllPremiumProducts().find((entry) => entry.id === deviceId);
  return product ? `${product.brand} ${product.model}` : undefined;
}

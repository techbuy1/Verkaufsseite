import type { PremiumProduct } from "@/types/product";

/** Kern-Zubehör für Geräte — Preise in EUR. */
export const DEVICE_ACCESSORY = {
  screenClear: {
    id: "acc-screen-protector-clear",
    name: "Panzerfolie Klar",
    price: 9.99,
  },
  screenMatte: {
    id: "acc-screen-protector-matte",
    name: "Panzerfolie Matt",
    price: 9.99,
  },
  screenPrivacy: {
    id: "acc-screen-protector-privacy",
    name: "Panzerfolie Privacy",
    price: 9.99,
  },
  caseClear: {
    id: "acc-case-clear",
    name: "Transparente Hülle",
    price: 9.99,
  },
  cableUsbc: {
    id: "acc-cable-usbc",
    name: "USB-C Ladekabel",
    price: 14.99,
  },
  caseSiliconeApple: {
    id: "acc-case-silicone-apple",
    name: "Silikonhülle",
    price: 19.99,
  },
} as const;

export const SCREEN_PROTECTOR_IDS = [
  DEVICE_ACCESSORY.screenClear.id,
  DEVICE_ACCESSORY.screenMatte.id,
  DEVICE_ACCESSORY.screenPrivacy.id,
] as const;

/** Panzerfolie + transparente Hülle zusammen. */
export const CASE_FOIL_COMBO_PRICE = 15.99;

export const ACCESSORY_VOLUME_TIERS = [
  { minQty: 10, percent: 20 },
  { minQty: 4, percent: 10 },
  { minQty: 2, percent: 5 },
] as const;

export const SILICONE_CASE_COLORS = [
  { id: "black", label: "Schwarz", hex: "#1d1d1f" },
  { id: "blue", label: "Blau", hex: "#0071e3" },
  { id: "green", label: "Grün", hex: "#34c759" },
  { id: "white", label: "Weiß", hex: "#f5f5f7" },
] as const;

const CORE_ACCESSORY_IDS = [
  DEVICE_ACCESSORY.screenClear.id,
  DEVICE_ACCESSORY.screenMatte.id,
  DEVICE_ACCESSORY.screenPrivacy.id,
  DEVICE_ACCESSORY.caseClear.id,
  DEVICE_ACCESSORY.cableUsbc.id,
] as const;

const APPLE_EXTRA_IDS = [DEVICE_ACCESSORY.caseSiliconeApple.id] as const;

const LEGACY_ACCESSORY_IDS = [
  "catalog-cases",
  "catalog-screen-protector",
  "catalog-cables",
] as const;

const ALL_DEVICE_ACCESSORY_IDS = new Set<string>([
  ...CORE_ACCESSORY_IDS,
  ...APPLE_EXTRA_IDS,
  ...LEGACY_ACCESSORY_IDS,
]);

export function isDeviceAccessoryId(productId: string): boolean {
  return ALL_DEVICE_ACCESSORY_IDS.has(productId);
}

export function isScreenProtectorId(productId: string): boolean {
  return (
    (SCREEN_PROTECTOR_IDS as readonly string[]).includes(productId) ||
    productId === "catalog-screen-protector"
  );
}

export function isClearCaseId(productId: string): boolean {
  return (
    productId === DEVICE_ACCESSORY.caseClear.id || productId === "catalog-cases"
  );
}

export function productSupportsSiliconeCase(product: PremiumProduct): boolean {
  if (product.brand !== "Apple") return false;
  return (
    product.catalogCategory === "smartphones" ||
    product.catalogCategory === "tablets"
  );
}

/** Standard-Zubehör-IDs für Cross-Sell / Empfehlungen pro Gerät. */
export function getRecommendedDeviceAccessoryIds(product: PremiumProduct): string[] {
  const ids: string[] = [...CORE_ACCESSORY_IDS];
  if (productSupportsSiliconeCase(product)) {
    ids.push(...APPLE_EXTRA_IDS);
  }
  return ids;
}

export type ScreenProtectorChoice = "none" | "clear" | "matte" | "privacy";

export interface DeviceAddonSelection {
  screenProtector: ScreenProtectorChoice;
  clearCase: boolean;
  usbCable: boolean;
  siliconeCase: boolean;
  siliconeColorId: string;
}

export function emptyDeviceAddonSelection(): DeviceAddonSelection {
  return {
    screenProtector: "none",
    clearCase: false,
    usbCable: false,
    siliconeCase: false,
    siliconeColorId: SILICONE_CASE_COLORS[0].id,
  };
}

export function screenProtectorIdFromChoice(
  choice: ScreenProtectorChoice,
): string | null {
  if (choice === "clear") return DEVICE_ACCESSORY.screenClear.id;
  if (choice === "matte") return DEVICE_ACCESSORY.screenMatte.id;
  if (choice === "privacy") return DEVICE_ACCESSORY.screenPrivacy.id;
  return null;
}

export function estimateAddonListTotal(selection: DeviceAddonSelection): number {
  let total = 0;
  const foilId = screenProtectorIdFromChoice(selection.screenProtector);
  if (foilId) total += 9.99;
  if (selection.clearCase) total += 9.99;
  if (selection.usbCable) total += 14.99;
  if (selection.siliconeCase) total += 19.99;

  // Combo Panzerfolie + transparente Hülle
  if (foilId && selection.clearCase) {
    total -= 9.99 + 9.99 - CASE_FOIL_COMBO_PRICE;
  }

  return Math.round(total * 100) / 100;
}

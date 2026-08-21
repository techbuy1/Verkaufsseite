/**
 * Checkout-Zubehör-Upsell — zentrale Preise (Cent) und serverseitige Validierung.
 * Das Frontend darf nur Identifikatoren senden, niemals Preise.
 */

export const UPSELL_ITEM_PRICES_CENTS = {
  screen_protector: 1499,
  transparent_case: 1499,
  usb_c_cable: 1499,
  charger_60w: 1999,
} as const;

export type UpsellItemType = keyof typeof UPSELL_ITEM_PRICES_CENTS;

export const UPSELL_BUNDLE_PRICES_CENTS = {
  protection: 2499,
  everyday: 3500,
  complete: 4500,
} as const;

export type UpsellBundleId = keyof typeof UPSELL_BUNDLE_PRICES_CENTS;

export type ScreenProtectorVariant = "normal" | "privacy";

export const UPSELL_BUNDLE_ITEMS: Record<UpsellBundleId, UpsellItemType[]> = {
  protection: ["screen_protector", "transparent_case"],
  everyday: ["screen_protector", "transparent_case", "usb_c_cable"],
  complete: [
    "screen_protector",
    "transparent_case",
    "usb_c_cable",
    "charger_60w",
  ],
};

export const UPSELL_BUNDLE_META: Record<
  UpsellBundleId,
  { title: string; badge?: string; compareCents: number }
> = {
  protection: {
    title: "Schutzpaket",
    compareCents:
      UPSELL_ITEM_PRICES_CENTS.screen_protector +
      UPSELL_ITEM_PRICES_CENTS.transparent_case,
  },
  everyday: {
    title: "Alltags-Paket",
    compareCents:
      UPSELL_ITEM_PRICES_CENTS.screen_protector +
      UPSELL_ITEM_PRICES_CENTS.transparent_case +
      UPSELL_ITEM_PRICES_CENTS.usb_c_cable,
  },
  complete: {
    title: "Komplettpaket",
    badge: "Beste Wahl",
    compareCents:
      UPSELL_ITEM_PRICES_CENTS.screen_protector +
      UPSELL_ITEM_PRICES_CENTS.transparent_case +
      UPSELL_ITEM_PRICES_CENTS.usb_c_cable +
      UPSELL_ITEM_PRICES_CENTS.charger_60w,
  },
};

export const UPSELL_ITEM_LABELS: Record<UpsellItemType, string> = {
  screen_protector: "Panzerglas",
  transparent_case: "Transparente Schutzhülle",
  usb_c_cable: "USB-C Ladekabel (USB-C auf USB-C)",
  charger_60w: "60 W USB-C Schnelllade-Netzteil",
};

/** Client may only send identifiers. */
export interface DeviceUpsellSelectionInput {
  /** Cart lineId of the smartphone this upsell belongs to. */
  cartLineId: string;
  mode: "none" | "singles" | "bundle";
  bundleId?: UpsellBundleId | null;
  /** Required when glass is part of selection. */
  screenProtector?: ScreenProtectorVariant | null;
  transparentCase?: boolean;
  usbCCable?: boolean;
  charger60w?: boolean;
}

export interface PricedUpsellItem {
  type: UpsellItemType;
  variant?: ScreenProtectorVariant;
  compatibleProduct?: string;
  unitPriceCents: number;
  label: string;
}

export interface PricedDeviceUpsell {
  cartLineId: string;
  targetProductId: string;
  targetProductName: string;
  mode: "singles" | "bundle";
  bundleType?: UpsellBundleId;
  bundleTitle?: string;
  bundlePriceCents?: number;
  compareCents?: number;
  items: PricedUpsellItem[];
  lineTotalCents: number;
  /** Display line for Stripe/PayPal */
  displayName: string;
  unitPrice: number;
  lineTotal: number;
}

function centsToEuro(cents: number): number {
  return Math.round(cents) / 100;
}

function isBundleId(value: unknown): value is UpsellBundleId {
  return value === "protection" || value === "everyday" || value === "complete";
}

function isScreenVariant(value: unknown): value is ScreenProtectorVariant {
  return value === "normal" || value === "privacy";
}

function glassLabel(
  variant: ScreenProtectorVariant,
  deviceName: string,
): string {
  const kind = variant === "privacy" ? "Privacy" : "Normal";
  return `Panzerglas ${kind} für ${deviceName}`;
}

function caseLabel(deviceName: string): string {
  return `Transparente Schutzhülle für ${deviceName}`;
}

export function formatUpsellEuroFromCents(cents: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(centsToEuro(cents));
}

export function emptyDeviceUpsellSelection(
  cartLineId: string,
): DeviceUpsellSelectionInput {
  return {
    cartLineId,
    mode: "none",
    bundleId: null,
    screenProtector: null,
    transparentCase: false,
    usbCCable: false,
    charger60w: false,
  };
}

/**
 * Prices one device upsell from identifiers only.
 * Returns null for mode "none" / empty selection.
 */
export function priceDeviceUpsellSelection(
  selection: DeviceUpsellSelectionInput,
  device: { lineId: string; productId: string; productName: string },
): { ok: true; priced: PricedDeviceUpsell | null } | { ok: false; message: string } {
  if (selection.cartLineId !== device.lineId) {
    return { ok: false, message: "Zubehör-Zuordnung ungültig." };
  }

  if (!selection.mode || selection.mode === "none") {
    return { ok: true, priced: null };
  }

  const deviceName = device.productName;

  if (selection.mode === "bundle") {
    if (!isBundleId(selection.bundleId)) {
      return { ok: false, message: "Ungültiges Zubehör-Bundle." };
    }
    const bundleId = selection.bundleId;
    const needsGlass = UPSELL_BUNDLE_ITEMS[bundleId].includes("screen_protector");
    if (needsGlass && !isScreenVariant(selection.screenProtector)) {
      return {
        ok: false,
        message: "Bitte wähle Normal oder Privacy für das Panzerglas.",
      };
    }

    const items: PricedUpsellItem[] = UPSELL_BUNDLE_ITEMS[bundleId].map((type) => {
      if (type === "screen_protector") {
        const variant = selection.screenProtector as ScreenProtectorVariant;
        return {
          type,
          variant,
          compatibleProduct: deviceName,
          unitPriceCents: UPSELL_ITEM_PRICES_CENTS.screen_protector,
          label: glassLabel(variant, deviceName),
        };
      }
      if (type === "transparent_case") {
        return {
          type,
          compatibleProduct: deviceName,
          unitPriceCents: UPSELL_ITEM_PRICES_CENTS.transparent_case,
          label: caseLabel(deviceName),
        };
      }
      return {
        type,
        unitPriceCents: UPSELL_ITEM_PRICES_CENTS[type],
        label: UPSELL_ITEM_LABELS[type],
      };
    });

    const bundlePriceCents = UPSELL_BUNDLE_PRICES_CENTS[bundleId];
    const meta = UPSELL_BUNDLE_META[bundleId];

    return {
      ok: true,
      priced: {
        cartLineId: device.lineId,
        targetProductId: device.productId,
        targetProductName: deviceName,
        mode: "bundle",
        bundleType: bundleId,
        bundleTitle: meta.title,
        bundlePriceCents,
        compareCents: meta.compareCents,
        items,
        lineTotalCents: bundlePriceCents,
        displayName: `${meta.title} für ${deviceName}`,
        unitPrice: centsToEuro(bundlePriceCents),
        lineTotal: centsToEuro(bundlePriceCents),
      },
    };
  }

  // singles — never auto-apply bundle pricing
  const items: PricedUpsellItem[] = [];
  if (selection.screenProtector) {
    if (!isScreenVariant(selection.screenProtector)) {
      return { ok: false, message: "Ungültige Panzerglas-Variante." };
    }
    items.push({
      type: "screen_protector",
      variant: selection.screenProtector,
      compatibleProduct: deviceName,
      unitPriceCents: UPSELL_ITEM_PRICES_CENTS.screen_protector,
      label: glassLabel(selection.screenProtector, deviceName),
    });
  }
  if (selection.transparentCase) {
    items.push({
      type: "transparent_case",
      compatibleProduct: deviceName,
      unitPriceCents: UPSELL_ITEM_PRICES_CENTS.transparent_case,
      label: caseLabel(deviceName),
    });
  }
  if (selection.usbCCable) {
    items.push({
      type: "usb_c_cable",
      unitPriceCents: UPSELL_ITEM_PRICES_CENTS.usb_c_cable,
      label: UPSELL_ITEM_LABELS.usb_c_cable,
    });
  }
  if (selection.charger60w) {
    items.push({
      type: "charger_60w",
      unitPriceCents: UPSELL_ITEM_PRICES_CENTS.charger_60w,
      label: UPSELL_ITEM_LABELS.charger_60w,
    });
  }

  if (items.length === 0) {
    return { ok: true, priced: null };
  }

  const lineTotalCents = items.reduce((sum, item) => sum + item.unitPriceCents, 0);

  return {
    ok: true,
    priced: {
      cartLineId: device.lineId,
      targetProductId: device.productId,
      targetProductName: deviceName,
      mode: "singles",
      items,
      lineTotalCents,
      displayName:
        items.length === 1
          ? items[0].label
          : `Zubehör für ${deviceName}`,
      unitPrice: centsToEuro(lineTotalCents),
      lineTotal: centsToEuro(lineTotalCents),
    },
  };
}

export function priceAllDeviceUpsells(
  selections: DeviceUpsellSelectionInput[] | undefined,
  devices: Array<{ lineId: string; productId: string; productName: string }>,
):
  | { ok: true; priced: PricedDeviceUpsell[] }
  | { ok: false; message: string } {
  if (!selections?.length) return { ok: true, priced: [] };

  const byLine = new Map(devices.map((device) => [device.lineId, device]));
  const priced: PricedDeviceUpsell[] = [];
  const seen = new Set<string>();

  for (const selection of selections) {
    if (!selection?.cartLineId) continue;
    if (seen.has(selection.cartLineId)) {
      return {
        ok: false,
        message: "Doppelte Zubehör-Auswahl für dasselbe Gerät.",
      };
    }
    seen.add(selection.cartLineId);

    const device = byLine.get(selection.cartLineId);
    if (!device) {
      return {
        ok: false,
        message: "Zubehör bezieht sich auf ein Gerät, das nicht im Warenkorb liegt.",
      };
    }

    const result = priceDeviceUpsellSelection(selection, device);
    if (!result.ok) return result;
    if (result.priced) priced.push(result.priced);
  }

  return { ok: true, priced };
}

export function upsellsToCheckoutLines(
  upsells: PricedDeviceUpsell[],
): Array<{
  productId: string;
  lineId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}> {
  return upsells.map((upsell) => ({
    productId: upsell.bundleType
      ? `upsell-bundle-${upsell.bundleType}`
      : `upsell-singles-${upsell.cartLineId}`,
    lineId: `upsell__${upsell.cartLineId}`,
    productName: upsell.displayName,
    quantity: 1,
    unitPrice: upsell.unitPrice,
    lineTotal: upsell.lineTotal,
  }));
}

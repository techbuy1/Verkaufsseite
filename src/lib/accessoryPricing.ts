import {
  ACCESSORY_VOLUME_TIERS,
  CASE_FOIL_COMBO_PRICE,
  DEVICE_ACCESSORY,
  isClearCaseId,
  isDeviceAccessoryId,
  isScreenProtectorId,
} from "@/data/deviceAccessories";

export interface PricedAccessoryLine {
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface AccessoryDiscountBreakdown {
  /** Summe der Listenpreise (ohne Rabatte). */
  accessorySubtotal: number;
  /** Ersparnis Panzerfolie + transparente Hülle → 15,99 €. */
  comboDiscount: number;
  comboPairs: number;
  /** Mengenrabatt auf Zubehör nach Combo. */
  volumeDiscount: number;
  volumePercent: number;
  volumeQty: number;
  /** combo + volume */
  totalDiscount: number;
  labels: string[];
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function volumePercentForQty(qty: number): number {
  for (const tier of ACCESSORY_VOLUME_TIERS) {
    if (qty >= tier.minQty) return tier.percent;
  }
  return 0;
}

/**
 * Berechnet Zubehör-Rabatte:
 * 1) Combo: je 1× Panzerfolie (egal welche) + 1× transparente Hülle → 15,99 € statt 19,98 €
 * 2) Mengenrabatt auf Zubehörstückzahl: 2→5%, 4→10%, 10→20%
 */
export function calculateAccessoryDiscounts(
  lines: Array<{ productId: string; quantity: number; unitPrice: number }>,
): AccessoryDiscountBreakdown {
  const accessoryLines = lines.filter((line) => isDeviceAccessoryId(line.productId));

  let accessorySubtotal = 0;
  let foilQty = 0;
  let clearCaseQty = 0;
  let volumeQty = 0;

  for (const line of accessoryLines) {
    const qty = Math.max(0, Math.floor(line.quantity));
    accessorySubtotal += line.unitPrice * qty;
    volumeQty += qty;
    if (isScreenProtectorId(line.productId)) foilQty += qty;
    if (isClearCaseId(line.productId)) clearCaseQty += qty;
  }

  accessorySubtotal = roundMoney(accessorySubtotal);

  const comboPairs = Math.min(foilQty, clearCaseQty);
  const listPair = DEVICE_ACCESSORY.caseClear.price + DEVICE_ACCESSORY.screenClear.price;
  const comboDiscount = roundMoney(comboPairs * (listPair - CASE_FOIL_COMBO_PRICE));

  const afterCombo = Math.max(0, roundMoney(accessorySubtotal - comboDiscount));
  const volumePercent = volumePercentForQty(volumeQty);
  const volumeDiscount = roundMoney(afterCombo * (volumePercent / 100));
  const totalDiscount = roundMoney(comboDiscount + volumeDiscount);

  const labels: string[] = [];
  if (comboPairs > 0) {
    labels.push(
      comboPairs === 1
        ? `Kombi Panzerfolie + Hülle (${CASE_FOIL_COMBO_PRICE.toFixed(2).replace(".", ",")} €)`
        : `${comboPairs}× Kombi Panzerfolie + Hülle`,
    );
  }
  if (volumePercent > 0) {
    labels.push(`Mengenrabatt Zubehör −${volumePercent}%`);
  }

  return {
    accessorySubtotal,
    comboDiscount,
    comboPairs,
    volumeDiscount,
    volumePercent,
    volumeQty,
    totalDiscount,
    labels,
  };
}

/**
 * Central TechBuy company / invoice settings.
 * Sourced from Impressum — edit here when company details change.
 *
 * Tax: never invent rates or treat margin scheme as "0 % VAT".
 */
export type TaxMode = "standard_19" | "margin_scheme";

export const TAX_MODE_OPTIONS: Array<{ value: TaxMode; label: string }> = [
  {
    value: "standard_19",
    label: "Regelbesteuerung – 19 % MwSt.",
  },
  {
    value: "margin_scheme",
    label: "Differenzbesteuerung nach § 25a UStG",
  },
];

export const companySettings = {
  companyName: "Techbuy",
  ownerName: "Ahmad Amir Popal",
  street: "Krümmelstraße 2",
  postalCode: "21502",
  city: "Geesthacht",
  country: "Deutschland",
  /** Öffentliche Shop-Kontaktadresse — überall auf der Website verwenden. */
  email: "info@techbuyshop.de",
  phone: "01630448214",
  vatId: "DE450323348",
  taxNumber: "112700620",
  /**
   * Hinweis für Anfragen, Widerruf, Support: Bestellnummer immer angeben.
   */
  contactOrderNumberHint:
    "Bitte geben Sie bei Anfragen, Widerruf oder Rückfragen stets Ihre Bestellnummer an.",
  /** Standard VAT rate for Regelbesteuerung (gross → net/VAT split). */
  standardVatRate: 0.19,
  /**
   * Official invoice wording for margin-scheme lines (central, editable).
   * Do not scatter this string across the codebase.
   */
  marginSchemeInvoiceNote: "Gebrauchtgegenstände/Sonderregelung",
  /** Internal/admin label — not a substitute for the invoice note above. */
  marginSchemeInternalLabel: "Differenzbesteuerung nach § 25a UStG",
} as const;

export function isTaxMode(value: unknown): value is TaxMode {
  return value === "standard_19" || value === "margin_scheme";
}

/** Gross price → net + VAT for Regelbesteuerung 19 %. */
export function splitGrossAtVatRate(
  gross: number,
  rate: number = companySettings.standardVatRate,
): { net: number; vat: number; gross: number } {
  const safeGross = Math.round(gross * 100) / 100;
  const net = Math.round((safeGross / (1 + rate)) * 100) / 100;
  const vat = Math.round((safeGross - net) * 100) / 100;
  return { net, vat, gross: safeGross };
}

/** Net price → VAT + gross for Regelbesteuerung — the inverse of {@link splitGrossAtVatRate}. */
export function combineNetAtVatRate(
  net: number,
  rate: number = companySettings.standardVatRate,
): { net: number; vat: number; gross: number } {
  const safeNet = Math.round(net * 100) / 100;
  const vat = Math.round(safeNet * rate * 100) / 100;
  const gross = Math.round((safeNet + vat) * 100) / 100;
  return { net: safeNet, vat, gross };
}

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type OrderPaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded"
  | "pending_review"
  | "denied";

export type ShippingCarrier = "DHL" | "DPD" | "Hermes" | "GLS" | "UPS" | "Andere";

export const SHIPPING_CARRIERS: ShippingCarrier[] = [
  "DHL",
  "DPD",
  "Hermes",
  "GLS",
  "UPS",
  "Andere",
];

export interface CheckoutCustomerInput {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  street: string;
  houseNumber: string;
  addressLine2?: string;
  postalCode: string;
  city: string;
  country: string;
}

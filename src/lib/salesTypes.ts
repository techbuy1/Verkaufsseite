/** Persistierte Einzelverkäufe für Admin-Dashboard & Gewinnkalkulation. */

export interface SaleTransaction {
  id: string;
  /** ISO timestamp */
  createdAt: string;
  productId?: string;
  productName: string;
  variantLabel?: string;
  /** Geräte-IMEI / Seriennummer */
  imei?: string;
  /** Einkaufspreis (netto Stück) */
  purchasePrice: number;
  /** Verkaufspreis (Stück) */
  salePrice: number;
  quantity: number;
  note?: string;
  source: "manual" | "checkout";
}

export interface SaleTransactionInput {
  productId?: string;
  productName: string;
  variantLabel?: string;
  imei?: string;
  purchasePrice: number;
  salePrice: number;
  quantity?: number;
  note?: string;
  createdAt?: string;
  source?: "manual" | "checkout";
}

export function saleProfit(sale: SaleTransaction): number {
  return (sale.salePrice - sale.purchasePrice) * sale.quantity;
}

export function saleRevenue(sale: SaleTransaction): number {
  return sale.salePrice * sale.quantity;
}

export function formatEuro(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

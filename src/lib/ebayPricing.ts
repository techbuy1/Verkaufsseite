/** TechBuy-Verkaufspreis: 2 % unter eBay, danach auf nächstes ,99 € runden. */
export const TECHBUY_DISCOUNT_PERCENT = 2;
export const TECHBUY_DISCOUNT_FACTOR = 0.98;

export interface TechBuyPriceBreakdown {
  ebay_price: number;
  discount_percentage: number;
  calculated_price: number;
  techbuy_price: number;
  currency: "EUR";
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Mathematischer Preis nach 2 % Rabatt — kaufmännisch auf 2 Nachkommastellen. */
export function calculateDiscountedPrice(ebayPrice: number): number {
  return roundMoney(ebayPrice * TECHBUY_DISCOUNT_FACTOR);
}

/** Nächstgelegener Verkaufspreis mit Centanteil ,99. */
export function roundToNearest99Price(discountedPrice: number): number {
  const rounded = roundMoney(discountedPrice);
  const euros = Math.floor(rounded);
  const fractionalCents = Math.round((rounded - euros) * 100);

  if (fractionalCents === 99) {
    return rounded;
  }

  const below = roundMoney(euros - 1 + 0.99);
  const above = roundMoney(euros + 0.99);

  const distBelow = Math.abs(rounded - below);
  const distAbove = Math.abs(rounded - above);

  return distBelow <= distAbove ? below : above;
}

/** Vollständige Preisberechnung — immer vom originalen eBay-Preis ausgehen. */
export function calculateTechBuyPrice(ebayPrice: number): TechBuyPriceBreakdown {
  const calculated_price = calculateDiscountedPrice(ebayPrice);
  const techbuy_price = roundToNearest99Price(calculated_price);

  return {
    ebay_price: roundMoney(ebayPrice),
    discount_percentage: TECHBUY_DISCOUNT_PERCENT,
    calculated_price,
    techbuy_price,
    currency: "EUR",
  };
}

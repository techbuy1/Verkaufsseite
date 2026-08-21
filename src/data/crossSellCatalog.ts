/** Bewertungen für Cross-Sell-Produkte (Anzeige im Warenkorb) */
export const crossSellRatings: Record<string, { rating: number; reviewCount: number }> = {
  "offer-airpods": { rating: 4.8, reviewCount: 2840 },
  "catalog-airpods": { rating: 4.6, reviewCount: 1520 },
  "catalog-chargers": { rating: 4.7, reviewCount: 980 },
  "catalog-cases": { rating: 4.5, reviewCount: 640 },
  "catalog-screen-protector": { rating: 4.4, reviewCount: 420 },
  "acc-screen-protector-clear": { rating: 4.6, reviewCount: 510 },
  "acc-screen-protector-matte": { rating: 4.5, reviewCount: 280 },
  "acc-screen-protector-privacy": { rating: 4.4, reviewCount: 190 },
  "acc-case-clear": { rating: 4.5, reviewCount: 640 },
  "acc-case-silicone-apple": { rating: 4.7, reviewCount: 420 },
  "acc-cable-usbc": { rating: 4.6, reviewCount: 890 },
  "catalog-apple-watch": { rating: 4.9, reviewCount: 3100 },
  "catalog-cables": { rating: 4.6, reviewCount: 890 },
  "catalog-adapters": { rating: 4.5, reviewCount: 560 },
  "catalog-galaxy-buds": { rating: 4.7, reviewCount: 1780 },
  "catalog-galaxy-watch": { rating: 4.8, reviewCount: 920 },
  "catalog-pixel-watch": { rating: 4.6, reviewCount: 540 },
  "catalog-powerbanks": { rating: 4.5, reviewCount: 710 },
  "catalog-sony-headphones": { rating: 4.8, reviewCount: 1340 },
  "apple-macbook-air-13-m4": { rating: 4.9, reviewCount: 890 },
  "apple-macbook-pro-14-m5": { rating: 4.9, reviewCount: 1200 },
};

export const DEFAULT_ACCESSORIES_BY_CATEGORY: Record<string, string[]> = {
  smartphones: [
    "acc-screen-protector-clear",
    "acc-screen-protector-matte",
    "acc-screen-protector-privacy",
    "acc-case-clear",
    "acc-cable-usbc",
  ],
  macbooks: [
    "acc-cable-usbc",
    "catalog-adapters",
    "catalog-chargers",
    "catalog-powerbanks",
  ],
  laptops: [
    "acc-cable-usbc",
    "catalog-adapters",
    "catalog-chargers",
    "catalog-powerbanks",
  ],
  tablets: [
    "acc-screen-protector-clear",
    "acc-screen-protector-matte",
    "acc-screen-protector-privacy",
    "acc-case-clear",
    "acc-cable-usbc",
  ],
};

export const DEFAULT_ACCESSORIES_BY_BRAND: Record<string, string[]> = {
  Apple: [
    "acc-screen-protector-clear",
    "acc-screen-protector-matte",
    "acc-screen-protector-privacy",
    "acc-case-clear",
    "acc-case-silicone-apple",
    "acc-cable-usbc",
    "offer-airpods",
    "catalog-apple-watch",
  ],
  Samsung: [
    "acc-screen-protector-clear",
    "acc-screen-protector-matte",
    "acc-screen-protector-privacy",
    "acc-case-clear",
    "acc-cable-usbc",
    "catalog-galaxy-buds",
    "catalog-galaxy-watch",
  ],
  Google: [
    "acc-screen-protector-clear",
    "acc-screen-protector-matte",
    "acc-screen-protector-privacy",
    "acc-case-clear",
    "acc-cable-usbc",
    "catalog-pixel-watch",
  ],
};

export const APPLE_PHONE_ACCESSORIES = [
  "acc-screen-protector-clear",
  "acc-screen-protector-matte",
  "acc-screen-protector-privacy",
  "acc-case-clear",
  "acc-case-silicone-apple",
  "acc-cable-usbc",
  "offer-airpods",
  "catalog-apple-watch",
];

export const SAMSUNG_PHONE_ACCESSORIES = [
  "acc-screen-protector-clear",
  "acc-screen-protector-matte",
  "acc-screen-protector-privacy",
  "acc-case-clear",
  "acc-cable-usbc",
  "catalog-galaxy-buds",
  "catalog-galaxy-watch",
];

export const MACBOOK_ACCESSORIES = [
  "acc-cable-usbc",
  "catalog-adapters",
  "catalog-chargers",
  "catalog-powerbanks",
];

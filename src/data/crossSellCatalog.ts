/** Bewertungen für Cross-Sell-Produkte (Anzeige im Warenkorb) */
export const crossSellRatings: Record<string, { rating: number; reviewCount: number }> = {
  "offer-airpods": { rating: 4.8, reviewCount: 2840 },
  "catalog-airpods": { rating: 4.6, reviewCount: 1520 },
  "catalog-chargers": { rating: 4.7, reviewCount: 980 },
  "catalog-cases": { rating: 4.5, reviewCount: 640 },
  "catalog-screen-protector": { rating: 4.4, reviewCount: 420 },
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
    "offer-airpods",
    "catalog-chargers",
    "catalog-cases",
    "catalog-screen-protector",
    "catalog-cables",
  ],
  macbooks: [
    "catalog-adapters",
    "catalog-chargers",
    "catalog-cables",
    "catalog-powerbanks",
    "catalog-cases",
  ],
  laptops: [
    "catalog-adapters",
    "catalog-chargers",
    "catalog-cables",
    "catalog-powerbanks",
    "catalog-cases",
  ],
  tablets: [
    "offer-airpods",
    "catalog-cases",
    "catalog-chargers",
    "catalog-screen-protector",
  ],
};

export const DEFAULT_ACCESSORIES_BY_BRAND: Record<string, string[]> = {
  Apple: [
    "offer-airpods",
    "catalog-chargers",
    "catalog-cases",
    "catalog-screen-protector",
    "catalog-apple-watch",
    "catalog-cables",
  ],
  Samsung: [
    "catalog-galaxy-buds",
    "catalog-galaxy-watch",
    "catalog-chargers",
    "catalog-cases",
    "catalog-screen-protector",
  ],
  Google: [
    "catalog-pixel-watch",
    "catalog-chargers",
    "catalog-cases",
    "catalog-screen-protector",
    "catalog-cables",
  ],
};

export const APPLE_PHONE_ACCESSORIES = [
  "offer-airpods",
  "catalog-chargers",
  "catalog-cases",
  "catalog-screen-protector",
  "catalog-apple-watch",
  "catalog-cables",
];

export const SAMSUNG_PHONE_ACCESSORIES = [
  "catalog-galaxy-buds",
  "catalog-galaxy-watch",
  "catalog-chargers",
  "catalog-cases",
  "catalog-screen-protector",
];

export const MACBOOK_ACCESSORIES = [
  "catalog-adapters",
  "catalog-chargers",
  "catalog-cables",
  "catalog-powerbanks",
  "catalog-cases",
];

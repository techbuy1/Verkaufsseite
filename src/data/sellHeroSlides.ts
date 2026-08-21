import { assetPath } from "@/lib/assetPath";

export interface SellHeroDevice {
  modelPath: string;
  colorModelPath?: string;
  colorHex: string;
  fallbackImage: string;
  alt: string;
  glowColor: string;
}

export interface SellHeroContent {
  eyebrow: string;
  headline: string;
  subheadline: string;
  ctaLabel: string;
  device: SellHeroDevice;
}

const APPLE_17 = "images/products/Apple/iPhones /iPhone 17/iPhone 17 Pro ";

/** Ankauf/trade-in flow lives on the sister site — same link the rest of TechBuy already uses. */
export const ANKAUF_URL = "https://www.techbuy-ankauf.de/";

/** Single static hero device: iPhone 17 Pro Cosmic Orange. */
export const SELL_HERO: SellHeroContent = {
  eyebrow: "Ankauf",
  headline: "Verkaufe dein Smartphone. Einfach. Schnell. Sicher.",
  subheadline: "Faire Preise für dein iPhone, Samsung & Co.",
  ctaLabel: "Jetzt verkaufen",
  device: {
    modelPath: "/models/optimized/iphone-17-pro.glb",
    colorModelPath: "/models/optimized/iphone-17-pro-cosmic-orange.glb",
    colorHex: "#e8622a",
    fallbackImage: assetPath(`${APPLE_17}/Apple_iPhone17Pro_Orange.png`),
    alt: "iPhone 17 Pro Cosmic Orange",
    glowColor: "#e8622a",
  },
};

/** @deprecated Use SELL_HERO — kept for any lingering imports. */
export const SELL_HERO_SLIDES = [SELL_HERO];

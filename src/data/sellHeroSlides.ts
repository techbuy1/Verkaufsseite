import { assetPath } from "@/lib/assetPath";

export interface SellHeroDevice {
  modelPath: string;
  colorModelPath?: string;
  colorHex: string;
  fallbackImage: string;
  alt: string;
  glowColor: string;
  /** Pre-rendered front/back/side stills used for the static hero collage (no WebGL on the homepage). */
  collage: {
    front: string;
    angles: string[];
  };
}

export interface SellHeroContent {
  eyebrow: string;
  headline: string;
  /** Static lead-in words before the cycling word in the hero title. */
  headlinePrefix: string;
  /** Words the hero title cycles through, one at a time. */
  carouselWords: string[];
  subheadline: string;
  ctaLabel: string;
  secondaryCtaLabel: string;
  ctaHref: string;
  secondaryCtaHref: string;
  device: SellHeroDevice;
}

const APPLE_17 = "images/products/Apple/iPhones /iPhone 17/iPhone 17 Pro ";

/** Product page for the hero device. */
export const HERO_PRODUCT_HREF = "/products/iphone-17-pro";

/** Single static hero: iPhone 17 Pro Cosmic Orange — shop buy focus. */
export const SELL_HERO: SellHeroContent = {
  eyebrow: "iPhone 17 Pro",
  headline: "Das neue iPhone 17 Pro entdecken.",
  headlinePrefix: "Technik, die",
  carouselWords: ["begeistert.", "innoviert.", "überzeugt.", "begeistert."],
  subheadline:
    "Pro-Kamera, A19 Pro und Titanium Design — jetzt bei TechBuy bestellen.",
  ctaLabel: "Jetzt kaufen",
  secondaryCtaLabel: "Alle Smartphones",
  ctaHref: HERO_PRODUCT_HREF,
  secondaryCtaHref: "/smartphones",
  device: {
    modelPath: "/models/optimized/iphone-17-pro.glb",
    colorModelPath: "/models/optimized/iphone-17-pro-cosmic-orange.glb",
    colorHex: "#e8622a",
    fallbackImage: assetPath(`${APPLE_17}/Apple_iPhone17Pro_Orange.png`),
    alt: "iPhone 17 Pro Cosmic Orange",
    glowColor: "#e8622a",
    collage: {
      front: assetPath("images/hero/collage/iphone-17-pro-cosmic-orange/front.png"),
      angles: [
        assetPath("images/hero/collage/iphone-17-pro-cosmic-orange/back.png"),
        assetPath("images/hero/collage/iphone-17-pro-cosmic-orange/side.png"),
      ],
    },
  },
};

/** @deprecated Use SELL_HERO — kept for any lingering imports. */
export const SELL_HERO_SLIDES = [SELL_HERO];

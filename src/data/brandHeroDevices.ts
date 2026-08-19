import { assetPath } from "@/lib/assetPath";

export interface BrandHeroSlide {
  id: string;
  /** Slug used both for the product-page link and to look up live stock. */
  slug: string;
  /** Catalog color id to check stock for — omit for a slide that isn't tied to one specific color. */
  colorId?: string;
  model: string;
  colorName: string;
  colorHex: string;
  modelPath: string;
  colorModelPath?: string;
  fallbackImage: string;
  glowColor: string;
}

const APPLE_17 = "images/products/Apple/iPhones /iPhone 17/iPhone 17 Pro ";
const SAMSUNG_A = "images/products/Samsung /Samsung Galaxy Handy /Samsung Galaxy A Series ";
const SAMSUNG_S26_ULTRA =
  "images/products/Samsung /Samsung Galaxy Handy /Samsung Galaxy S26 Serie /Samsung Galaxy S26 Ultra Reihe";

/**
 * iPhone 17 Pro is the only Apple device with a real GLB — its 3 real
 * catalog colors each have a dedicated pre-coloured export, plus the plain
 * (untinted) base model as a 4th, visually distinct slide. Every path here
 * is a verified real file; nothing is invented.
 */
export const IPHONE_HERO_CANDIDATES: BrandHeroSlide[] = [
  {
    // Listed first deliberately: this is a ~4MB export, the only "light"
    // iPhone 17 Pro GLB — every other one (incl. the "-hq" Deep Blue variant)
    // is ~24MB, so leading with this gets something on screen fast while the
    // rest preload in the background.
    id: "iphone-17-pro-deep-blue",
    slug: "iphone-17-pro",
    colorId: "deep-blue",
    model: "iPhone 17 Pro",
    colorName: "Deep Blue",
    colorHex: "#2f3b52",
    modelPath: "/models/iphone-17-pro.glb",
    colorModelPath: "/models/iphone-17-pro-deep-blue.glb",
    fallbackImage: assetPath(`${APPLE_17}/iPhone17Pro_DeepBlue.png`),
    glowColor: "#4a6fa5",
  },
  {
    id: "iphone-17-pro-cosmic-orange",
    slug: "iphone-17-pro",
    colorId: "cosmic-orange",
    model: "iPhone 17 Pro",
    colorName: "Cosmic Orange",
    colorHex: "#e8622a",
    modelPath: "/models/iphone-17-pro.glb",
    colorModelPath: "/models/iphone-17-pro-cosmic-orange.glb",
    fallbackImage: assetPath(`${APPLE_17}/Apple_iPhone17Pro_Orange.png`),
    glowColor: "#e8622a",
  },
  {
    id: "iphone-17-pro-silver",
    slug: "iphone-17-pro",
    colorId: "silver",
    model: "iPhone 17 Pro",
    colorName: "Silver",
    colorHex: "#e3e4e5",
    modelPath: "/models/iphone-17-pro.glb",
    colorModelPath: "/models/iphone-17-pro-silver.glb",
    fallbackImage: assetPath(`${APPLE_17}/apple_iphone_17_pro_1_1_1_1.png`),
    glowColor: "#c7c7cc",
  },
  {
    id: "iphone-17-pro-base",
    slug: "iphone-17-pro",
    // No colorId: this slide shows the plain base export as-is (no runtime
    // tint), so it's tied to the product's overall availability instead.
    model: "iPhone 17 Pro",
    colorName: "Titanium",
    colorHex: "#8a8a8e",
    modelPath: "/models/iphone-17-pro.glb",
    fallbackImage: assetPath(`${APPLE_17}/apple_iphone_17_pro_1_1_1_1.png`),
    glowColor: "#8a8a8e",
  },
];

/**
 * Samsung has 2 real device GLBs (Galaxy A57, Galaxy S26 Ultra) — both are
 * plain tintable base models (same runtime-tint mechanism their own product
 * pages already use), so real catalog colors from each fill out 4 slides.
 */
export const SAMSUNG_HERO_CANDIDATES: BrandHeroSlide[] = [
  {
    id: "galaxy-a57-navy",
    slug: "galaxy-a57",
    colorId: "awesome-navy",
    model: "Galaxy A57",
    colorName: "Awesome Navy",
    colorHex: "#1f2937",
    modelPath: "/models/galaxy-a57.glb",
    fallbackImage: assetPath(`${SAMSUNG_A}/Samsung_Galaxy_A57_AwesomeNavy_.png`),
    glowColor: "#1f2937",
  },
  {
    id: "galaxy-a57-icy-blue",
    slug: "galaxy-a57",
    colorId: "icy-blue",
    model: "Galaxy A57",
    colorName: "Icy Blue",
    colorHex: "#7eb6d7",
    modelPath: "/models/galaxy-a57.glb",
    fallbackImage: assetPath(`${SAMSUNG_A}/Samsung_Galaxy_A57_AwesomeNavy_.png`),
    glowColor: "#7eb6d7",
  },
  {
    id: "galaxy-s26-ultra-sky-blue",
    slug: "galaxy-s26-ultra",
    colorId: "sky-blue",
    model: "Galaxy S26 Ultra",
    colorName: "Sky Blue",
    colorHex: "#7eb6d7",
    modelPath: "/models/galaxy-s26-ultra.glb",
    fallbackImage: assetPath(`${SAMSUNG_S26_ULTRA}/S26_Ultra_SkyBlue .png`),
    glowColor: "#7eb6d7",
  },
  {
    id: "galaxy-s26-ultra-black",
    slug: "galaxy-s26-ultra",
    colorId: "schwarz",
    model: "Galaxy S26 Ultra",
    colorName: "Schwarz",
    colorHex: "#1d1d1f",
    modelPath: "/models/galaxy-s26-ultra.glb",
    fallbackImage: assetPath(`${SAMSUNG_S26_ULTRA}/S26_Ultra_Black.png`),
    glowColor: "#5b5a8a",
  },
];

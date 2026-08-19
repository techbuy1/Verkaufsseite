import { assetPath } from "@/lib/assetPath";

/** Einheitliche Shop-Flächen — an weiße Produkt-/Hero-PNG-Kanten (#fefefe) angeglichen. */
export const SHOP_SURFACE = {
  hero: "#fefefe",
  card: "#fefefe",
  page: "#f5f5f7",
} as const;

export const HERO_IMAGE_FILES = {
  iphone17ProLineup: "iPhone17Pro_Lineup .png",
  iphone17Lineup: "iPhone17_Lineup .png",
  galaxyS26UltraLineup: "Samsung_Galaxy_S26_Ultra_Lineup.png",
  googlePixelModelle: "GooglePixel_Modelle .png",
} as const;

export type HeroImageKey = keyof typeof HERO_IMAGE_FILES;

/** Natürliche Abmessungen der Hero-Dateien — für object-contain ohne Kasten-Container. */
export const HERO_IMAGE_DIMENSIONS: Record<HeroImageKey, { width: number; height: number }> = {
  iphone17ProLineup: { width: 1672, height: 941 },
  iphone17Lineup: { width: 1774, height: 887 },
  galaxyS26UltraLineup: { width: 1254, height: 1254 },
  googlePixelModelle: { width: 1402, height: 1122 },
};

const HERO_DIR = "images/hero";

export function heroImagePath(key: HeroImageKey): string {
  return assetPath(`${HERO_DIR}/${HERO_IMAGE_FILES[key]}`);
}

export function heroImageDimensions(key: HeroImageKey): { width: number; height: number } {
  return HERO_IMAGE_DIMENSIONS[key];
}

/** Marketing-Hero pro Marke (nur für Banner, nicht für Produktvarianten). */
export const BRAND_HERO_IMAGES = {
  apple: heroImagePath("iphone17ProLineup"),
  samsung: heroImagePath("galaxyS26UltraLineup"),
  google: heroImagePath("googlePixelModelle"),
} as const;

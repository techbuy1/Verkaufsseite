export interface ProductImageMeta {
  brand: "Apple" | "Samsung" | "Google";
  model: string;
  series?: string;
}

export interface RegistryColorEntry {
  id: string;
  name: string;
  hex: string;
  /** Relativer Pfad ab /public */
  file: string;
  /** Weitere echte Ansichten derselben Farbe (z. B. Rückseite) — relative Pfade ab /public */
  angles?: string[];
  /** Wallpaper-/Screen-Textur für 3D-Darstellung dieser Farbe */
  wallpaper?: string;
  /** Optionales farbgenaues GLB unter /public — ohne Runtime-Tint */
  model?: string;
}

const APPLE = "images/products/Apple/iPhones ";
const IPHONE_17 = `${APPLE}/iPhone 17`;
const IPHONE_16 = `${APPLE}/iPhone 16 `;
const IPHONE_15 = `${APPLE}/iPhone 15`;
const IPHONE_14 = `${APPLE}/iPhone 14`;
const SAMSUNG_S26_SERIE = "images/products/Samsung /Samsung Galaxy Handy /Samsung Galaxy S26 Serie ";
const SAMSUNG = `${SAMSUNG_S26_SERIE}/Samsung Galaxy S26 Ultra Reihe`;
const SAMSUNG_S26_PLUS = `${SAMSUNG_S26_SERIE}/Samsung Galaxy S26 & S26 Plus `;
const SAMSUNG_S25_SERIE = "images/products/Samsung /Samsung Galaxy Handy /Samsung Galaxy S25 Reihe ";
const SAMSUNG_S25_ULTRA = `${SAMSUNG_S25_SERIE}/Samsung Galaxy S25 Ultra `;
const SAMSUNG_S25_PLUS = `${SAMSUNG_S25_SERIE}/Samsung Galaxy S25 & S25 Plus `;
const SAMSUNG_S24_SERIE = "images/products/Samsung /Samsung Galaxy Handy /Samsung Galaxy S24 Reihe ";
const SAMSUNG_S24 = `${SAMSUNG_S24_SERIE}/Samsung Galaxy S24 `;
const SAMSUNG_S24_ULTRA = `${SAMSUNG_S24_SERIE}/Samsung Galaxy S24 Ultra `;
const SAMSUNG_S24_FE = `${SAMSUNG_S24_SERIE}/Samsung Galaxy S24 FE`;
const SAMSUNG_A = "images/products/Samsung /Samsung Galaxy Handy /Samsung Galaxy A Series ";
const GOOGLE = "images/products/Google Pixel ";
const IPAD = "images/products/Apple/iPad";

export const PRODUCT_IMAGE_META: Record<string, ProductImageMeta> = {
  "iphone-17-pro": { brand: "Apple", model: "iPhone 17 Pro", series: "iPhone 17" },
  "iphone-17-pro-max": { brand: "Apple", model: "iPhone 17 Pro Max", series: "iPhone 17" },
  "iphone-17": { brand: "Apple", model: "iPhone 17", series: "iPhone 17" },
  "iphone-17-air": { brand: "Apple", model: "iPhone 17 Air", series: "iPhone 17" },
  "iphone-16": { brand: "Apple", model: "iPhone 16", series: "iPhone 16" },
  "iphone-16-plus": { brand: "Apple", model: "iPhone 16 Plus", series: "iPhone 16" },
  "iphone-16-pro": { brand: "Apple", model: "iPhone 16 Pro", series: "iPhone 16" },
  "iphone-16-pro-max": { brand: "Apple", model: "iPhone 16 Pro Max", series: "iPhone 16" },
  "iphone-16e": { brand: "Apple", model: "iPhone 16e", series: "iPhone 16" },
  "iphone-15-pro": { brand: "Apple", model: "iPhone 15 Pro", series: "iPhone 15" },
  "iphone-15-pro-max": { brand: "Apple", model: "iPhone 15 Pro Max", series: "iPhone 15" },
  "iphone-15": { brand: "Apple", model: "iPhone 15", series: "iPhone 15" },
  "iphone-15-plus": { brand: "Apple", model: "iPhone 15 Plus", series: "iPhone 15" },
  "iphone-14-pro": { brand: "Apple", model: "iPhone 14 Pro", series: "iPhone 14" },
  "iphone-14-pro-max": { brand: "Apple", model: "iPhone 14 Pro Max", series: "iPhone 14" },
  "iphone-14": { brand: "Apple", model: "iPhone 14", series: "iPhone 14" },
  "iphone-14-plus": { brand: "Apple", model: "iPhone 14 Plus", series: "iPhone 14" },
  "galaxy-s26-ultra": { brand: "Samsung", model: "Galaxy S26 Ultra", series: "Galaxy S26" },
  "galaxy-s26": { brand: "Samsung", model: "Galaxy S26", series: "Galaxy S26" },
  "galaxy-s26-plus": { brand: "Samsung", model: "Galaxy S26+", series: "Galaxy S26" },
  "galaxy-s25-ultra": { brand: "Samsung", model: "Galaxy S25 Ultra", series: "Galaxy S25" },
  "galaxy-s25": { brand: "Samsung", model: "Galaxy S25", series: "Galaxy S25" },
  "galaxy-s25-plus": { brand: "Samsung", model: "Galaxy S25+", series: "Galaxy S25" },
  "galaxy-s24-ultra": { brand: "Samsung", model: "Galaxy S24 Ultra", series: "Galaxy S24" },
  "galaxy-s24": { brand: "Samsung", model: "Galaxy S24", series: "Galaxy S24" },
  "galaxy-s24-plus": { brand: "Samsung", model: "Galaxy S24+", series: "Galaxy S24" },
  "galaxy-s24-fe": { brand: "Samsung", model: "Galaxy S24 FE", series: "Galaxy S24" },
  "galaxy-a57": { brand: "Samsung", model: "Galaxy A57", series: "Galaxy A" },
  "galaxy-a56": { brand: "Samsung", model: "Galaxy A56", series: "Galaxy A" },
  "galaxy-a37": { brand: "Samsung", model: "Galaxy A37", series: "Galaxy A" },
  "galaxy-a36": { brand: "Samsung", model: "Galaxy A36", series: "Galaxy A" },
  "galaxy-a27": { brand: "Samsung", model: "Galaxy A27", series: "Galaxy A" },
  "galaxy-a26": { brand: "Samsung", model: "Galaxy A26", series: "Galaxy A" },
  "galaxy-a17": { brand: "Samsung", model: "Galaxy A17", series: "Galaxy A" },
  "galaxy-a16": { brand: "Samsung", model: "Galaxy A16", series: "Galaxy A" },
  "google-pixel-9-pro": { brand: "Google", model: "Pixel 9 Pro", series: "Pixel 9" },
  "google-pixel-9-pro-xl": { brand: "Google", model: "Pixel 9 Pro XL", series: "Pixel 9" },
  // No "google-" prefix: pixelDef("Pixel 9", …) has no slug override, so its
  // computed slug (and this lookup key) is the bare model slug.
  "pixel-9": { brand: "Google", model: "Pixel 9", series: "Pixel 9" },
  "pixel-8-pro": { brand: "Google", model: "Pixel 8 Pro", series: "Pixel 8" },
  // No "google-" prefix: pixelDef("Pixel 8", …) has no slug override, so its
  // computed slug (and this lookup key) is the bare model slug.
  "pixel-8": { brand: "Google", model: "Pixel 8", series: "Pixel 8" },
  "google-pixel-10": { brand: "Google", model: "Pixel 10", series: "Pixel 10" },
  "google-pixel-10-pro": { brand: "Google", model: "Pixel 10 Pro", series: "Pixel 10" },
  "google-pixel-10-pro-xl": { brand: "Google", model: "Pixel 10 Pro XL", series: "Pixel 10" },
  "google-pixel-10a": { brand: "Google", model: "Pixel 10a", series: "Pixel 10" },
  "ipad-air-m3": { brand: "Apple", model: "iPad Air M3", series: "iPad Air" },
  "ipad-air-m2": { brand: "Apple", model: "iPad Air M2", series: "iPad Air" },
  "ipad-11-generation": { brand: "Apple", model: "iPad 11. Generation", series: "iPad" },
  "ipad-pro-m5": { brand: "Apple", model: "iPad Pro M5", series: "iPad Pro" },
  "ipad-pro-m4": { brand: "Apple", model: "iPad Pro M4", series: "iPad Pro" },
};

/** Rohdaten-Registry – Validierung und Mapping nutzen ausschließlich diese Datei. */
export const PRODUCT_IMAGE_REGISTRY: Record<string, RegistryColorEntry[]> = {
  "iphone-17-pro": [
    {
      id: "cosmic-orange",
      name: "Cosmic Orange",
      hex: "#e8622a",
      file: `${IPHONE_17}/iPhone 17 Pro /Apple_iPhone17Pro_Orange.png`,
      wallpaper: "images/products/Apple/iPhone-17-Pro-wallpapers/cosmic-orange.png",
      model: "models/iphone-17-pro-cosmic-orange.glb",
    },
    {
      id: "deep-blue",
      name: "Deep Blue",
      hex: "#2f3b52",
      file: `${IPHONE_17}/iPhone 17 Pro /iPhone17Pro_DeepBlue.png`,
      wallpaper: "images/products/Apple/iPhone-17-Pro-wallpapers/deep-blue.png",
      model: "models/iphone-17-pro-deep-blue-hq.glb",
    },
    {
      id: "silver",
      name: "Silver",
      hex: "#e3e4e5",
      file: `${IPHONE_17}/iPhone 17 Pro /apple_iphone_17_pro_1_1_1_1.png`,
      wallpaper: "images/products/Apple/iPhone-17-Pro-wallpapers/silver.jpg",
      model: "models/iphone-17-pro-silver.glb",
    },
  ],
  "iphone-17-pro-max": [
    { id: "cosmic-orange", name: "Cosmic Orange", hex: "#e8622a", file: `${IPHONE_17}/iPhone 17 Pro Max /17ProMaxOrange.png` },
    { id: "deep-blue", name: "Deep Blue", hex: "#2f3b52", file: `${IPHONE_17}/iPhone 17 Pro Max /17ProMaxDeepBlue.png` },
    { id: "silver", name: "Silver", hex: "#e3e4e5", file: `${IPHONE_17}/iPhone 17 Pro Max /17ProMaxSilber.png` },
  ],
  "iphone-17": [
    { id: "black", name: "Schwarz", hex: "#1d1d1f", file: `${IPHONE_17}/iPhone 17 /iPhone_17_Black.png` },
    { id: "white", name: "Weiß", hex: "#f5f5f7", file: `${IPHONE_17}/iPhone 17 /iPhone_17_white.png` },
    { id: "lavender", name: "Lavendel", hex: "#b8a9c9", file: `${IPHONE_17}/iPhone 17 /iPhone_17_Lavendel.png` },
    { id: "mist-blue", name: "Mist Blue", hex: "#9ec5e8", file: `${IPHONE_17}/iPhone 17 /iPhone_17_Mist_Blue.png` },
    { id: "sage-green", name: "Sage Green", hex: "#4f8777", file: `${IPHONE_17}/iPhone 17 /iPhone_17_Sage_Green.png` },
  ],
  "iphone-17-air": [
    { id: "black", name: "Schwarz", hex: "#1d1d1f", file: `${IPHONE_17}/iPhone Air /iPhone_Air_Black.png` },
    { id: "sky-blue", name: "Sky Blue", hex: "#7eb6d7", file: `${IPHONE_17}/iPhone Air /iPhone_Air_SkyBlue.png` },
    { id: "light-gold", name: "Lichtgold", hex: "#d4a59a", file: `${IPHONE_17}/iPhone Air /apple_iphone_17_air_Lichtgold .png` },
  ],
  "iphone-16": [
    { id: "black", name: "Schwarz", hex: "#1d1d1f", file: `${IPHONE_16}/iPhone 16 Normal /iPhone16Black.png` },
    { id: "pink", name: "Pink", hex: "#f2b8c6", file: `${IPHONE_16}/iPhone 16 Normal /iPhone16Pink.png` },
    { id: "teal", name: "Teal", hex: "#4f8777", file: `${IPHONE_16}/iPhone 16 Normal /iPhone16TealGreen.png` },
    { id: "ultramarine", name: "Ultramarine", hex: "#4a6fa5", file: `${IPHONE_16}/iPhone 16 Normal /iPhone16Ultramarine.png` },
    { id: "white", name: "Weiß", hex: "#f5f5f7", file: `${IPHONE_16}/iPhone 16 Normal /iPhone16White.png` },
  ],
  "iphone-16-plus": [
    { id: "black", name: "Schwarz", hex: "#1d1d1f", file: `${IPHONE_16}/iPhone 16 Plus /iPhone16PlusBlack Kopie.png` },
    { id: "pink", name: "Pink", hex: "#f2b8c6", file: `${IPHONE_16}/iPhone 16 Plus /iPhone16PlusPink Kopie.png` },
    { id: "teal", name: "Teal", hex: "#4f8777", file: `${IPHONE_16}/iPhone 16 Plus /iPhone16PlusTealGreen Kopie.png` },
    { id: "ultramarine", name: "Ultramarine", hex: "#4a6fa5", file: `${IPHONE_16}/iPhone 16 Plus /iPhone16PlusUltramarine Kopie.png` },
    { id: "white", name: "Weiß", hex: "#f5f5f7", file: `${IPHONE_16}/iPhone 16 Plus /iPhone16PlusWhite Kopie.png` },
  ],
  "iphone-16-pro": [
    { id: "titan-black", name: "Titan Schwarz", hex: "#1d1d1f", file: `${IPHONE_16}/iPhone 16 Pro /iPhone_16_Pro_TitanBlack.png` },
    { id: "titan-desert", name: "Titan Wüstensand", hex: "#d4a59a", file: `${IPHONE_16}/iPhone 16 Pro /iPhone_16_Pro_TitanDessert.png` },
    { id: "titan-natural", name: "Titan Natur", hex: "#bfa48a", file: `${IPHONE_16}/iPhone 16 Pro /iPhone_16_Pro_TitanNatur .png` },
    { id: "titan-silver", name: "Titan Silber", hex: "#e3e4e5", file: `${IPHONE_16}/iPhone 16 Pro /iPhone_16_Pro_TitanSilber .png` },
  ],
  "iphone-16-pro-max": [
    { id: "titan-black", name: "Titan Schwarz", hex: "#1d1d1f", file: `${IPHONE_16}/iPhone 16 Pro Max /iPhone_16_Pro_Max_TitanBlack Kopie.png` },
    { id: "titan-desert", name: "Titan Wüstensand", hex: "#d4a59a", file: `${IPHONE_16}/iPhone 16 Pro Max /iPhone_16_Pro_Max_TitanDessert Kopie.png` },
    { id: "titan-natural", name: "Titan Natur", hex: "#bfa48a", file: `${IPHONE_16}/iPhone 16 Pro Max /iPhone_16_Pro_Max_TitanNatur  Kopie.png` },
    { id: "titan-silver", name: "Titan Silber", hex: "#e3e4e5", file: `${IPHONE_16}/iPhone 16 Pro Max /iPhone_16_Pro_Max_TitanSilber  Kopie.png` },
  ],
  "iphone-16e": [
    { id: "black", name: "Schwarz", hex: "#1d1d1f", file: `${IPHONE_16}/iPhone 16e /iPhone_16e_Black.png` },
    { id: "white", name: "Weiß", hex: "#f5f5f7", file: `${IPHONE_16}/iPhone 16e /iPhone_16e_white.png` },
  ],
  "iphone-15": [
    { id: "black", name: "Schwarz", hex: "#1d1d1f", file: `${IPHONE_15}/iPhone15_Black.png` },
    { id: "blue", name: "Blau", hex: "#4a6fa5", file: `${IPHONE_15}/iPhone15_Blau.png` },
    { id: "yellow", name: "Gelb", hex: "#e8d44a", file: `${IPHONE_15}/iPhone15_Gelb.png` },
    { id: "green", name: "Grün", hex: "#4f8777", file: `${IPHONE_15}/iPhone15_Grün.png` },
    { id: "pink", name: "Pink", hex: "#f2b8c6", file: `${IPHONE_15}/iPhone15_Pink.png` },
  ],
  "iphone-15-plus": [
    { id: "black", name: "Schwarz", hex: "#1d1d1f", file: `${IPHONE_15}/iPhone15Plus_Black Kopie.png` },
    { id: "blue", name: "Blau", hex: "#4a6fa5", file: `${IPHONE_15}/iPhone15Plus_Blau Kopie.png` },
    { id: "yellow", name: "Gelb", hex: "#e8d44a", file: `${IPHONE_15}/iPhone15Plus_Gelb Kopie.png` },
    { id: "green", name: "Grün", hex: "#4f8777", file: `${IPHONE_15}/iPhone15Plus_Grün Kopie.png` },
    { id: "pink", name: "Pink", hex: "#f2b8c6", file: `${IPHONE_15}/iPhone15Plus_Pink Kopie.png` },
  ],
  /** iPhone 14 / 14 Plus share one photoshoot (front = .jpg for Black, rest .png). */
  "iphone-14": [
    { id: "black", name: "Schwarz", hex: "#1d1d1f", file: `${IPHONE_14}/iphone_14_14Plus_vorne_Black.jpg`, angles: [`${IPHONE_14}/iphone_14_14Plus_hinten_Black.png`] },
    { id: "yellow", name: "Gelb", hex: "#f0e2a0", file: `${IPHONE_14}/iphone_14_14Plus_vorne_gelb.png`, angles: [`${IPHONE_14}/iphone_14_14Plus_hinten_gelb.png`] },
    { id: "red", name: "Rot", hex: "#b3122a", file: `${IPHONE_14}/iphone_14_14Plus_vorne_rot.png`, angles: [`${IPHONE_14}/iphone_14_14Plus_hinten_rot.png`] },
    { id: "purple", name: "Violett", hex: "#c7bfd4", file: `${IPHONE_14}/iphone_14_14Plus_vorne_violett.png`, angles: [`${IPHONE_14}/iphone_14_14Plus_hinten_violett.png`] },
    { id: "white", name: "Weiß", hex: "#f5f5f7", file: `${IPHONE_14}/iphone_14_14Plus_vorne_weiß.png`, angles: [`${IPHONE_14}/iphone_14_14Plus_hinten_weiß.png`] },
  ],
  "iphone-14-plus": [
    { id: "black", name: "Schwarz", hex: "#1d1d1f", file: `${IPHONE_14}/iphone_14_14Plus_vorne_Black.jpg`, angles: [`${IPHONE_14}/iphone_14_14Plus_hinten_Black.png`] },
    { id: "yellow", name: "Gelb", hex: "#f0e2a0", file: `${IPHONE_14}/iphone_14_14Plus_vorne_gelb.png`, angles: [`${IPHONE_14}/iphone_14_14Plus_hinten_gelb.png`] },
    { id: "red", name: "Rot", hex: "#b3122a", file: `${IPHONE_14}/iphone_14_14Plus_vorne_rot.png`, angles: [`${IPHONE_14}/iphone_14_14Plus_hinten_rot.png`] },
    { id: "purple", name: "Violett", hex: "#c7bfd4", file: `${IPHONE_14}/iphone_14_14Plus_vorne_violett.png`, angles: [`${IPHONE_14}/iphone_14_14Plus_hinten_violett.png`] },
    { id: "white", name: "Weiß", hex: "#f5f5f7", file: `${IPHONE_14}/iphone_14_14Plus_vorne_weiß.png`, angles: [`${IPHONE_14}/iphone_14_14Plus_hinten_weiß.png`] },
  ],
  /** iPhone 14 Pro / Pro Max share one photoshoot. */
  "iphone-14-pro": [
    { id: "space-black", name: "Space Schwarz", hex: "#3b3b3d", file: `${IPHONE_14}/iphone_14_pro_promax_black.png`, angles: [`${IPHONE_14}/iphone_14_pro_promax_hinten_Black.jpg.png`] },
    { id: "gold", name: "Gold", hex: "#e8dcc4", file: `${IPHONE_14}/iphone_14_pro_promax_gold.png`, angles: [`${IPHONE_14}/iphone_14_pro_promax_hinten_gold.png`] },
    { id: "deep-purple", name: "Deep Purple", hex: "#5e5266", file: `${IPHONE_14}/iphone_14_pro_promax_Lila.jpg`, angles: [`${IPHONE_14}/iphone_14_pro_promax_hinten_lila.jpg.png.png`] },
    { id: "silver", name: "Silber", hex: "#e3e4e5", file: `${IPHONE_14}/iphone_14_pro_promax_vorne_silber.png`, angles: [`${IPHONE_14}/iphone_14_pro_promax_hinten_silber.png`] },
  ],
  "iphone-14-pro-max": [
    { id: "space-black", name: "Space Schwarz", hex: "#3b3b3d", file: `${IPHONE_14}/iphone_14_pro_promax_black.png`, angles: [`${IPHONE_14}/iphone_14_pro_promax_hinten_Black.jpg.png`] },
    { id: "gold", name: "Gold", hex: "#e8dcc4", file: `${IPHONE_14}/iphone_14_pro_promax_gold.png`, angles: [`${IPHONE_14}/iphone_14_pro_promax_hinten_gold.png`] },
    { id: "deep-purple", name: "Deep Purple", hex: "#5e5266", file: `${IPHONE_14}/iphone_14_pro_promax_Lila.jpg`, angles: [`${IPHONE_14}/iphone_14_pro_promax_hinten_lila.jpg.png.png`] },
    { id: "silver", name: "Silber", hex: "#e3e4e5", file: `${IPHONE_14}/iphone_14_pro_promax_vorne_silber.png`, angles: [`${IPHONE_14}/iphone_14_pro_promax_hinten_silber.png`] },
  ],
  "iphone-15-pro": [
    { id: "titan-black", name: "Titan Schwarz", hex: "#1d1d1f", file: `${IPHONE_15}/iPhone15Pro_TitanBlack.png` },
    { id: "titan-blue", name: "Titan Blau", hex: "#4a6fa5", file: `${IPHONE_15}/iPhone15Pro_Titanblau.png` },
    { id: "titan-natural", name: "Titan Natur", hex: "#bfa48a", file: `${IPHONE_15}/iPhone15Pro_TitanNatur.png` },
    { id: "titan-white", name: "Titan Weiß", hex: "#f5f5f7", file: `${IPHONE_15}/iPhone15Pro_Titanweiß.png` },
  ],
  "iphone-15-pro-max": [
    { id: "titan-black", name: "Titan Schwarz", hex: "#1d1d1f", file: `${IPHONE_15}/iPhone15ProMax_TitanBlack K.png` },
    { id: "titan-blue", name: "Titan Blau", hex: "#4a6fa5", file: `${IPHONE_15}/iPhone15ProMax_Titanblau.png` },
    { id: "titan-natural", name: "Titan Natur", hex: "#bfa48a", file: `${IPHONE_15}/iPhone15ProMax_TitanNatur.png` },
    { id: "titan-white", name: "Titan Weiß", hex: "#f5f5f7", file: `${IPHONE_15}/iPhone15ProMax_Titanweiß.png` },
  ],
  "galaxy-s26-ultra": [
    {
      id: "sky-blue",
      name: "Sky Blue",
      hex: "#7eb6d7",
      file: `${SAMSUNG}/S26_Ultra_SkyBlue .png`,
      wallpaper: `${SAMSUNG_S26_SERIE}/wallpapers/sky-blue.png`,
    },
    {
      id: "pink",
      name: "Pink",
      hex: "#f4b4c4",
      file: `${SAMSUNG}/S26_Ultra_Rosa.png`,
      wallpaper: `${SAMSUNG_S26_SERIE}/wallpapers/pink.png`,
    },
    {
      id: "silver",
      name: "Silber",
      hex: "#d2d2d7",
      file: `${SAMSUNG}/S26_Ultra_silber .png`,
      wallpaper: `${SAMSUNG_S26_SERIE}/wallpapers/silver.png`,
    },
    {
      id: "violet",
      name: "Violett",
      hex: "#8b7ab8",
      file: `${SAMSUNG}/S26_Ultra_Violett.png`,
      wallpaper: `${SAMSUNG_S26_SERIE}/wallpapers/violet.png`,
    },
    {
      id: "white",
      name: "Weiß",
      hex: "#f5f5f7",
      file: `${SAMSUNG}/S26_Ultra_white.png`,
      wallpaper: `${SAMSUNG_S26_SERIE}/wallpapers/white.png`,
    },
    {
      id: "black",
      name: "Schwarz",
      hex: "#1d1d1f",
      file: `${SAMSUNG}/S26_Ultra_Black.png`,
      wallpaper: `${SAMSUNG_S26_SERIE}/wallpapers/black.png`,
    },
  ],
  /**
   * S26 / S26+ catalog colours corrected to the real Samsung lineup. The
   * photoshoot (black, skyblue, white, violett) now matches 4 of the 6
   * names almost exactly; Silver Shadow (store-exclusive) and Pink Gold
   * have no shoot yet and stay unassigned rather than guessed.
   */
  /**
   * S26 / S26+ photoshoot: Silver Shadow and Pinkgold match the catalog
   * colours directly. Icyblue reuses the "skyblue" shot (identical hex,
   * #9ec5e8, in both). Navy and Blueblack have no distinct shot — both are
   * near-black dark tones, so both reuse the "black" photo (#1d1d1f) as the
   * closest available match. No Mint or Coralred photo exists.
   */
  "galaxy-s26": [
    { id: "navy", name: "Navy", hex: "#1f2937", file: `${SAMSUNG_S26_PLUS}/Samsung_galaxy_s26_s26Plus_black_vorne.png`, angles: [`${SAMSUNG_S26_PLUS}/Samsung_galaxy_s26_s26Plus_black_hinten.png`] },
    { id: "icyblue", name: "Icyblue", hex: "#9ec5e8", file: `${SAMSUNG_S26_PLUS}/Samsung_galaxy_s26_s26Plus_skyblue_vorne.png`, angles: [`${SAMSUNG_S26_PLUS}/Samsung_galaxy_s26_s26Plus_skyblue_hinten.png`] },
    { id: "silver-shadow", name: "Silver Shadow", hex: "#c5c7ce", file: `${SAMSUNG_S26_PLUS}/Samsung_Galaxy_S26_Silver_Shadow_Vorne.png`, angles: [`${SAMSUNG_S26_PLUS}/Samsung_Galaxy_S26_Silver_Shadow_Hinten.png`] },
    { id: "blueblack", name: "Blueblack", hex: "#1a2744", file: `${SAMSUNG_S26_PLUS}/Samsung_galaxy_s26_s26Plus_black_vorne.png`, angles: [`${SAMSUNG_S26_PLUS}/Samsung_galaxy_s26_s26Plus_black_hinten.png`] },
    { id: "pinkgold", name: "Pinkgold", hex: "#d4a59a", file: `${SAMSUNG_S26_PLUS}/Samsung_Galaxy_S26_Pink_Gold_Vorne.png`, angles: [`${SAMSUNG_S26_PLUS}/Samsung_Galaxy_S26_Pink_Gold_Hinten.png`] },
  ],
  "galaxy-s26-plus": [
    { id: "navy", name: "Navy", hex: "#1f2937", file: `${SAMSUNG_S26_PLUS}/Samsung_galaxy_s26_s26Plus_black_vorne.png`, angles: [`${SAMSUNG_S26_PLUS}/Samsung_galaxy_s26_s26Plus_black_hinten.png`] },
    { id: "icyblue", name: "Icyblue", hex: "#9ec5e8", file: `${SAMSUNG_S26_PLUS}/Samsung_galaxy_s26_s26Plus_skyblue_vorne.png`, angles: [`${SAMSUNG_S26_PLUS}/Samsung_galaxy_s26_s26Plus_skyblue_hinten.png`] },
    { id: "silver-shadow", name: "Silver Shadow", hex: "#c5c7ce", file: `${SAMSUNG_S26_PLUS}/Samsung_Galaxy_S26_Silver_Shadow_Vorne.png`, angles: [`${SAMSUNG_S26_PLUS}/Samsung_Galaxy_S26_Silver_Shadow_Hinten.png`] },
    { id: "blueblack", name: "Blueblack", hex: "#1a2744", file: `${SAMSUNG_S26_PLUS}/Samsung_galaxy_s26_s26Plus_black_vorne.png`, angles: [`${SAMSUNG_S26_PLUS}/Samsung_galaxy_s26_s26Plus_black_hinten.png`] },
    { id: "pinkgold", name: "Pinkgold", hex: "#d4a59a", file: `${SAMSUNG_S26_PLUS}/Samsung_Galaxy_S26_Pink_Gold_Vorne.png`, angles: [`${SAMSUNG_S26_PLUS}/Samsung_Galaxy_S26_Pink_Gold_Hinten.png`] },
  ],
  /**
   * S25 / S25+ photoshoot covers Navy, Mint, Blueblack, Coralred and Silver
   * Shadow. No Icyblue photo exists (the former "Blau" shot was replaced by
   * the current Navy shot) and no Pinkgold photo exists — both stay unmapped.
   */
  "galaxy-s25": [
    { id: "navy", name: "Navy", hex: "#1f2937", file: `${SAMSUNG_S25_PLUS}/Samsung_Galaxy_S25_Vorne_Navy.png`, angles: [`${SAMSUNG_S25_PLUS}/Samsung_Galaxy_S25_hinten_Navy.png`] },
    { id: "mint", name: "Mint", hex: "#a8dcc8", file: `${SAMSUNG_S25_PLUS}/Samsung_Galaxy_S25_Vorne_Mint.png`, angles: [`${SAMSUNG_S25_PLUS}/Samsung_Galaxy_S25_hinten_Mint.png`] },
    { id: "silver-shadow", name: "Silver Shadow", hex: "#c5c7ce", file: `${SAMSUNG_S25_PLUS}/Samsung_Galaxy_S25_Vorne_silber.png`, angles: [`${SAMSUNG_S25_PLUS}/Samsung_Galaxy_S25_hinten_silber.png`] },
    { id: "blueblack", name: "Blueblack", hex: "#1a2744", file: `${SAMSUNG_S25_PLUS}/Samsung_Galaxy_S25_Vorne_blueblack.png`, angles: [`${SAMSUNG_S25_PLUS}/Samsung_Galaxy_S25_hinten_blueblack.png`] },
    { id: "coralred", name: "Coralred", hex: "#e87070", file: `${SAMSUNG_S25_PLUS}/Samsung_Galaxy_S25_Vorne_rot.png`, angles: [`${SAMSUNG_S25_PLUS}/Samsung_Galaxy_S25_hinten_rot.png`] },
  ],
  "galaxy-s25-plus": [
    { id: "navy", name: "Navy", hex: "#1f2937", file: `${SAMSUNG_S25_PLUS}/Samsung_Galaxy_S25_Vorne_Navy.png`, angles: [`${SAMSUNG_S25_PLUS}/Samsung_Galaxy_S25_hinten_Navy.png`] },
    { id: "mint", name: "Mint", hex: "#a8dcc8", file: `${SAMSUNG_S25_PLUS}/Samsung_Galaxy_S25_Vorne_Mint.png`, angles: [`${SAMSUNG_S25_PLUS}/Samsung_Galaxy_S25_hinten_Mint.png`] },
    { id: "silver-shadow", name: "Silver Shadow", hex: "#c5c7ce", file: `${SAMSUNG_S25_PLUS}/Samsung_Galaxy_S25_Vorne_silber.png`, angles: [`${SAMSUNG_S25_PLUS}/Samsung_Galaxy_S25_hinten_silber.png`] },
    { id: "blueblack", name: "Blueblack", hex: "#1a2744", file: `${SAMSUNG_S25_PLUS}/Samsung_Galaxy_S25_Vorne_blueblack.png`, angles: [`${SAMSUNG_S25_PLUS}/Samsung_Galaxy_S25_hinten_blueblack.png`] },
    { id: "coralred", name: "Coralred", hex: "#e87070", file: `${SAMSUNG_S25_PLUS}/Samsung_Galaxy_S25_Vorne_rot.png`, angles: [`${SAMSUNG_S25_PLUS}/Samsung_Galaxy_S25_hinten_rot.png`] },
  ],
  /**
   * S25 Ultra photoshoot uses plain colour names (Black/Blau/gold/grau/
   * silber/weiß) rather than the catalog's "Titanium …" names — matched to
   * the closest titanium finish by best judgement. "Titanium Jetblack" has
   * no distinct photo from "Titanium Black" and stays unassigned; the
   * green colourway only has a back-angle shot, used as the primary photo.
   */
  "galaxy-s25-ultra": [
    { id: "titanium-black", name: "Titanium Black", hex: "#1c1c1c", file: `${SAMSUNG_S25_ULTRA}/Samsung_Galaxy_S25Ultra_Black_Vorne.png`, angles: [`${SAMSUNG_S25_ULTRA}/Samsung_Galaxy_S25Ultra_Black_hinten.png`] },
    { id: "titanium-silverblue", name: "Titanium Silverblue", hex: "#7f8fa3", file: `${SAMSUNG_S25_ULTRA}/Samsung_Galaxy_S25Ultra_Blau_Vorne.png`, angles: [`${SAMSUNG_S25_ULTRA}/Samsung_Galaxy_S25Ultra_Blau_hinten..png`] },
    { id: "titanium-pinkgold", name: "Titanium Pinkgold", hex: "#d4a59a", file: `${SAMSUNG_S25_ULTRA}/Samsung_Galaxy_S25Ultra_gold_Vorne..png`, angles: [`${SAMSUNG_S25_ULTRA}/Samsung_Galaxy_S25Ultra_gold_hinten..png`] },
    { id: "titanium-gray", name: "Titanium Gray", hex: "#8e8e93", file: `${SAMSUNG_S25_ULTRA}/Samsung_Galaxy_S25Ultra_grau_Vorne.png`, angles: [`${SAMSUNG_S25_ULTRA}/Samsung_Galaxy_S25Ultra_grau_hinten.png`] },
    { id: "titanium-whitesilver", name: "Titanium WhiteSilver", hex: "#e3e4e5", file: `${SAMSUNG_S25_ULTRA}/Samsung_Galaxy_S25Ultra_silber_Vorne.png`, angles: [`${SAMSUNG_S25_ULTRA}/Samsung_Galaxy_S25Ultra_silber_hinte.png`] },
    { id: "titanium-jadegreen", name: "Titanium Jadegreen", hex: "#5f8f7a", file: `${SAMSUNG_S25_ULTRA}/Samsung_Galaxy_S25Ultra_grün_hinten.png` },
  ],
  /** S24 / S24+ photoshoot names line up with 4 of the catalog's colours; no Jade Green, Sapphire Blue or Sandstone Orange shots exist. */
  "galaxy-s24": [
    { id: "onyx-black", name: "Onyx Black", hex: "#1d1d1f", file: `${SAMSUNG_S24}/Samsung_Galaxy_S24_Onyx_Black_Vorne.png`, angles: [`${SAMSUNG_S24}/Samsung_Galaxy_S24_Onyx_Black_Hinten.png`] },
    { id: "marble-gray", name: "Marble Gray", hex: "#b8b8bd", file: `${SAMSUNG_S24}/Samsung_Galaxy_S24_Marble_Gray_Vorne.png`, angles: [`${SAMSUNG_S24}/Samsung_Galaxy_S24_Marble_Gray_Hinten.png`] },
    { id: "cobalt-violet", name: "Cobalt Violet", hex: "#7d7da8", file: `${SAMSUNG_S24}/Samsung_Galaxy_S24_Cobalt_Violet_Vorne (1).png`, angles: [`${SAMSUNG_S24}/Samsung_Galaxy_S24_Cobalt_Violet_Hinten.png`] },
    { id: "amber-yellow", name: "Amber Yellow", hex: "#e8d44a", file: `${SAMSUNG_S24}/Samsung_Galaxy_S24_Amber_Yellow_Vorne.png`, angles: [`${SAMSUNG_S24}/Samsung_Galaxy_S24_Amber_Yellow_Hinten.png`] },
  ],
  "galaxy-s24-plus": [
    { id: "onyx-black", name: "Onyx Black", hex: "#1d1d1f", file: `${SAMSUNG_S24}/Samsung_Galaxy_S24_Onyx_Black_Vorne.png`, angles: [`${SAMSUNG_S24}/Samsung_Galaxy_S24_Onyx_Black_Hinten.png`] },
    { id: "marble-gray", name: "Marble Gray", hex: "#b8b8bd", file: `${SAMSUNG_S24}/Samsung_Galaxy_S24_Marble_Gray_Vorne.png`, angles: [`${SAMSUNG_S24}/Samsung_Galaxy_S24_Marble_Gray_Hinten.png`] },
    { id: "cobalt-violet", name: "Cobalt Violet", hex: "#7d7da8", file: `${SAMSUNG_S24}/Samsung_Galaxy_S24_Cobalt_Violet_Vorne (1).png`, angles: [`${SAMSUNG_S24}/Samsung_Galaxy_S24_Cobalt_Violet_Hinten.png`] },
    { id: "amber-yellow", name: "Amber Yellow", hex: "#e8d44a", file: `${SAMSUNG_S24}/Samsung_Galaxy_S24_Amber_Yellow_Vorne.png`, angles: [`${SAMSUNG_S24}/Samsung_Galaxy_S24_Amber_Yellow_Hinten.png`] },
  ],
  /** S24 Ultra photoshoot covers 5 of the catalog's 7 Titanium finishes (Black/Gray/Violet/Yellow/Green); no Blue or Orange shots exist. */
  "galaxy-s24-ultra": [
    { id: "titanium-black", name: "Titanium Black", hex: "#1c1c1c", file: `${SAMSUNG_S24_ULTRA}/3179f882-6ce9-44ab-a61e-d1189cf6b32f.png`, angles: [`${SAMSUNG_S24_ULTRA}/d939368d-4a51-4de5-a2c5-3f9bbc7f3f66.png`] },
    { id: "titanium-gray", name: "Titanium Gray", hex: "#8e8e93", file: `${SAMSUNG_S24_ULTRA}/f18cd12f-2fc9-4d61-be8d-d35f1f022cc3.png`, angles: [`${SAMSUNG_S24_ULTRA}/9c2eb7e9-c5a7-4144-8f18-338d2fd5abc7.png`] },
    { id: "titanium-violet", name: "Titanium Violet", hex: "#8b7ab8", file: `${SAMSUNG_S24_ULTRA}/c439b59b-a08c-4511-ad18-fcc4545dfbaa.png`, angles: [`${SAMSUNG_S24_ULTRA}/a188e275-513b-44eb-803c-83eb7b592252.png`] },
    { id: "titanium-yellow", name: "Titanium Yellow", hex: "#e8d44a", file: `${SAMSUNG_S24_ULTRA}/a9f97e2f-e621-4b40-a641-f03182a8bc44.png`, angles: [`${SAMSUNG_S24_ULTRA}/1eb437d3-fa0f-40c4-96ca-b399eaeff181.png`] },
    { id: "titanium-green", name: "Titanium Green", hex: "#5f8f7a", file: `${SAMSUNG_S24_ULTRA}/1ecdc580-cff9-4277-b3a5-4dfb3909742e.png`, angles: [`${SAMSUNG_S24_ULTRA}/46422257-9633-4500-908b-131d47aaaefc.png`] },
  ],
  /** S24 FE photoshoot covers all 4 catalog colours; a bonus Yellow shot also exists but isn't a listed catalog colour. */
  "galaxy-s24-fe": [
    { id: "graphite", name: "Graphite", hex: "#414141", file: `${SAMSUNG_S24_FE}/Samsung_Galaxy_S24_FE_Graphite_Vorne.png`, angles: [`${SAMSUNG_S24_FE}/Samsung_Galaxy_S24_FE_Graphite_Hinten.png`] },
    { id: "gray", name: "Gray", hex: "#b8b8bd", file: `${SAMSUNG_S24_FE}/Samsung_Galaxy_S24_FE_Gray_Vorne (1).png`, angles: [`${SAMSUNG_S24_FE}/Samsung_Galaxy_S24_FE_Gray_Hinten.png`] },
    { id: "blue", name: "Blue", hex: "#4a6fa5", file: `${SAMSUNG_S24_FE}/Samsung_Galaxy_S24_FE_Blue_Vorne.png`, angles: [`${SAMSUNG_S24_FE}/Samsung_Galaxy_S24_FE_Blue_Hinten (1).png`] },
    { id: "mint", name: "Mint", hex: "#a8dcc8", file: `${SAMSUNG_S24_FE}/Samsung_Galaxy_S24_FE_Mint_Vorne.png`, angles: [`${SAMSUNG_S24_FE}/Samsung_Galaxy_S24_FE_Mint_Hinten (1).png`] },
  ],
  "galaxy-a57": [
    {
      id: "awesome-navy",
      name: "Awesome Navy",
      hex: "#1f2937",
      file: `${SAMSUNG_A}/Samsung_Galaxy_A57_AwesomeNavy_.png`,
      // No dedicated A57 wallpaper shoot yet — reuses the closest existing
      // Samsung wallpaper tone rather than inventing a new asset.
      wallpaper: `${SAMSUNG_S26_SERIE}/wallpapers/black.png`,
    },
    {
      id: "awesome-lilac",
      name: "Awesome Lilac",
      hex: "#b8a9c9",
      file: `${SAMSUNG_A}/Samsung_Galaxy_A57_AwesomeLila.png`,
      wallpaper: `${SAMSUNG_S26_SERIE}/wallpapers/violet.png`,
    },
    {
      id: "icy-blue",
      name: "Icy Blue",
      hex: "#7eb6d7",
      file: `${SAMSUNG_A}/Samsung_Galaxy_A57_IcyBlue.png`,
      wallpaper: `${SAMSUNG_S26_SERIE}/wallpapers/sky-blue.png`,
    },
    {
      id: "awesome-graphite",
      name: "Awesome Graphite",
      hex: "#414141",
      file: `${SAMSUNG_A}/Samsung_Galaxy_A57_AwesomeGray_.png`,
      wallpaper: `${SAMSUNG_S26_SERIE}/wallpapers/silver.png`,
    },
  ],
  "galaxy-a56": [
    { id: "awesome-olive", name: "Awesome Olive", hex: "#6b7c5c", file: `${SAMSUNG_A}/Samsung_Galaxy_A56_AwesomeOlive.png` },
    { id: "awesome-pink", name: "Awesome Pink", hex: "#f4b4c4", file: `${SAMSUNG_A}/Samsung_Galaxy_A56_AwesomePink.png` },
    { id: "awesome-graphite", name: "Awesome Graphite", hex: "#414141", file: `${SAMSUNG_A}/Samsung_Galaxy_A56_AwesomeGraphit.png` },
    { id: "awesome-lightgray", name: "Awesome Lightgray", hex: "#d2d2d7", file: `${SAMSUNG_A}/Samsung_Galaxy_A56_AwesomeLightgray.png` },
  ],
  "galaxy-a37": [
    { id: "awesome-charcoal", name: "Awesome Charcoal", hex: "#3a3a3c", file: `${SAMSUNG_A}/Samsung_Galaxy_A37_Awesome_Charcoal_Vorne.png`, angles: [`${SAMSUNG_A}/Samsung_Galaxy_A37_Awesome_Charcoal_Hinten#.png`] },
    { id: "awesome-violet", name: "Awesome Violet", hex: "#8b7ab8", file: `${SAMSUNG_A}/Samsung_Galaxy_A37_AwesomeLavendel.png` },
    { id: "awesome-white", name: "Awesome White", hex: "#f5f5f7", file: `${SAMSUNG_A}/Samsung_Galaxy_A37_AwesomeWhite.png` },
    { id: "awesome-graygreen", name: "Awesome Graygreen", hex: "#7c8a7a", file: `${SAMSUNG_A}/Samsung_Galaxy_A37_Awesome Graygreen..png`, angles: [`${SAMSUNG_A}/Samsung_Galaxy_A37_Graygren.png`] },
  ],
  /** A36 photoshoot covers all 3 catalog colours; a bonus Lime shot also exists but isn't a listed catalog colour. */
  "galaxy-a36": [
    { id: "awesome-black", name: "Awesome Black", hex: "#1d1d1f", file: `${SAMSUNG_A}/Samsung_Galaxy_A36_Awesome_Black_Vorne.png`, angles: [`${SAMSUNG_A}/Samsung_Galaxy_A36_Awesome_Black_Hinten.png`] },
    { id: "awesome-white", name: "Awesome White", hex: "#f5f5f7", file: `${SAMSUNG_A}/Samsung_Galaxy_A36_Awesome_White_Vorne.png`, angles: [`${SAMSUNG_A}/Samsung_Galaxy_A36_Awesome_White_Hinten.png`] },
    { id: "awesome-lavender", name: "Awesome Lavender", hex: "#b8a9c9", file: `${SAMSUNG_A}/Samsung_Galaxy_A36_Awesome_Lavender_Vorne.png`, angles: [`${SAMSUNG_A}/Samsung_Galaxy_A36_Awesome_Lavender_Hinten.png`] },
  ],
  "galaxy-a27": [
    { id: "black", name: "Black", hex: "#1d1d1f", file: `${SAMSUNG_A}/Samsung_Galaxy_A27_Black.png` },
    { id: "blue", name: "Blue", hex: "#4a6fa5", file: `${SAMSUNG_A}/Samsung_Galaxy_A27_Blue.png` },
    { id: "pink", name: "Pink", hex: "#f4b4c4", file: `${SAMSUNG_A}/Samsung_Galaxy_a27_Pink.png` },
  ],
  "galaxy-a26": [
    { id: "black", name: "Black", hex: "#1d1d1f", file: `${SAMSUNG_A}/samsung_galaxy_a26_Black.png` },
    { id: "mint", name: "Mint", hex: "#a8dcc8", file: `${SAMSUNG_A}/Samsung_Galaxy_a26_mint .png` },
    { id: "white", name: "White", hex: "#f5f5f7", file: `${SAMSUNG_A}/Samsung_Galaxy_a26_white.png` },
  ],
  "galaxy-a17": [
    { id: "black", name: "Black", hex: "#1d1d1f", file: `${SAMSUNG_A}/Samsung_Galaxy_A17_Black.png` },
    { id: "gray", name: "Gray", hex: "#b8b8bd", file: `${SAMSUNG_A}/Samsung_Galaxy_A17_Lightgrey.png` },
    { id: "blue", name: "Blue", hex: "#4a6fa5", file: `${SAMSUNG_A}/Samsung_Galaxy_a17_Blau.png` },
  ],
  /** A16 photoshoot covers Blue Black and Light Gray directly; no Gold shot exists (a bonus Light Green shot isn't a listed catalog colour either). */
  "galaxy-a16": [
    { id: "blue-black", name: "Blue Black", hex: "#1a2744", file: `${SAMSUNG_A}/Samsung_Galaxy_A16_5G_Blue_Black_Vorne.png`, angles: [`${SAMSUNG_A}/Samsung_Galaxy_A16_5G_Blue_Black_Hinten.png`] },
    { id: "light-gray", name: "Light Gray", hex: "#d2d2d7", file: `${SAMSUNG_A}/Samsung_Galaxy_A16_5G_Light_Gray_Vorne.png`, angles: [`${SAMSUNG_A}/Samsung_Galaxy_A16_5G_Light_Gray_Hinten.png`] },
  ],
  /** Official Pixel 9 Pro colourway names/hexes; XL reuses the same 4 colours from its own photoshoot. */
  "google-pixel-9-pro": [
    { id: "obsidian", name: "Obsidian", hex: "#1d1d1f", file: `${GOOGLE}/Google Pixel 9 Pro /Google_Pixel_9_Pro_Obsidian_Vorne.png`, angles: [`${GOOGLE}/Google Pixel 9 Pro /Google_Pixel_9_Pro_Obsidian_Hinten.png`] },
    { id: "porcelain", name: "Porcelain", hex: "#f0ece4", file: `${GOOGLE}/Google Pixel 9 Pro /Google_Pixel_9_Pro_Porcelain_Vorne.png`, angles: [`${GOOGLE}/Google Pixel 9 Pro /Google_Pixel_9_Pro_Porcelain_Hinten.png`] },
    { id: "hazel", name: "Hazel", hex: "#8a8a72", file: `${GOOGLE}/Google Pixel 9 Pro /Google_Pixel_9_Pro_Hazel_Vorne.png`, angles: [`${GOOGLE}/Google Pixel 9 Pro /Google_Pixel_9_Pro_Hazel_Hinten.png`] },
    { id: "rose-quartz", name: "Rose Quartz", hex: "#e8c4bd", file: `${GOOGLE}/Google Pixel 9 Pro /Google_Pixel_9_Pro_Rose_Quartz_Vorne.png`, angles: [`${GOOGLE}/Google Pixel 9 Pro /Google_Pixel_9_Pro_Rose_Quartz_Hinten.png`] },
  ],
  "google-pixel-9-pro-xl": [
    { id: "obsidian", name: "Obsidian", hex: "#1d1d1f", file: `${GOOGLE}/Google Pixel 9 Pro XL /Google_Pixel_9_Pro_Obsidian_Vorne.png`, angles: [`${GOOGLE}/Google Pixel 9 Pro XL /Google_Pixel_9_Pro_Obsidian_Hinten.png`] },
    { id: "porcelain", name: "Porcelain", hex: "#f0ece4", file: `${GOOGLE}/Google Pixel 9 Pro XL /Google_Pixel_9_Pro_Porcelain_Vorne.png`, angles: [`${GOOGLE}/Google Pixel 9 Pro XL /Google_Pixel_9_Pro_Porcelain_Hinten.png`] },
    { id: "hazel", name: "Hazel", hex: "#8a8a72", file: `${GOOGLE}/Google Pixel 9 Pro XL /Google_Pixel_9_Pro_Hazel_Vorne.png`, angles: [`${GOOGLE}/Google Pixel 9 Pro XL /Google_Pixel_9_Pro_Hazel_Hinten.png`] },
    { id: "rose-quartz", name: "Rose Quartz", hex: "#e8c4bd", file: `${GOOGLE}/Google Pixel 9 Pro XL /Google_Pixel_9_Pro_Rose_Quartz_Vorne.png`, angles: [`${GOOGLE}/Google Pixel 9 Pro XL /Google_Pixel_9_Pro_Rose_Quartz_Hinten.png`] },
  ],
  /** Official Pixel 9 (non-Pro) colourway names. */
  "pixel-9": [
    { id: "obsidian", name: "Obsidian", hex: "#1d1d1f", file: `${GOOGLE}/Google Pixel 9/Google_Pixel9_vorne_Obsidian.png`, angles: [`${GOOGLE}/Google Pixel 9/Google_Pixel9_hinten_Obsidian.png`] },
    { id: "porcelain", name: "Porcelain", hex: "#f0ece4", file: `${GOOGLE}/Google Pixel 9/Google_Pixel9_vorne_ Porcelain.png`, angles: [`${GOOGLE}/Google Pixel 9/Google_Pixel9_hinten_ Porcelain.png.png`] },
    { id: "wintergreen", name: "Wintergreen", hex: "#a8c9a0", file: `${GOOGLE}/Google Pixel 9/Google_Pixel9_vorne_ wintergreen.png`, angles: [`${GOOGLE}/Google Pixel 9/Google_Pixel9_hinten_ wintergreen.png`] },
    { id: "peony", name: "Peony", hex: "#f0c4cb", file: `${GOOGLE}/Google Pixel 9/Google_Pixel9_vorne_ Peony.png`, angles: [`${GOOGLE}/Google Pixel 9/Google_Pixel9_hinten_ Peony.png`] },
  ],
  /** Official Pixel 8 Pro colourway names (see note above — no base Pixel 8 photos exist). */
  "pixel-8-pro": [
    { id: "obsidian", name: "Obsidian", hex: "#1d1d1f", file: `${GOOGLE}/Google Pixel 8 Pro/Google_Pixel_8_Pro_Obsidian_Vorne.png`, angles: [`${GOOGLE}/Google Pixel 8 Pro/Google_Pixel_8_Pro_Obsidian_Hinten.png`] },
    { id: "porcelain", name: "Porcelain", hex: "#f0ece4", file: `${GOOGLE}/Google Pixel 8 Pro/Google_Pixel_8_Pro_Porcelain_Vorne.png`, angles: [`${GOOGLE}/Google Pixel 8 Pro/Google_Pixel_8_Pro_Porcelain_Hinten.png`] },
    { id: "bay", name: "Bay", hex: "#8fa8c2", file: `${GOOGLE}/Google Pixel 8 Pro/Google_Pixel_8_Pro_Bay_Vorne.png`, angles: [`${GOOGLE}/Google Pixel 8 Pro/Google_Pixel_8_Pro_Bay_Hinten.png`] },
    { id: "mint", name: "Mint", hex: "#a8dcc8", file: `${GOOGLE}/Google Pixel 8 Pro/Google_Pixel_8_Pro_Mint_Vorne.png`, angles: [`${GOOGLE}/Google Pixel 8 Pro/Google_Pixel_8_Pro_Mint_Hinten.png`] },
  ],
  /**
   * The base (non-Pro) Pixel 8 has no dedicated photoshoot — the "Google
   * Pixel 8" folder contains photographer-supplied copies of the Pro shots
   * (same real files, "_Pro_" left in the filenames), reused here for the
   * base model's colour variants.
   */
  "pixel-8": [
    { id: "obsidian", name: "Obsidian", hex: "#1d1d1f", file: `${GOOGLE}/Google Pixel 8/Google_Pixel_8_Pro_Obsidian_Vorne.png`, angles: [`${GOOGLE}/Google Pixel 8/Google_Pixel_8_Pro_Obsidian_Hinten.png`] },
    { id: "porcelain", name: "Porcelain", hex: "#f0ece4", file: `${GOOGLE}/Google Pixel 8/Google_Pixel_8_Pro_Porcelain_Vorne.png`, angles: [`${GOOGLE}/Google Pixel 8/Google_Pixel_8_Pro_Porcelain_Hinten.png`] },
    { id: "bay", name: "Bay", hex: "#8fa8c2", file: `${GOOGLE}/Google Pixel 8/Google_Pixel_8_Pro_Bay_Vorne.png`, angles: [`${GOOGLE}/Google Pixel 8/Google_Pixel_8_Pro_Bay_Hinten.png`] },
    { id: "mint", name: "Mint", hex: "#a8dcc8", file: `${GOOGLE}/Google Pixel 8/Google_Pixel_8_Pro_Mint_Vorne (2).png`, angles: [`${GOOGLE}/Google Pixel 8/Google_Pixel_8_Pro_Mint_Hinten.png`] },
  ],
  "google-pixel-10": [
    { id: "obsidian", name: "Obsidian", hex: "#1d1d1f", file: `${GOOGLE}/Google Pixel 10/google_pixel_10_ Obsidian.png` },
    { id: "indigo-blue", name: "Indigo Blue", hex: "#4a6fa5", file: `${GOOGLE}/Google Pixel 10/Google_Pixel_10_Indigo_Blue .png` },
    { id: "lemon-yellow", name: "Lemon Yellow", hex: "#e8d44a", file: `${GOOGLE}/Google Pixel 10/Google_Pixel_Gelb_Lemonyellow.png` },
    { id: "frozen-blue", name: "Frozen Blue", hex: "#9ec5e8", file: `${GOOGLE}/Google Pixel 10/Google_Pixel_10_Frozenblau.png` },
  ],
  "google-pixel-10-pro": [
    { id: "obsidian", name: "Obsidian", hex: "#1d1d1f", file: `${GOOGLE}/Google Pixel 10 Pro /pixel_10_pro_Obsidian.png` },
    { id: "jade-green", name: "Jade Green", hex: "#5f8f7a", file: `${GOOGLE}/Google Pixel 10 Pro /Google_Pixel_10_Pro_Jadegreen_Grün.png` },
    { id: "moonstone", name: "Moonstone", hex: "#b8b8bd", file: `${GOOGLE}/Google Pixel 10 Pro /Google_Pixel_10_Pro_Monnstone_Grau.png` },
    { id: "porcelain", name: "Porcelain", hex: "#f5f5f7", file: `${GOOGLE}/Google Pixel 10 Pro /Google_Pixel_10Pro_ProceLain.png` },
  ],
  "google-pixel-10-pro-xl": [
    { id: "obsidian", name: "Obsidian", hex: "#1d1d1f", file: `${GOOGLE}/Google Pixel 10 Pro XL /pixel_10_pro_XL_Obsidian Kopie.png` },
    { id: "jade-green", name: "Jade Green", hex: "#5f8f7a", file: `${GOOGLE}/Google Pixel 10 Pro XL /Google_Pixel_10_Pro_XL_Jadegreen_Grün Kopie.png` },
    { id: "moonstone", name: "Moonstone", hex: "#b8b8bd", file: `${GOOGLE}/Google Pixel 10 Pro XL /Google_Pixel_10_Pro_XL_Monnstone_Grau Kopie.png` },
    { id: "porcelain", name: "Porcelain", hex: "#f5f5f7", file: `${GOOGLE}/Google Pixel 10 Pro XL /Google_Pixel_10_Pro_XL_ProceLain Kopie.png` },
  ],
  "google-pixel-10a": [
    { id: "obsidian", name: "Obsidian", hex: "#1d1d1f", file: `${GOOGLE}/Google Pixel 10a/GooglePixel_10a_Obsidian.png` },
    { id: "berry", name: "Berry", hex: "#8b3a62", file: `${GOOGLE}/Google Pixel 10a/GooglePixel_10a_Berry .png` },
    { id: "fog-green", name: "Fog Green", hex: "#6b7c5c", file: `${GOOGLE}/Google Pixel 10a/GooglePixel_10a_Foggreen.png` },
    { id: "lavender", name: "Lavender", hex: "#b8a9c9", file: `${GOOGLE}/Google Pixel 10a/GooglePixel_10a_Lavender.png` },
  ],
  "ipad-air-m3": [
    {
      id: "blue",
      name: "Blau",
      hex: "#7ea7d8",
      file: `${IPAD}/ipad_Air_M3_Blau.png`,
      angles: [`${IPAD}/ChatGPT Image 18. Aug. 2026, 15_08_46 (1).png`],
    },
    {
      id: "gold",
      name: "Gold",
      hex: "#e8dcc4",
      file: `${IPAD}/iPad_Air_M3_Gold.png`,
      angles: [`${IPAD}/iPad_Air_M3_Gold_hinten.png`],
    },
    {
      id: "gray",
      name: "Space Grau",
      hex: "#86868b",
      file: `${IPAD}/iPad_Air_M3_Grau.png`,
      angles: [`${IPAD}/iPad_Air_M3_hinten_Grau.png`],
    },
    {
      id: "violet",
      name: "Violett",
      hex: "#8b7ab8",
      file: `${IPAD}/ipad_air_M3_violett.png`,
      angles: [`${IPAD}/iPad_Air_M3_Violett_hinten.png`],
    },
  ],
  "ipad-air-m2": [
    {
      id: "space-gray",
      name: "Space Grau",
      hex: "#86868b",
      file: `${IPAD}/iPad_Air_M2_Vorne_Space_Gray (1).png`,
      angles: [`${IPAD}/iPad_Air_M2_Hinten_Space_Gray.png`],
    },
    {
      id: "blue",
      name: "Blau",
      hex: "#7ea7d8",
      file: `${IPAD}/iPad_Air_M2_Vorne_Blue.png`,
      angles: [`${IPAD}/iPad_Air_M2_Hinten_Blue.png`],
    },
    {
      id: "purple",
      name: "Violett",
      hex: "#c9a8d4",
      file: `${IPAD}/iPad_Air_M2_Vorne_Purple.png`,
      angles: [`${IPAD}/iPad_Air_M2_Hinten_Purple.png`],
    },
    {
      id: "starlight",
      name: "Polarstern",
      hex: "#f0ece1",
      file: `${IPAD}/iPad_Air_M2_Vorne_Starlight.png`,
      angles: [`${IPAD}/iPad_Air_M2_Hinten_Starlight.png`],
    },
  ],
  "ipad-11-generation": [
    {
      id: "blue",
      name: "Blau",
      hex: "#a7c7e7",
      file: `${IPAD}/iPad_11_Vorne_Blue (1).png`,
      angles: [`${IPAD}/iPad_11_Hinten_Blue.png`],
    },
    {
      id: "pink",
      name: "Pink",
      hex: "#f0c9d9",
      file: `${IPAD}/iPad_11_Vorne_Pink (2).png`,
      angles: [`${IPAD}/iPad_11_Hinten_Pink.png`],
    },
    {
      id: "silver",
      name: "Silber",
      hex: "#e3e4e5",
      file: `${IPAD}/iPad_11_Vorne_Silver.png`,
      angles: [`${IPAD}/iPad_11_Hinten_Silver.png`],
    },
    {
      id: "yellow",
      name: "Gelb",
      hex: "#f5dfa0",
      file: `${IPAD}/iPad_11_Vorne_Yellow (1).png`,
      angles: [`${IPAD}/iPad_11_Hinten_Yellow.png`],
    },
  ],
  "ipad-pro-m5": [
    {
      id: "black",
      name: "Space Schwarz",
      hex: "#3a3a3c",
      file: `${IPAD}/ipad_Pro_M4_M5_Black.png`,
      angles: [`${IPAD}/ipad_Pro_M5_M4_hinten_Black.png`],
    },
    {
      id: "silver",
      name: "Silber",
      hex: "#e3e4e5",
      file: `${IPAD}/Ipad_Pro_M4_M5_Silber .png`,
      angles: [`${IPAD}/iPad_Pro_M5_M4_Hinten_silber.png`],
    },
  ],
  "ipad-pro-m4": [
    {
      id: "black",
      name: "Space Schwarz",
      hex: "#3a3a3c",
      file: `${IPAD}/ipad_Pro_M4_M5_Black.png`,
      angles: [`${IPAD}/ipad_Pro_M5_M4_hinten_Black.png`],
    },
    {
      id: "silver",
      name: "Silber",
      hex: "#e3e4e5",
      file: `${IPAD}/Ipad_Pro_M4_M5_Silber .png`,
      angles: [`${IPAD}/iPad_Pro_M5_M4_Hinten_silber.png`],
    },
  ],
};

export const VARIANT_IMAGE_PLACEHOLDER = "/images/placeholders/variant-missing.svg";

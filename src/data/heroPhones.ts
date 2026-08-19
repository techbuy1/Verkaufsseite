import { assetPath } from "@/lib/assetPath";

export interface HeroPhone {
  id: string;
  brand: "Apple" | "Samsung" | "Google";
  model: string;
  colorName: string;
  colorHex: string;
  slug: string;
  front: string;
}

const APPLE = "images/products/Apple/iPhones ";
const IPHONE_16 = `${APPLE}/iPhone 16 `;
const SAMSUNG_S26_SERIE = "images/products/Samsung /Samsung Galaxy Handy /Samsung Galaxy S26 Serie ";
const SAMSUNG_S26_ULTRA = `${SAMSUNG_S26_SERIE}/Samsung Galaxy S26 Ultra Reihe`;
const GOOGLE = "images/products/Google Pixel ";

/**
 * Smaller, secondary background phones for the hero composition — flat
 * cut-outs, less prominent than the two real-3D hero devices (iPhone 17 Pro
 * and Galaxy A57, rendered via HeroDeviceModel from their actual GLB files).
 * Every path here is a verified real file already used elsewhere in the catalog.
 */
export const HERO_PHONES: HeroPhone[] = [
  {
    id: "galaxy-s26-ultra-silver",
    brand: "Samsung",
    model: "Galaxy S26 Ultra",
    colorName: "Silber",
    colorHex: "#d2d2d7",
    slug: "galaxy-s26-ultra",
    front: assetPath(`${SAMSUNG_S26_ULTRA}/S26_Ultra_silber .png`),
  },
  {
    id: "pixel-10a-berry",
    brand: "Google",
    model: "Pixel 10a",
    colorName: "Berry",
    colorHex: "#8b3a62",
    slug: "google-pixel-10a",
    front: assetPath(`${GOOGLE}/Google Pixel 10a/GooglePixel_10a_Berry .png`),
  },
  {
    id: "iphone-16-teal",
    brand: "Apple",
    model: "iPhone 16",
    colorName: "Teal",
    colorHex: "#4f8777",
    slug: "iphone-16",
    front: assetPath(`${IPHONE_16}/iPhone 16 Normal /iPhone16TealGreen.png`),
  },
];

const APPLE_17 = `${APPLE}/iPhone 17`;
const SAMSUNG_A = "images/products/Samsung /Samsung Galaxy Handy /Samsung Galaxy A Series ";

/** The two hero-featured devices, rendered as real 3D GLB models (see HeroDeviceModel). */
export const HERO_3D_DEVICES = {
  iphone17Pro: {
    slug: "iphone-17-pro",
    model: "iPhone 17 Pro",
    colorName: "Deep Blue",
    colorHex: "#2f3b52",
    modelPath: "/models/iphone-17-pro-deep-blue.glb",
    fallbackImage: assetPath(`${APPLE_17}/iPhone 17 Pro /iPhone17Pro_DeepBlue.png`),
  },
  galaxyA57: {
    slug: "galaxy-a57",
    model: "Galaxy A57",
    colorName: "Awesome Navy",
    colorHex: "#1f2937",
    modelPath: "/models/galaxy-a57.glb",
    fallbackImage: assetPath(`${SAMSUNG_A}/Samsung_Galaxy_A57_AwesomeNavy_.png`),
  },
} as const;

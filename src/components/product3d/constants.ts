/**
 * Mesh/material name matching for recoloring the housing without
 * touching glass, screen or camera lens elements.
 *
 * Important: Samsung S26 Ultra uses materials like "Glass back" for the
 * rear cover — that MUST be recolored. Only "Glass screen" / camera glass
 * stay protected.
 */

export const IPHONE_17_PRO_MODEL_PATH = "/models/iphone-17-pro-silver.glb";
export const GALAXY_S26_ULTRA_MODEL_PATH = "/models/galaxy-s26-ultra.glb";
/** Extracted from `public/images/products/Samsung …/galaxy-a57.zip` (`Galaxy A56GLB.glb`). */
export const GALAXY_A57_MODEL_PATH = "/models/galaxy-a57.glb";
/** Extracted from `public/images/products/Apple/iPad/silver-apple-ipad-13-pro-m4.zip`. Shared 360° model across all iPad/tablet product pages. */
export const IPAD_PRO_13_MODEL_PATH = "/models/ipad-pro-13.glb";

function normalizePartName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/с/g, "c"); // Cyrillic 'с' used in some GLB material names
}

/** Rear glass / frame / stylus / colored buttons — full device color. */
export function isColorableHousingPart(meshName: string, materialName: string): boolean {
  const name = normalizePartName(`${meshName} ${materialName}`);

  if (name.includes("glass back")) return true;
  if (name.includes("frosted glass") || name.includes("frosted")) return true;
  if (name.includes("anodized") || name.includes("aluminum") || name.includes("aluminium")) {
    return true;
  }
  if (name.includes("metal mesh")) return true;
  if (name.includes("glass screen")) return false;
  if (name.includes("glass camera") || name.includes("glass cam")) return false;

  const hints = [
    "frame",
    "body",
    "housing",
    "case",
    "chassis",
    "shell",
    "rahmen",
    "gehaeuse",
    "pens",
    "pen",
    "buttons",
  ];
  return hints.some((hint) => name.includes(hint));
}

/** Display panel — wallpaper tint target (not the front glass cover). */
export function isScreenPart(meshName: string, materialName: string): boolean {
  const name = normalizePartName(`${meshName} ${materialName}`);
  if (name.includes("glass screen")) return false;
  if (name.includes("glass back")) return false;
  return (
    name.includes("screen") ||
    name.includes("display") ||
    name.includes("oled") ||
    name.includes("lcd")
  );
}

/** Cameras, ports, logos — never recolor. */
export function isProtectedPart(meshName: string, materialName: string): boolean {
  const name = normalizePartName(`${meshName} ${materialName}`);
  if (name.includes("glass back")) return false;
  if (isColorableHousingPart(meshName, materialName)) return false;
  if (isScreenPart(meshName, materialName)) return false;

  const hints = [
    "camera",
    "kamera",
    "lens",
    "linse",
    "flash",
    "usb",
    "logo",
    "sim",
    "dark",
    "glass screen",
    "glass camera",
    "glass cam",
  ];
  return hints.some((hint) => name.includes(hint));
}

/** @deprecated Prefer isColorableHousingPart / isProtectedPart */
export const HOUSING_NAME_HINTS = [
  "body",
  "frame",
  "housing",
  "case",
  "chassis",
  "aluminum",
  "aluminium",
  "shell",
  "glass back",
  "rahmen",
  "gehaeuse",
  "gehäuse",
  "pens",
  "buttons",
];

/** @deprecated Prefer isProtectedPart — do NOT list bare "glass" (breaks Glass back). */
export const NON_HOUSING_NAME_HINTS = [
  "glass screen",
  "glass camera",
  "screen",
  "display",
  "lens",
  "linse",
  "camera",
  "kamera",
  "lcd",
  "oled",
];

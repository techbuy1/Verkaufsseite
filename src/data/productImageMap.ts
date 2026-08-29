import { assetPath } from "@/lib/assetPath";
import type { ProductVariant, StorageOption } from "@/types/product";
import { slugifyColorId } from "@/lib/productVariants";
import {
  PRODUCT_IMAGE_REGISTRY,
  VARIANT_IMAGE_PLACEHOLDER,
  type RegistryColorEntry,
} from "./productImageRegistry";

function buildRegistryColorLookup(
  entries: RegistryColorEntry[],
): Map<string, RegistryColorEntry> {
  const map = new Map<string, RegistryColorEntry>();
  for (const entry of entries) {
    map.set(entry.id, entry);
    map.set(slugifyColorId(entry.name), entry);
    map.set(slugifyColorId(entry.id), entry);
  }
  return map;
}

export type { ProductImageMeta } from "./productImageRegistry";
export { PRODUCT_IMAGE_META, VARIANT_IMAGE_PLACEHOLDER } from "./productImageRegistry";

export interface ColorImageDefinition {
  id: string;
  name: string;
  hex: string;
  image: string;
  imageMissing?: boolean;
  /** Weitere echte Ansichten derselben Farbe (z. B. Rückseite) — nur gesetzt, wenn Assets vorhanden sind. */
  angles?: string[];
  /** Wallpaper für 3D-Screen dieser Farbe */
  wallpaper?: string;
  /** Farbgenaues 3D-Modell (ohne Runtime-Tint) */
  model?: string;
}

/** Nur für Marketing-Hero, nicht für Produktvarianten — siehe heroImageAssets.ts */
export { BRAND_HERO_IMAGES } from "./heroImageAssets";

export const PRODUCT_COLOR_IMAGES: Record<string, ColorImageDefinition[]> = Object.fromEntries(
  Object.entries(PRODUCT_IMAGE_REGISTRY).map(([slug, colors]) => [
    slug,
    colors.map(({ file, wallpaper, model, angles, ...color }) => ({
      ...color,
      image: assetPath(file),
      angles: angles?.map((angle) => assetPath(angle)),
      wallpaper: wallpaper ? assetPath(wallpaper) : undefined,
      model: model ? assetPath(model) : undefined,
      imageMissing: false,
    })),
  ]),
);

function registryEntryToColor(entry: RegistryColorEntry): ColorImageDefinition {
  return {
    id: entry.id,
    name: entry.name,
    hex: entry.hex,
    image: assetPath(entry.file),
    imageMissing: false,
    angles: entry.angles?.map((angle) => assetPath(angle)),
    wallpaper: entry.wallpaper ? assetPath(entry.wallpaper) : undefined,
    model: entry.model ? assetPath(entry.model) : undefined,
  };
}

export function getColorDefinitionsForSlug(slug: string): ColorImageDefinition[] | undefined {
  const entries = PRODUCT_IMAGE_REGISTRY[slug];
  if (!entries?.length) return undefined;
  return entries.map(registryEntryToColor);
}

export function hasVerifiedProductImages(slug: string): boolean {
  return Boolean(PRODUCT_IMAGE_REGISTRY[slug]?.length);
}

export function resolveColorDefinitionsForProduct(
  slug: string,
  catalogColors: { id: string; name: string; hex: string }[],
): ColorImageDefinition[] {
  const registryEntries = PRODUCT_IMAGE_REGISTRY[slug] ?? [];
  const lookup = buildRegistryColorLookup(registryEntries);

  return catalogColors.map((color) => {
    const id = color.id || slugifyColorId(color.name);
    const registryMatch =
      lookup.get(id) ??
      lookup.get(slugifyColorId(color.name)) ??
      lookup.get(slugifyColorId(color.name.replace(/^Awesome\s+/i, "")));

    if (registryMatch) {
      return {
        id,
        name: color.name,
        hex: color.hex,
        image: assetPath(registryMatch.file),
        imageMissing: false,
        angles: registryMatch.angles?.map((angle) => assetPath(angle)),
        wallpaper: registryMatch.wallpaper
          ? assetPath(registryMatch.wallpaper)
          : undefined,
        model: registryMatch.model ? assetPath(registryMatch.model) : undefined,
      };
    }

    return {
      id,
      name: color.name,
      hex: color.hex,
      image: VARIANT_IMAGE_PLACEHOLDER,
      imageMissing: true,
    };
  });
}

/** @deprecated Verwende resolveColorDefinitionsForProduct */
export function resolveColorsForProduct(
  slug: string,
  _brand: "Apple" | "Samsung" | "Google",
  fallbackColors: { id: string; name: string; hex: string }[],
): ColorImageDefinition[] {
  return resolveColorDefinitionsForProduct(slug, fallbackColors);
}

export function buildVariantsFromColors(
  colors: ColorImageDefinition[],
  storageOptions: StorageOption[],
): ProductVariant[] {
  return colors.map((color) => ({
    id: color.id || slugifyColorId(color.name),
    colorName: color.name,
    colorCode: color.hex,
    image: color.image,
    imageMissing: color.imageMissing ?? false,
    angles: color.angles,
    storageOptions: storageOptions.map((option) => ({ ...option })),
  }));
}

export function getVariantImageForSlug(
  slug: string,
  colorId: string,
  catalogColors: { id: string; name: string; hex: string }[],
): ColorImageDefinition {
  const colors = resolveColorDefinitionsForProduct(slug, catalogColors);
  return colors.find((color) => color.id === colorId) ?? colors[0];
}

export { PRODUCT_IMAGE_REGISTRY };

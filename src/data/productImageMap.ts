import { assetPath } from "@/lib/assetPath";
import type { ProductVariant, StorageOption } from "@/types/product";
import { slugifyColorId } from "@/lib/productVariants";
import {
  PRODUCT_IMAGE_REGISTRY,
  VARIANT_IMAGE_PLACEHOLDER,
  type RegistryColorEntry,
} from "./productImageRegistry";
import { ACCESSORY_IMAGE_SETS } from "./accessoryImageAssets";

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

/**
 * Zentrale Zuordnung Vorderseite → Backcover für den Hover-Wechsel auf
 * Smartphone-Produktkarten. Front und Back stammen immer aus demselben
 * Farb-Eintrag der `PRODUCT_IMAGE_REGISTRY` – die Farbe passt also immer.
 *
 * Zusätzlich hinterlegt: `backFit` – ein reiner Darstellungs-Skalierungs-
 * faktor je Modell, weil einige nachgelieferte Rückseitenbilder das Gerät
 * kleiner/größer im Canvas zeigen als das Frontbild. Damit sitzt das Gerät
 * beim Crossfade optisch gleich groß, ohne die Assets zu verändern.
 */
const CARD_BACK_BY_FRONT = new Map<string, { back: string; slug: string }>();
const CARD_BACK_BY_SLUG_COLOR = new Map<string, string>();

for (const [slug, entries] of Object.entries(PRODUCT_IMAGE_REGISTRY)) {
  for (const entry of entries) {
    const back = entry.angles?.find((angle) => angle && angle !== entry.file);
    if (!back) continue;
    const backPath = assetPath(back);
    CARD_BACK_BY_FRONT.set(assetPath(entry.file), { back: backPath, slug });
    for (const key of [entry.id, slugifyColorId(entry.id), slugifyColorId(entry.name)]) {
      if (!CARD_BACK_BY_SLUG_COLOR.has(`${slug}::${key}`)) {
        CARD_BACK_BY_SLUG_COLOR.set(`${slug}::${key}`, backPath);
      }
    }
  }
}

/**
 * Modellweise optische Skalierung des Backcover-Bildes, damit das Gerät
 * beim Hover gleich groß wirkt wie auf der Vorderseite. Aus einer Messung
 * der Geräte-Bounding-Box in Front- vs. Backbild abgeleitet. 1 = keine
 * Korrektur. Nur Modelle mit spürbarer Abweichung sind gelistet.
 */
/**
 * Für einzelne Modelle/Farben gibt es ein besseres, karten-taugliches
 * Rückseitenbild als das in `angles` (welches die PDP-Galerie nutzt).
 * Hier `slug::colorId` → Pfad. Wird beim Hover bevorzugt.
 */
const IPHONE_17_DIR = "images/products/Apple/iPhones /iPhone 17";
const CARD_BACK_OVERRIDE: Record<string, string> = {
  "iphone-17-pro::cosmic-orange": `${IPHONE_17_DIR}/iPhone 17 Pro /iPhone_17_Pro_Cosmic_Orange_Rueckseite.png`,
  "iphone-17-pro::deep-blue": `${IPHONE_17_DIR}/iPhone 17 Pro /iPhone_17_Pro_Deep_Blue_Rueckseite.png`,
  "iphone-17-pro::silver": `${IPHONE_17_DIR}/iPhone 17 Pro /iPhone_17_Pro_Silver_Rueckseite.png`,
  "iphone-17-pro-max::cosmic-orange": `${IPHONE_17_DIR}/iPhone 17 Pro Max /iPhone_17_Pro_Cosmic_Orange_Rueckseite Kopie.png`,
  "iphone-17-pro-max::deep-blue": `${IPHONE_17_DIR}/iPhone 17 Pro Max /iPhone_17_Pro_Deep_Blue_Rueckseite Kopie.png`,
  "iphone-17-pro-max::silver": `${IPHONE_17_DIR}/iPhone 17 Pro Max /iPhone_17_Pro_Silver_Rueckseite Kopie.png`,
};
const CARD_BACK_OVERRIDE_RESOLVED: Record<string, string> = Object.fromEntries(
  Object.entries(CARD_BACK_OVERRIDE).map(([k, v]) => [k, assetPath(v)]),
);

/**
 * Modelle, deren Rückseitenbilder (noch) NICHT karten-tauglich sind:
 * farbig getönter / verlaufender Hintergrund + anderes Canvas als die
 * Frontbilder → auf der weißen Karte gäbe es eine sichtbare Kante und
 * einen Größensprung beim Hover. Der Flip bleibt hier aus (Frontbild
 * bleibt); die PDP-Galerie nutzt die Bilder weiter (dort werden sie über
 * die eingefärbte Fläche + `multiply` sauber eingebettet).
 * → sobald es Rückseiten auf weißem Grund im Frontbild-Format gibt, hier raus.
 *
 * Aktuell leer: die iPhone-17-Basisreihe hat jetzt freigestellte
 * Rückseiten (`*_Rueckseite_Freigestellt.png`) im Frontbild-Format.
 */
const CARD_FLIP_DENY = new Set<string>([]);

const CARD_BACK_FIT: Record<string, number> = {
  "iphone-17-pro": 0.92,
  "iphone-17-pro-max": 0.92,
  "iphone-16e": 1.5,
  "iphone-16-pro": 1.26,
  "iphone-16-pro-max": 1.26,
  "iphone-17-air": 1.12,
  "iphone-14": 0.95,
  "iphone-14-plus": 0.95,
  "iphone-14-pro": 0.96,
  "iphone-14-pro-max": 0.96,
  "galaxy-s26": 0.94,
  "galaxy-s26-plus": 0.94,
  "galaxy-s25": 0.95,
  "galaxy-s25-plus": 0.95,
  "galaxy-s24-ultra": 1.09,
  "galaxy-a37": 0.92,
};

/**
 * Zweitansicht für den Hover-Flip bei Zubehör. Nur Sets, deren Front- und
 * Zweitansicht **dasselbe Format und denselben Hintergrund** haben – sonst
 * gäbe es beim Crossfade einen Sprung oder eine sichtbare Kante.
 *   panzerfolieKlar     1254² weiß / 1254² weiß  → Schrägansicht
 *   huelleTransparent   1024² weiß / 1024² weiß  → Rückseite
 *   silikonhuelleWeiss  1254² weiß / 1254² weiß  → Rückseite
 * (Matt-/Privacy-Folie: Front freigestellt quadratisch vs. Zweitansicht
 *  Querformat weiß → nicht flip-tauglich, Frontbild bleibt.)
 */
const FLIP_SAFE_ACCESSORY_SETS = [
  "panzerfolieKlar",
  "huelleTransparent",
  "silikonhuelleWeiss",
] as const;

const ACCESSORY_BACK_BY_FRONT: Record<string, string> = {};
for (const name of FLIP_SAFE_ACCESSORY_SETS) {
  const set = ACCESSORY_IMAGE_SETS[name];
  if (set.gallery.length > 1 && set.gallery[1] !== set.gallery[0]) {
    ACCESSORY_BACK_BY_FRONT[set.primary] = set.gallery[1];
  }
}

const FLIP_SAFE_PRODUCT_IDS: Record<string, keyof typeof ACCESSORY_IMAGE_SETS> = {
  "acc-screen-protector-clear": "panzerfolieKlar",
  "catalog-screen-protector": "panzerfolieKlar",
  "acc-case-clear": "huelleTransparent",
  "catalog-cases": "huelleTransparent",
  "acc-case-silicone-apple": "silikonhuelleWeiss",
};
const ACCESSORY_BACK_BY_ID: Record<string, string> = {};
for (const [id, setName] of Object.entries(FLIP_SAFE_PRODUCT_IDS)) {
  const set = ACCESSORY_IMAGE_SETS[setName];
  if (set.gallery[1] && set.gallery[1] !== set.gallery[0]) {
    ACCESSORY_BACK_BY_ID[id] = set.gallery[1];
  }
}

export interface CardBackImage {
  /** Backcover-Bildpfad. */
  src: string;
  /** Optische Skalierung des Backbildes (1 = unverändert). */
  fit: number;
}

/**
 * Backcover zu einer Produktkarte. Zuerst exakt über den Front-Bildpfad
 * (Farbe garantiert), sonst über Slug + konkrete Farbe. Lässt sich die
 * Farbe nicht sicher bestimmen, gibt es `undefined` ⇒ Frontbild bleibt
 * (nie eine geratene Farbkombination).
 */
export function getCardBackImage(
  input: string | undefined | null,
  opts?: { slug?: string; colorId?: string; colorName?: string; productId?: string },
): CardBackImage | undefined {
  // Zubehör: Zweitansicht über Produkt-ID oder Front-Bildpfad
  if (opts?.productId && ACCESSORY_BACK_BY_ID[opts.productId]) {
    return { src: ACCESSORY_BACK_BY_ID[opts.productId], fit: 1 };
  }
  if (input && ACCESSORY_BACK_BY_FRONT[input]) {
    return { src: ACCESSORY_BACK_BY_FRONT[input], fit: 1 };
  }

  const slug = opts?.slug;
  if (slug && CARD_FLIP_DENY.has(slug)) return undefined;
  const colorKeys = slug
    ? ([
        opts?.colorId,
        opts?.colorId ? slugifyColorId(opts.colorId) : undefined,
        opts?.colorName ? slugifyColorId(opts.colorName) : undefined,
      ].filter(Boolean) as string[])
    : [];

  // 1) karten-spezifisches Override (bestes Bild für die Karte)
  if (slug) {
    for (const key of colorKeys) {
      const ov = CARD_BACK_OVERRIDE_RESOLVED[`${slug}::${key}`];
      if (ov) return { src: ov, fit: CARD_BACK_FIT[slug] ?? 1 };
    }
  }

  // 2) exakt über den Front-Bildpfad (Farbe garantiert)
  const byFront = input ? CARD_BACK_BY_FRONT.get(input) : undefined;
  if (byFront) {
    return { src: byFront.back, fit: CARD_BACK_FIT[byFront.slug] ?? 1 };
  }

  // 3) über Slug + konkrete Farbe (Registry-`angles`)
  for (const key of colorKeys) {
    const hit = CARD_BACK_BY_SLUG_COLOR.get(`${slug}::${key}`);
    if (hit) return { src: hit, fit: CARD_BACK_FIT[slug!] ?? 1 };
  }
  return undefined;
}

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

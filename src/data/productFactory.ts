import type { CatalogCategoryId } from "@/data/catalogCategories";
import type { AdminProductSpecs, PremiumProduct } from "@/types/product";
import { assetPath } from "@/lib/assetPath";
import { syncProductVariants } from "@/lib/productVariants";
import {
  BRAND_HERO_IMAGES,
  buildVariantsFromColors,
  getColorDefinitionsForSlug,
  resolveColorDefinitionsForProduct,
} from "./productImageMap";
import { VARIANT_IMAGE_PLACEHOLDER } from "./productImageRegistry";

export interface ProductDefinition {
  id: string;
  slug: string;
  brand: string;
  model: string;
  generation: string;
  catalogCategory: CatalogCategoryId;
  category: string;
  tagline: string;
  description: string;
  basePrice: number;
  badge?: "Neu" | "Sale";
  storages: string[];
  colors: { id: string; name: string; hex: string }[];
  image: string;
  connectivity?: boolean;
  recommendedAccessories?: string[];
  similarProducts?: string[];
  keywords?: string[];
}

const STORAGE_DELTAS: Record<string, number> = {
  "128 GB": 0,
  "256 GB": 100,
  "512 GB": 250,
  "1 TB": 450,
  "2 TB": 650,
};

const CELLULAR_DELTA = 150;

const APPLE_PHONE_IMAGE = assetPath(
  "images/products/Apple/iPhones /iPhone 17/iPhone 17 Pro /apple_iphone_17_pro_1_1_1_1.png",
);
const APPLE_PHONE_HERO = BRAND_HERO_IMAGES.apple;
const SAMSUNG_IMAGE = BRAND_HERO_IMAGES.samsung;
const GOOGLE_IMAGE = BRAND_HERO_IMAGES.google;

export const APPLE_IPHONE_COLORS = [
  { id: "black", name: "Schwarz", hex: "#1d1d1f" },
  { id: "white", name: "Weiß", hex: "#f5f5f7" },
  { id: "blue", name: "Blau", hex: "#0071e3" },
  { id: "natural", name: "Natural Titanium", hex: "#bfa48a" },
];

export const APPLE_NEW_COLORS = [
  { id: "cosmic-orange", name: "Cosmic Orange", hex: "#e8622a" },
  { id: "deep-blue", name: "Deep Blue", hex: "#2f3b52" },
  { id: "silver", name: "Silver", hex: "#e3e4e5" },
];

export const SAMSUNG_COLORS = [
  { id: "black", name: "Schwarz", hex: "#1d1d1f" },
  { id: "silver", name: "Silber", hex: "#d2d2d7" },
  { id: "blue", name: "Blau", hex: "#0071e3" },
  { id: "violet", name: "Violett", hex: "#7d7da8" },
  { id: "green", name: "Grün", hex: "#4f8777" },
];

export const GOOGLE_COLORS = [
  { id: "obsidian", name: "Obsidian", hex: "#1d1d1f" },
  { id: "porcelain", name: "Porcelain", hex: "#f5f5f7" },
  { id: "blue", name: "Blue", hex: "#0071e3" },
  { id: "green", name: "Green", hex: "#4f8777" },
  { id: "rose", name: "Rose", hex: "#f2b8c6" },
];

export const APPLE_PHONE_ACCESSORIES = [
  "acc-screen-protector-clear",
  "acc-screen-protector-matte",
  "acc-screen-protector-privacy",
  "acc-case-clear",
  "acc-case-silicone-apple",
  "acc-cable-usbc",
  "offer-airpods",
  "catalog-apple-watch",
];

export const APPLE_IPAD_ACCESSORIES = [
  "acc-screen-protector-clear",
  "acc-screen-protector-matte",
  "acc-screen-protector-privacy",
  "acc-case-clear",
  "acc-case-silicone-apple",
  "acc-cable-usbc",
  "catalog-adapters",
];

/** Echte fotografierte Farben — nur für Modelle mit vorhandenen Assets in productImageRegistry.ts. */
export const IPAD_AIR_M3_COLORS = [
  { id: "blue", name: "Blau", hex: "#7ea7d8" },
  { id: "gold", name: "Gold", hex: "#e8dcc4" },
  { id: "gray", name: "Space Grau", hex: "#86868b" },
  { id: "violet", name: "Violett", hex: "#8b7ab8" },
];

export const IPAD_PRO_COLORS = [
  { id: "black", name: "Space Schwarz", hex: "#3a3a3c" },
  { id: "silver", name: "Silber", hex: "#e3e4e5" },
];

export const IPAD_AIR_M2_COLORS = [
  { id: "space-gray", name: "Space Grau", hex: "#86868b" },
  { id: "blue", name: "Blau", hex: "#7ea7d8" },
  { id: "purple", name: "Violett", hex: "#c9a8d4" },
  { id: "starlight", name: "Polarstern", hex: "#f0ece1" },
];

export const IPAD_11_COLORS = [
  { id: "blue", name: "Blau", hex: "#a7c7e7" },
  { id: "pink", name: "Pink", hex: "#f0c9d9" },
  { id: "silver", name: "Silber", hex: "#e3e4e5" },
  { id: "yellow", name: "Gelb", hex: "#f5dfa0" },
];

export const SAMSUNG_S_ACCESSORIES = [
  "acc-screen-protector-clear",
  "acc-screen-protector-matte",
  "acc-screen-protector-privacy",
  "acc-case-clear",
  "acc-cable-usbc",
  "catalog-galaxy-buds",
  "catalog-galaxy-watch",
];

export const SAMSUNG_A_ACCESSORIES = [
  "acc-screen-protector-clear",
  "acc-screen-protector-matte",
  "acc-screen-protector-privacy",
  "acc-case-clear",
  "acc-cable-usbc",
];

export const GOOGLE_ACCESSORIES = [
  "acc-screen-protector-clear",
  "acc-screen-protector-matte",
  "acc-screen-protector-privacy",
  "acc-case-clear",
  "acc-cable-usbc",
  "catalog-pixel-watch",
];

function defaultSpecs(def: ProductDefinition): AdminProductSpecs {
  const isMacBook = def.catalogCategory === "macbooks";
  const isLaptop = def.catalogCategory === "laptops";

  if (isMacBook || isLaptop) {
    return {
      display: isMacBook ? "Liquid Retina Display" : "IPS Full HD Display",
      camera: isMacBook ? "1080p FaceTime HD Kamera" : "1080p HD Webcam",
      chip: isMacBook
        ? def.generation.startsWith("2025")
          ? "Apple M5"
          : "Apple M4"
        : "Intel Core Ultra 9",
      battery: "Ganztägige Akkulaufzeit",
      storage: def.storages.join(" · "),
      protection: "Aluminium Unibody",
      operatingSystem: isMacBook ? "macOS" : "Windows 11",
    };
  }

  return {
    display: def.catalogCategory === "tablets" ? "Liquid Retina Display" : "OLED Display",
    camera:
      def.catalogCategory === "tablets"
        ? "12 MP Wide"
        : def.brand === "Google"
          ? "50 MP Hauptkamera"
          : "48 MP Kamerasystem",
    chip:
      def.brand === "Apple"
        ? def.generation.startsWith("2025")
          ? "Apple A19"
          : "Apple A18"
        : def.brand === "Samsung"
          ? "Snapdragon 8 Elite"
          : "Google Tensor G5",
    battery: "Ganztägige Akkulaufzeit",
    storage: def.storages.join(" · "),
    protection: "Premium Schutzglas",
    operatingSystem:
      def.brand === "Apple"
        ? def.catalogCategory === "tablets"
          ? "iPadOS"
          : "iOS"
        : def.brand === "Samsung"
          ? "Android"
          : "Android",
  };
}

function buildStorageOptions(def: ProductDefinition) {
  const options: PremiumProduct["storageOptions"] = [];

  for (const storage of def.storages) {
    const base = def.basePrice + (STORAGE_DELTAS[storage] ?? 0);
    if (def.connectivity) {
      options.push({ storage: `${storage} · WLAN`, price: base });
      options.push({
        storage: `${storage} · WLAN + Cellular`,
        price: base + CELLULAR_DELTA,
      });
    } else {
      options.push({ storage, price: base });
    }
  }

  return options;
}

export function buildProductFromDefinition(def: ProductDefinition): PremiumProduct {
  const adminSpecs = defaultSpecs(def);
  const storageOptions = buildStorageOptions(def);
  const colorDefs = resolveColorDefinitionsForProduct(
    def.slug,
    def.colors.map((color) => ({ id: color.id, name: color.name, hex: color.hex })),
  );
  const variants = buildVariantsFromColors(colorDefs, storageOptions);
  const mainImage = colorDefs[0]?.image ?? def.image;

  const shortDescription = def.tagline;
  const longDescription = `<p>${def.description}</p>`;

  return syncProductVariants({
    id: def.id,
    slug: def.slug,
    brand: def.brand,
    name: def.model,
    model: def.model,
    generation: def.generation,
    category: def.category,
    catalogCategory: def.catalogCategory,
    tagline: def.tagline,
    shortDescription,
    longDescription,
    description: def.description,
    mainImage,
    galleryImages: [],
    images: [],
    storageOptions: [],
    variants,
    specifications: {
      display: [{ label: "Display", value: adminSpecs.display }],
      camera: [{ label: "Kamera", value: adminSpecs.camera }],
      performance: [{ label: "Chip", value: adminSpecs.chip }],
      battery: [{ label: "Akku", value: adminSpecs.battery }],
      connectivity: [{ label: "Speicher", value: adminSpecs.storage }],
    },
    adminSpecs,
    highlights: [adminSpecs.chip, adminSpecs.camera, adminSpecs.display],
    deliveryContent: ["Gerät", "USB-C Kabel", "Anleitung"],
    features: [adminSpecs.chip, adminSpecs.camera],
    keywords: def.keywords ?? [
      def.brand.toLowerCase(),
      def.model.toLowerCase(),
      def.generation.toLowerCase(),
    ],
    recommendedAccessories: def.recommendedAccessories ?? [],
    similarProducts: def.similarProducts ?? [],
    bundleOffers: [],
    badge: def.badge,
    stock: 0,
    operatingSystem: adminSpecs.operatingSystem,
    boxContents: ["Gerät", "USB-C Kabel", "Anleitung"],
  });
}

export function iphoneDef(
  model: string,
  generation: string,
  basePrice: number,
  options: Partial<ProductDefinition> = {},
): ProductDefinition {
  const slug = model.toLowerCase().replace(/\s+/g, "-").replace(/\+/g, "plus");
  const mappedColors = getColorDefinitionsForSlug(options.slug ?? slug);
  const isPro = /pro/i.test(model);
  const isBase17 = model === "iPhone 17";
  const defaultStorages = isPro
    ? ["256 GB", "512 GB", "1 TB"]
    : isBase17
      ? ["128 GB", "256 GB", "512 GB"]
      : ["128 GB", "256 GB", "512 GB", "1 TB"];

  return {
    id: `apple-${slug}`,
    slug,
    brand: "Apple",
    model,
    generation,
    catalogCategory: "smartphones",
    category: "Smartphones",
    tagline: `${model}. Premium Performance.`,
    description: `${model} mit modernem Design, starker Kamera und leistungsstarker Apple Hardware.`,
    basePrice,
    storages: defaultStorages,
    colors:
      mappedColors?.map((color) => ({
        id: color.id,
        name: color.name,
        hex: color.hex,
      })) ??
      (generation.startsWith("2025") ? APPLE_NEW_COLORS : APPLE_IPHONE_COLORS),
    image: mappedColors?.[0]?.image ?? (generation.startsWith("2025") ? APPLE_PHONE_IMAGE : APPLE_PHONE_HERO),
    recommendedAccessories: APPLE_PHONE_ACCESSORIES,
    keywords: ["iphone", "apple", model.toLowerCase(), generation],
    ...options,
  };
}

export function ipadDef(
  model: string,
  generation: string,
  basePrice: number,
  options: Partial<ProductDefinition> = {},
): ProductDefinition {
  const slug = model.toLowerCase().replace(/\s+/g, "-").replace(/\+/g, "plus");
  return {
    id: `apple-${slug}`,
    slug,
    brand: "Apple",
    model,
    generation,
    catalogCategory: "tablets",
    category: "Tablets",
    tagline: `${model}. Mehr Möglichkeiten.`,
    description: `${model} mit brillantem Display, leistungsstarkem Chip und ganztägiger Akkulaufzeit.`,
    basePrice,
    storages: ["128 GB", "256 GB", "512 GB", "1 TB", "2 TB"],
    colors: [
      { id: "space-gray", name: "Space Grau", hex: "#86868b" },
      { id: "silver", name: "Silber", hex: "#e3e4e5" },
    ],
    image: VARIANT_IMAGE_PLACEHOLDER,
    connectivity: true,
    recommendedAccessories: APPLE_IPAD_ACCESSORIES,
    keywords: ["ipad", "apple", model.toLowerCase(), generation],
    ...options,
  };
}

export const LAPTOP_ACCESSORIES = [
  "acc-cable-usbc",
  "catalog-chargers",
  "catalog-adapters",
  "catalog-powerbanks",
];

export const MACBOOK_COLORS = [
  { id: "space-gray", name: "Space Grau", hex: "#86868b" },
  { id: "silver", name: "Silber", hex: "#e3e4e5" },
  { id: "midnight", name: "Mitternacht", hex: "#1d1d1f" },
];

export const LAPTOP_COLORS = [
  { id: "silver", name: "Silber", hex: "#d2d2d7" },
  { id: "graphite", name: "Graphit", hex: "#414141" },
];

interface LaptopDefOptions extends Partial<ProductDefinition> {
  chip?: string;
  display?: string;
}

/**
 * MacBooks & sonstige Laptops — es liegt keine eigene Produktfotografie vor,
 * daher wie bei ipadDef bewusst der illustrierte Platzhalter (imageType
 * "macbook" löst in den Karten/der Galerie die passende Illustration aus).
 */
export function laptopDef(
  brand: string,
  model: string,
  generation: string,
  basePrice: number,
  options: LaptopDefOptions = {},
): ProductDefinition {
  const { chip, display, ...rest } = options;
  const slug = model.toLowerCase().replace(/\s+/g, "-").replace(/\+/g, "plus");
  const isMacBook = brand === "Apple";

  return {
    id: `${brand.toLowerCase()}-${slug}`,
    slug,
    brand,
    model,
    generation,
    catalogCategory: isMacBook ? "macbooks" : "laptops",
    category: isMacBook ? "MacBooks" : "Laptops",
    tagline: `${model}. Leistung, die mit dir geht.`,
    description: `${model} mit ${chip ?? "leistungsstarkem Prozessor"}, ${display ?? "brillantem Display"} und ganztägiger Akkulaufzeit.`,
    basePrice,
    storages: ["256 GB", "512 GB", "1 TB"],
    colors: isMacBook ? MACBOOK_COLORS : LAPTOP_COLORS,
    image: VARIANT_IMAGE_PLACEHOLDER,
    recommendedAccessories: LAPTOP_ACCESSORIES,
    keywords: [
      isMacBook ? "macbook" : "laptop",
      brand.toLowerCase(),
      model.toLowerCase(),
      generation,
    ],
    ...rest,
  };
}

export function samsungDef(
  model: string,
  generation: string,
  basePrice: number,
  options: Partial<ProductDefinition> = {},
): ProductDefinition {
  const slug = model.toLowerCase().replace(/\s+/g, "-").replace(/\+/g, "plus");
  const isA = model.includes("Galaxy A");
  return {
    id: `samsung-${slug}`,
    slug,
    brand: "Samsung",
    model,
    generation,
    catalogCategory: "smartphones",
    category: "Smartphones",
    tagline: `${model}. Galaxy Performance.`,
    description: `${model} mit starker Kamera, großem Display und Samsung Galaxy Features.`,
    basePrice,
    storages: isA ? ["128 GB", "256 GB"] : ["128 GB", "256 GB", "512 GB"],
    colors: SAMSUNG_COLORS,
    image: SAMSUNG_IMAGE,
    recommendedAccessories: isA ? SAMSUNG_A_ACCESSORIES : SAMSUNG_S_ACCESSORIES,
    keywords: ["samsung", "galaxy", model.toLowerCase(), generation],
    ...options,
  };
}

export function pixelDef(
  model: string,
  generation: string,
  basePrice: number,
  options: Partial<ProductDefinition> = {},
): ProductDefinition {
  const slug = model.toLowerCase().replace(/\s+/g, "-").replace(/\+/g, "plus");
  const resolvedSlug = options.slug ?? slug;
  const mappedColors = getColorDefinitionsForSlug(resolvedSlug);
  const isPro = /pro/i.test(model);
  const storages = model.includes("10a") ? ["128 GB", "256 GB"] : isPro ? ["256 GB", "512 GB", "1 TB"] : ["128 GB", "256 GB", "512 GB"];

  return {
    id: `google-${slug}`,
    slug,
    brand: "Google",
    model,
    generation,
    catalogCategory: "smartphones",
    category: "Smartphones",
    tagline: `${model}. Pure Android.`,
    description: `${model} mit Google Tensor, smarter Kamera und langem Update-Support.`,
    basePrice,
    storages,
    colors:
      mappedColors?.map((color) => ({
        id: color.id,
        name: color.name,
        hex: color.hex,
      })) ?? GOOGLE_COLORS,
    image: mappedColors?.[0]?.image ?? GOOGLE_IMAGE,
    recommendedAccessories: GOOGLE_ACCESSORIES,
    keywords: ["google", "pixel", model.toLowerCase(), generation],
    ...options,
  };
}

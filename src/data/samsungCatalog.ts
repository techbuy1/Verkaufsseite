import { syncProductVariants } from "@/lib/productVariants";
import {
  buildVariantsFromColors,
  resolveColorDefinitionsForProduct,
} from "@/data/productImageMap";
import type { PremiumProduct, StorageOption } from "@/types/product";
import { slugifyColorId } from "@/lib/productVariants";

type ColorDef = { id?: string; name: string; hex: string; image?: string };
type StorageDef = { storage: string; price: number };

interface SamsungModelSeed {
  id: string;
  slug: string;
  model: string;
  generation: string;
  tagline: string;
  description: string;
  badge?: "Neu" | "Sale";
  stock?: number;
  colors: ColorDef[];
  storages: StorageDef[];
}

function buildStoragesForAllColors(storages: StorageDef[]): StorageOption[] {
  return storages.map((entry) => ({ storage: entry.storage, price: entry.price }));
}

function buildVariants(seed: SamsungModelSeed): ReturnType<typeof buildVariantsFromColors> {
  const storageOptions = buildStoragesForAllColors(seed.storages);
  const catalogColors = seed.colors.map((color) => ({
    id: color.id ?? slugifyColorId(color.name),
    name: color.name,
    hex: color.hex,
  }));
  const colorDefs = resolveColorDefinitionsForProduct(seed.slug, catalogColors);
  return buildVariantsFromColors(colorDefs, storageOptions);
}

function buildSamsungProduct(seed: SamsungModelSeed): PremiumProduct {
  const variants = buildVariants(seed);
  const synced = syncProductVariants({
    id: seed.id,
    slug: seed.slug,
    brand: "Samsung",
    name: seed.model,
    model: seed.model,
    generation: seed.generation,
    category: "Smartphones",
    catalogCategory: "smartphones",
    tagline: seed.tagline,
    shortDescription: seed.tagline,
    longDescription: `<p>${seed.description}</p>`,
    description: seed.description,
    variants,
    images: [],
    storageOptions: [],
    galleryImages: [],
    specifications: {
      display: [{ label: "Display", value: "Dynamic AMOLED 2X" }],
      camera: [{ label: "Kamera", value: "Pro-Kamerasystem" }],
      performance: [{ label: "Chip", value: "Snapdragon 8 Elite for Galaxy" }],
      battery: [{ label: "Akku", value: "Intelligentes 5000 mAh System" }],
      connectivity: [{ label: "5G", value: "Ja" }],
    },
    adminSpecs: {
      display: "Dynamic AMOLED 2X",
      camera: "50 MP Pro-Kamera",
      chip: "Snapdragon 8 Elite for Galaxy",
      battery: "5000 mAh",
      storage: seed.storages.map((s) => s.storage).join(" · "),
      protection: "Gorilla Glass Armor",
      operatingSystem: "Android",
    },
    highlights: ["Galaxy AI", "Pro-Kamera", "120 Hz Display"],
    deliveryContent: ["Gerät", "USB-C Kabel", "SIM-Werkzeug", "Kurzanleitung"],
    features: ["Galaxy AI", "5G", "IP68"],
    keywords: ["samsung", "galaxy", seed.model.toLowerCase(), seed.generation.toLowerCase()],
    recommendedAccessories: [
      "acc-screen-protector-clear",
      "acc-screen-protector-matte",
      "acc-screen-protector-privacy",
      "acc-case-clear",
      "acc-cable-usbc",
      "catalog-galaxy-buds",
      "catalog-galaxy-watch",
    ],
    similarProducts: [],
    bundleOffers: [],
    badge: seed.badge,
    stock: seed.stock ?? 0,
    operatingSystem: "Android",
    boxContents: ["Gerät", "USB-C Kabel", "SIM-Werkzeug", "Kurzanleitung"],
  });

  return synced;
}

const S26_ULTRA_COLORS: ColorDef[] = [
  { name: "Sky Blue", hex: "#7eb6d7" },
  { name: "Pink", hex: "#f4b4c4" },
  { name: "Silber", hex: "#d2d2d7" },
  { name: "Violett", hex: "#8b7ab8" },
  { name: "Weiß", hex: "#f5f5f7" },
  { name: "Schwarz", hex: "#1d1d1f" },
];

const samsungSeeds: SamsungModelSeed[] = [
  {
    id: "offer-samsung",
    slug: "galaxy-s26-ultra",
    model: "Galaxy S26 Ultra",
    generation: "S26",
    tagline: "Ultra Leistung. Ultra smart.",
    description:
      "Das Galaxy S26 Ultra vereint Galaxy AI, Pro-Kamera und maximale Performance in einem Premium-Gehäuse.",
    badge: "Neu",
    stock: 0,
    colors: S26_ULTRA_COLORS,
    storages: [
      { storage: "256 GB", price: 1299 },
      { storage: "512 GB", price: 1449 },
      { storage: "1 TB", price: 1649 },
    ],
  },
  {
    id: "samsung-galaxy-s26-plus",
    slug: "galaxy-s26-plus",
    model: "Galaxy S26+",
    generation: "S26",
    tagline: "Mehr Display. Mehr Power.",
    description: "Galaxy S26+ mit großem Display, starker Kamera und Galaxy AI.",
    badge: "Neu",
    colors: [
      { id: "navy", name: "Navy", hex: "#1f2937" },
      { id: "icyblue", name: "Icyblue", hex: "#9ec5e8" },
      { id: "mint", name: "Mint", hex: "#a8dcc8" },
      { id: "silver-shadow", name: "Silver Shadow", hex: "#c5c7ce" },
      { id: "blueblack", name: "Blueblack", hex: "#1a2744" },
      { id: "coralred", name: "Coralred", hex: "#e87070" },
      { id: "pinkgold", name: "Pinkgold", hex: "#d4a59a" },
    ],
    storages: [
      { storage: "256 GB", price: 1149 },
      { storage: "512 GB", price: 1299 },
    ],
  },
  {
    id: "samsung-galaxy-s26",
    slug: "galaxy-s26",
    model: "Galaxy S26",
    generation: "S26",
    tagline: "Galaxy Performance für jeden Tag.",
    description: "Kompaktes Flaggschiff mit Galaxy AI und Premium-Kamera.",
    badge: "Neu",
    colors: [
      { id: "navy", name: "Navy", hex: "#1f2937" },
      { id: "icyblue", name: "Icyblue", hex: "#9ec5e8" },
      { id: "mint", name: "Mint", hex: "#a8dcc8" },
      { id: "silver-shadow", name: "Silver Shadow", hex: "#c5c7ce" },
      { id: "blueblack", name: "Blueblack", hex: "#1a2744" },
      { id: "coralred", name: "Coralred", hex: "#e87070" },
      { id: "pinkgold", name: "Pinkgold", hex: "#d4a59a" },
    ],
    storages: [
      { storage: "128 GB", price: 999 },
      { storage: "256 GB", price: 1099 },
      { storage: "512 GB", price: 1249 },
    ],
  },
  {
    id: "samsung-galaxy-s25-ultra",
    slug: "galaxy-s25-ultra",
    model: "Galaxy S25 Ultra",
    generation: "S25",
    tagline: "Ultra KI. Ultra Kamera.",
    description: "Galaxy S25 Ultra mit Titanium Design und Galaxy AI Pro Features.",
    badge: "Neu",
    colors: [
      { name: "Titanium Black", hex: "#1c1c1c" },
      { name: "Titanium Gray", hex: "#8e8e93" },
      { name: "Titanium Silverblue", hex: "#7f8fa3" },
      { name: "Titanium WhiteSilver", hex: "#e3e4e5" },
      { name: "Titanium Jetblack", hex: "#0a0a0a" },
      { name: "Titanium Jadegreen", hex: "#5f8f7a" },
      { name: "Titanium Pinkgold", hex: "#d4a59a" },
    ],
    storages: [
      { storage: "256 GB", price: 1249 },
      { storage: "512 GB", price: 1399 },
      { storage: "1 TB", price: 1599 },
    ],
  },
  {
    id: "samsung-galaxy-s25-plus",
    slug: "galaxy-s25-plus",
    model: "Galaxy S25+",
    generation: "S25",
    tagline: "Plus Display. Plus Akku.",
    description: "Galaxy S25+ mit großem Display und langer Akkulaufzeit.",
    colors: [
      { id: "navy", name: "Navy", hex: "#1f2937" },
      { id: "icyblue", name: "Icyblue", hex: "#9ec5e8" },
      { id: "mint", name: "Mint", hex: "#a8dcc8" },
      { id: "silver-shadow", name: "Silver Shadow", hex: "#c5c7ce" },
      { id: "blueblack", name: "Blueblack – Samsung Online Shop exklusiv", hex: "#1a2744" },
      { id: "coralred", name: "Coralred – Samsung Online Shop exklusiv", hex: "#e87070" },
      { id: "pinkgold", name: "Pinkgold – Samsung Online Shop exklusiv", hex: "#d4a59a" },
    ],
    storages: [
      { storage: "128 GB", price: 1049 },
      { storage: "256 GB", price: 1149 },
      { storage: "512 GB", price: 1299 },
    ],
  },
  {
    id: "samsung-galaxy-s25",
    slug: "galaxy-s25",
    model: "Galaxy S25",
    generation: "S25",
    tagline: "Galaxy KI im kompakten Format.",
    description: "Das Galaxy S25 bringt Flaggschiff-Features in handlichere Form.",
    colors: [
      { id: "navy", name: "Navy", hex: "#1f2937" },
      { id: "icyblue", name: "Icyblue", hex: "#9ec5e8" },
      { id: "mint", name: "Mint", hex: "#a8dcc8" },
      { id: "silver-shadow", name: "Silver Shadow", hex: "#c5c7ce" },
      { id: "blueblack", name: "Blueblack – Samsung Online Shop exklusiv", hex: "#1a2744" },
      { id: "coralred", name: "Coralred – Samsung Online Shop exklusiv", hex: "#e87070" },
      { id: "pinkgold", name: "Pinkgold – Samsung Online Shop exklusiv", hex: "#d4a59a" },
    ],
    storages: [
      { storage: "128 GB", price: 899 },
      { storage: "256 GB", price: 999 },
      { storage: "512 GB", price: 1149 },
    ],
  },
  {
    id: "samsung-galaxy-s24-ultra",
    slug: "galaxy-s24-ultra",
    model: "Galaxy S24 Ultra",
    generation: "S24",
    tagline: "Titanium. Galaxy AI.",
    description: "Galaxy S24 Ultra mit S Pen, Titanium Gehäuse und Pro-Kamera.",
    colors: [
      { name: "Titanium Black", hex: "#1c1c1c" },
      { name: "Titanium Gray", hex: "#8e8e93" },
      { name: "Titanium Violet", hex: "#8b7ab8" },
      { name: "Titanium Yellow", hex: "#e8d44a" },
      { name: "Titanium Blue", hex: "#4a6fa5" },
      { name: "Titanium Green", hex: "#5f8f7a" },
      { name: "Titanium Orange", hex: "#e8622a" },
    ],
    storages: [
      { storage: "256 GB", price: 1299 },
      { storage: "512 GB", price: 1419 },
      { storage: "1 TB", price: 1599 },
    ],
  },
  {
    id: "samsung-galaxy-s24-plus",
    slug: "galaxy-s24-plus",
    model: "Galaxy S24+",
    generation: "S24",
    tagline: "Mehr Galaxy in Plus-Größe.",
    description: "Galaxy S24+ mit großem Display und starker Alltags-Performance.",
    colors: [
      { name: "Onyx Black", hex: "#1d1d1f" },
      { name: "Marble Gray", hex: "#b8b8bd" },
      { name: "Cobalt Violet", hex: "#7d7da8" },
      { name: "Amber Yellow", hex: "#e8d44a" },
      { name: "Jade Green", hex: "#5f8f7a" },
      { name: "Sapphire Blue", hex: "#4a6fa5" },
      { name: "Sandstone Orange", hex: "#d4a59a" },
    ],
    storages: [
      { storage: "256 GB", price: 999 },
      { storage: "512 GB", price: 1119 },
    ],
  },
  {
    id: "samsung-galaxy-s24",
    slug: "galaxy-s24",
    model: "Galaxy S24",
    generation: "S24",
    tagline: "Galaxy AI für alle.",
    description: "Das kompakte Galaxy S24 mit Galaxy AI und Premium-Design.",
    colors: [
      { name: "Onyx Black", hex: "#1d1d1f" },
      { name: "Marble Gray", hex: "#b8b8bd" },
      { name: "Cobalt Violet", hex: "#7d7da8" },
      { name: "Amber Yellow", hex: "#e8d44a" },
      { name: "Jade Green", hex: "#5f8f7a" },
      { name: "Sapphire Blue", hex: "#4a6fa5" },
    ],
    storages: [
      { storage: "128 GB", price: 799 },
      { storage: "256 GB", price: 899 },
    ],
  },
  {
    id: "samsung-galaxy-s24-fe",
    slug: "galaxy-s24-fe",
    model: "Galaxy S24 FE",
    generation: "S24",
    tagline: "Fan Edition. Galaxy Power.",
    description: "Galaxy S24 FE mit beliebten Fan-Farben und starker Performance.",
    colors: [
      { name: "Graphite", hex: "#414141" },
      { name: "Gray", hex: "#b8b8bd" },
      { name: "Blue", hex: "#4a6fa5" },
      { name: "Mint", hex: "#a8dcc8" },
    ],
    storages: [
      { storage: "128 GB", price: 649 },
      { storage: "256 GB", price: 749 },
    ],
  },
  // ── Galaxy A Serie ──
  {
    id: "samsung-galaxy-a57",
    slug: "galaxy-a57",
    model: "Galaxy A57",
    generation: "A57",
    tagline: "Premium Alltag.",
    badge: "Neu",
    description: "Galaxy A57 mit großem Display und langer Akkulaufzeit.",
    colors: [
      { name: "Awesome Navy", hex: "#1f2937" },
      { name: "Awesome Lilac", hex: "#b8a9c9" },
      { name: "Icy Blue", hex: "#7eb6d7" },
      { name: "Awesome Graphite", hex: "#414141" },
    ],
    storages: [
      { storage: "128 GB", price: 449 },
      { storage: "256 GB", price: 499 },
    ],
  },
  {
    id: "samsung-galaxy-a37",
    slug: "galaxy-a37",
    model: "Galaxy A37",
    generation: "A37",
    tagline: "Stil trifft Leistung.",
    badge: "Neu",
    description: "Galaxy A37 mit AMOLED Display und Triple-Kamera.",
    colors: [
      { name: "Awesome Charcoal", hex: "#3a3a3c" },
      { name: "Awesome Violet", hex: "#8b7ab8" },
      { name: "Awesome White", hex: "#f5f5f7" },
      { name: "Awesome Graygreen", hex: "#7c8a7a" },
    ],
    storages: [
      { storage: "128 GB", price: 349 },
      { storage: "256 GB", price: 399 },
    ],
  },
  {
    id: "samsung-galaxy-a27",
    slug: "galaxy-a27",
    model: "Galaxy A27",
    generation: "A27",
    tagline: "Galaxy Features zum smarten Preis.",
    badge: "Neu",
    description: "Galaxy A27 mit großem Display und Triple-Kamera.",
    colors: [
      { name: "Black", hex: "#1d1d1f" },
      { name: "Blue", hex: "#4a6fa5" },
      { name: "Pink", hex: "#f4b4c4" },
    ],
    storages: [
      { storage: "128 GB", price: 279 },
      { storage: "256 GB", price: 329 },
    ],
  },
  {
    id: "samsung-galaxy-a26",
    slug: "galaxy-a26",
    model: "Galaxy A26",
    generation: "A26",
    tagline: "Galaxy Alltag. Smart Preis.",
    badge: "Neu",
    description: "Galaxy A26 — solide Performance und modernes Design.",
    colors: [
      { name: "Black", hex: "#1d1d1f" },
      { name: "Mint", hex: "#a8dcc8" },
      { name: "White", hex: "#f5f5f7" },
    ],
    storages: [
      { storage: "128 GB", price: 259 },
      { storage: "256 GB", price: 309 },
    ],
  },
  {
    id: "samsung-galaxy-a17",
    slug: "galaxy-a17",
    model: "Galaxy A17",
    generation: "A17",
    tagline: "Einstieg mit Stil.",
    badge: "Neu",
    description: "Galaxy A17 — solide Performance zum fairen Preis.",
    colors: [
      { name: "Blue", hex: "#4a6fa5" },
      { name: "Gray", hex: "#b8b8bd" },
      { name: "Black", hex: "#1d1d1f" },
    ],
    storages: [
      { storage: "128 GB", price: 249 },
      { storage: "256 GB", price: 299 },
    ],
  },
  {
    id: "samsung-galaxy-a56",
    slug: "galaxy-a56",
    model: "Galaxy A56",
    generation: "A56",
    tagline: "Galaxy Features. Smart Preis.",
    description: "Galaxy A56 mit 120 Hz Display und starker Kamera.",
    colors: [
      { name: "Awesome Olive", hex: "#6b7c5c" },
      { name: "Awesome Pink", hex: "#f4b4c4" },
      { name: "Awesome Graphite", hex: "#414141" },
      { name: "Awesome Lightgray", hex: "#d2d2d7" },
    ],
    storages: [
      { storage: "128 GB", price: 399 },
      { storage: "256 GB", price: 449 },
    ],
  },
  {
    id: "samsung-galaxy-a36",
    slug: "galaxy-a36",
    model: "Galaxy A36",
    generation: "A36",
    tagline: "Schlankes Galaxy Design.",
    description: "Galaxy A36 — kompakt, schnell, zuverlässig.",
    colors: [
      { name: "Awesome Black", hex: "#1d1d1f" },
      { name: "Awesome White", hex: "#f5f5f7" },
      { name: "Awesome Lavender", hex: "#b8a9c9" },
    ],
    storages: [
      { storage: "128 GB", price: 299 },
      { storage: "256 GB", price: 349 },
    ],
  },
  {
    id: "samsung-galaxy-a16",
    slug: "galaxy-a16",
    model: "Galaxy A16",
    generation: "A16",
    tagline: "Galaxy für jeden.",
    description: "Galaxy A16 — erschwingliches Samsung Smartphone mit großem Display.",
    colors: [
      { name: "Blue Black", hex: "#1a2744" },
      { name: "Light Gray", hex: "#d2d2d7" },
      { name: "Gold", hex: "#d4a59a" },
    ],
    storages: [
      { storage: "128 GB", price: 219 },
      { storage: "256 GB", price: 269 },
    ],
  },
];

export function buildSamsungCatalog(): PremiumProduct[] {
  return samsungSeeds.map(buildSamsungProduct);
}

export const SAMSUNG_PRODUCT_IDS = new Set(samsungSeeds.map((seed) => seed.id));

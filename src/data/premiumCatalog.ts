import type { CatalogCategoryId } from "./catalogCategories";
import { assetPath } from "@/lib/assetPath";
import type { AdminProductSpecs, PremiumProduct } from "@/types/product";
import { buildGeneratedCatalog, mergeCatalog } from "./fullCatalogDefinitions";
import {
  buildVariantsFromColors,
  getColorDefinitionsForSlug,
} from "./productImageMap";
import { syncProductVariants } from "@/lib/productVariants";
import {
  getColorVariant,
  getDefaultColor,
  getDefaultStorage,
  getMonthlyPrice,
  getProductMinPrice,
  getProductPrice,
  getStorageOption,
  getStorageOptionsForColor,
  normalizeStoragePrice,
  validateVariantPrices,
} from "@/lib/productVariants";
import {
  getDefaultAvailableColorId,
  getDefaultAvailableStorage,
  getDefaultAvailableConditionId,
  getProductMinAvailablePrice,
} from "@/lib/productAvailability";

const appleBase = "images/products/Apple/iPhones /iPhone 17";

type ProductSeed = Omit<
  PremiumProduct,
  | "shortDescription"
  | "longDescription"
  | "highlights"
  | "deliveryContent"
  | "adminSpecs"
  | "galleryImages"
  | "recommendedAccessories"
  | "similarProducts"
  | "bundleOffers"
  | "model"
  | "generation"
  | "keywords"
> & {
  model?: string;
  generation?: string;
  keywords?: string[];
  shortDescription?: string;
  longDescription?: string;
  highlights?: string[];
  deliveryContent?: string[];
  adminSpecs?: AdminProductSpecs;
  galleryImages?: string[];
  recommendedAccessories?: string[];
  similarProducts?: string[];
  bundleOffers?: PremiumProduct["bundleOffers"];
};

function completeProductSeed(seed: ProductSeed): PremiumProduct {
  const shortDescription = seed.shortDescription ?? seed.tagline;
  const longDescription =
    seed.longDescription ?? `<p>${seed.description}</p>`;
  const highlights = seed.highlights ?? seed.features;
  const deliveryContent = seed.deliveryContent ?? seed.boxContents ?? [];
  const adminSpecs: AdminProductSpecs = seed.adminSpecs ?? {
    display: seed.specifications.display.map((row) => row.value).join(" · "),
    camera: seed.specifications.camera[0]?.value ?? "—",
    chip: seed.specifications.performance[0]?.value ?? "—",
    battery: seed.specifications.battery[0]?.value ?? "—",
    storage: seed.storageOptions.map((option) => option.storage).join(" · "),
    protection:
      seed.features.find((feature) => /titanium|ceramic|glas/i.test(feature)) ??
      "Premium Schutz",
    operatingSystem: seed.operatingSystem ?? "—",
  };

  return syncProductVariants({
    ...seed,
    model: seed.model ?? seed.name,
    generation: seed.generation ?? "2025",
    shortDescription,
    longDescription,
    highlights,
    deliveryContent,
    adminSpecs,
    mainImage: seed.mainImage ?? seed.images[0]?.image,
    galleryImages: seed.galleryImages ?? seed.images.map((image) => image.image),
    boxContents: deliveryContent,
    recommendedAccessories: seed.recommendedAccessories ?? [],
    similarProducts: seed.similarProducts ?? seed.compareWith ?? [],
    bundleOffers: seed.bundleOffers ?? [],
    keywords: seed.keywords ?? [],
    ...(getColorDefinitionsForSlug(seed.slug)
      ? {
          variants: buildVariantsFromColors(
            getColorDefinitionsForSlug(seed.slug)!,
            seed.storageOptions,
          ),
          images: [],
          storageOptions: [],
        }
      : {}),
  });
}

const productSeeds: ProductSeed[] = [
  {
    id: "offer-iphone",
    slug: "iphone-17-pro",
    brand: "Apple",
    name: "iPhone 17 Pro",
    model: "iPhone 17 Pro",
    generation: "2025",
    category: "Smartphones",
    catalogCategory: "smartphones",
    tagline: "Pro Leistung. Pro Kamera. Pro Design.",
    description:
      "Das iPhone 17 Pro kombiniert modernes Design mit maximaler Performance, einer professionellen Kamera und leistungsstarker Hardware.",
    badge: "Neu",
    operatingSystem: "iOS 19",
    boxContents: ["Gerät", "USB-C Kabel", "Anleitung"],
    compareWith: ["offer-samsung"],
    stock: 45,
    recommendedAccessories: [
      "offer-airpods",
      "catalog-chargers",
      "catalog-cases",
      "catalog-screen-protector",
      "catalog-apple-watch",
      "catalog-cables",
    ],
    similarProducts: ["offer-iphone-max", "offer-samsung", "offer-pixel-10"],
    modelVariants: [
      {
        id: "pro",
        name: "iPhone 17 Pro",
        displaySize: "6,3″",
        storageRange: "256 GB – 1 TB",
        priceFrom: 1199,
        slug: "iphone-17-pro",
      },
      {
        id: "pro-max",
        name: "iPhone 17 Pro Max",
        displaySize: "6,9″",
        storageRange: "256 GB – 1 TB",
        priceFrom: 1299,
        slug: "iphone-17-pro-max",
      },
    ],
    images: [
      {
        id: "cosmic-orange",
        colorName: "Cosmic Orange",
        colorCode: "#e8622a",
        image: assetPath(`${appleBase}/iPhone 17 Pro /Apple_iPhone17Pro_Orange.png`),
      },
      {
        id: "deep-blue",
        colorName: "Deep Blue",
        colorCode: "#2f3b52",
        image: assetPath(`${appleBase}/iPhone 17 Pro /iPhone17Pro_DeepBlue.png`),
      },
      {
        id: "silver",
        colorName: "Silver",
        colorCode: "#e3e4e5",
        image: assetPath(`${appleBase}/iPhone 17 Pro /apple_iphone_17_pro_1_1_1_1.png`),
      },
    ],
    storageOptions: [
      { storage: "256 GB", price: 1199 },
      { storage: "512 GB", price: 1399 },
      { storage: "1 TB", price: 1599 },
    ],
    features: [
      "A19 Pro Chip",
      "Pro-Kamera-System",
      "Titanium Design",
      "Always-On Display",
    ],
    specifications: {
      display: [
        { label: "Größe", value: "6,3″ Super Retina XDR" },
        { label: "Technologie", value: "OLED, ProMotion 120 Hz" },
        { label: "Auflösung", value: "2622 × 1206 px" },
      ],
      camera: [
        { label: "Hauptkamera", value: "48 MP Fusion" },
        { label: "Ultraweitwinkel", value: "48 MP" },
        { label: "Zoom", value: "5× optisch" },
      ],
      performance: [
        { label: "Prozessor", value: "Apple A19 Pro" },
        { label: "RAM", value: "12 GB" },
      ],
      battery: [
        { label: "Kapazität", value: "Bis zu 33 Std. Video" },
        { label: "Laden", value: "MagSafe & USB‑C Schnellladen" },
      ],
      connectivity: [
        { label: "5G", value: "Ja" },
        { label: "WLAN", value: "Wi‑Fi 7" },
        { label: "Bluetooth", value: "Bluetooth 6" },
      ],
    },
  },
  {
    id: "offer-iphone-max",
    slug: "iphone-17-pro-max",
    brand: "Apple",
    name: "iPhone 17 Pro Max",
    model: "iPhone 17 Pro Max",
    generation: "2025",
    category: "Smartphones",
    catalogCategory: "smartphones",
    tagline: "Das größte Pro-Erlebnis.",
    description:
      "Maximales Display, maximale Akkulaufzeit und Pro-Kamera — alles im größten iPhone 17 Pro Max.",
    badge: "Neu",
    compareWith: ["offer-samsung"],
    stock: 32,
    recommendedAccessories: [
      "offer-airpods",
      "catalog-chargers",
      "catalog-cases",
      "catalog-screen-protector",
      "catalog-apple-watch",
      "catalog-cables",
    ],
    similarProducts: ["offer-iphone", "offer-samsung"],
    modelVariants: [
      {
        id: "pro",
        name: "iPhone 17 Pro",
        displaySize: "6,3″",
        storageRange: "256 GB – 1 TB",
        priceFrom: 1199,
        slug: "iphone-17-pro",
      },
      {
        id: "pro-max",
        name: "iPhone 17 Pro Max",
        displaySize: "6,9″",
        storageRange: "256 GB – 1 TB",
        priceFrom: 1299,
        slug: "iphone-17-pro-max",
      },
    ],
    images: [
      {
        id: "cosmic-orange",
        colorName: "Cosmic Orange",
        colorCode: "#e8622a",
        image: assetPath(`${appleBase}/iPhone 17 Pro /Apple_iPhone17Pro_Orange.png`),
      },
      {
        id: "deep-blue",
        colorName: "Deep Blue",
        colorCode: "#2f3b52",
        image: assetPath(`${appleBase}/iPhone 17 Pro /iPhone17Pro_DeepBlue.png`),
      },
      {
        id: "silver",
        colorName: "Silver",
        colorCode: "#e3e4e5",
        image: assetPath(`${appleBase}/iPhone 17 Pro /apple_iphone_17_pro_1_1_1_1.png`),
      },
    ],
    storageOptions: [
      { storage: "256 GB", price: 1299 },
      { storage: "512 GB", price: 1499 },
      { storage: "1 TB", price: 1699 },
    ],
    features: [
      "A19 Pro Chip",
      "Pro-Kamera-System",
      "6,9″ Display",
      "Längste Akkulaufzeit",
    ],
    specifications: {
      display: [
        { label: "Größe", value: "6,9″ Super Retina XDR" },
        { label: "Technologie", value: "OLED, ProMotion 120 Hz" },
        { label: "Auflösung", value: "2868 × 1320 px" },
      ],
      camera: [
        { label: "Hauptkamera", value: "48 MP Fusion" },
        { label: "Ultraweitwinkel", value: "48 MP" },
        { label: "Zoom", value: "5× optisch" },
      ],
      performance: [
        { label: "Prozessor", value: "Apple A19 Pro" },
        { label: "RAM", value: "12 GB" },
      ],
      battery: [
        { label: "Kapazität", value: "Bis zu 39 Std. Video" },
        { label: "Laden", value: "MagSafe & USB‑C Schnellladen" },
      ],
      connectivity: [
        { label: "5G", value: "Ja" },
        { label: "WLAN", value: "Wi‑Fi 7" },
        { label: "Bluetooth", value: "Bluetooth 6" },
      ],
    },
  },
  {
    id: "offer-iphone-17",
    slug: "iphone-17",
    brand: "Apple",
    name: "iPhone 17",
    model: "iPhone 17",
    generation: "2025",
    category: "Smartphones",
    catalogCategory: "smartphones",
    tagline: "Mehr iPhone. Für jeden Tag.",
    description:
      "Modernes Design, starke Performance und ein brillantes Display für deinen Alltag.",
    badge: "Neu",
    compareWith: ["offer-iphone"],
    stock: 62,
    recommendedAccessories: [
      "offer-airpods",
      "catalog-chargers",
      "catalog-cases",
      "catalog-screen-protector",
      "catalog-apple-watch",
    ],
    similarProducts: ["offer-iphone", "offer-pixel-10"],
    images: [
      {
        id: "black",
        colorName: "Schwarz",
        colorCode: "#1d1d1f",
        image: assetPath(`${appleBase}/iPhone 17 /iPhone_17_Black.png`),
      },
      {
        id: "white",
        colorName: "Weiß",
        colorCode: "#f5f5f7",
        image: assetPath(`${appleBase}/iPhone 17 /iPhone_17_white.png`),
      },
      {
        id: "pink",
        colorName: "Pink",
        colorCode: "#f2b8c6",
        image: assetPath(`${appleBase}/iPhone 17 /iPhone_17_Lavendel.png`),
      },
      {
        id: "teal",
        colorName: "Teal Grün",
        colorCode: "#4f8777",
        image: assetPath(`${appleBase}/iPhone 17 /iPhone_17_Sage_Green.png`),
      },
    ],
    storageOptions: [
      { storage: "128 GB", price: 899 },
      { storage: "256 GB", price: 999 },
      { storage: "512 GB", price: 1199 },
    ],
    features: ["A19 Chip", "Dual-Kamera", "Ceramic Shield", "USB‑C"],
    specifications: {
      display: [
        { label: "Größe", value: "6,1″ Super Retina XDR" },
        { label: "Technologie", value: "OLED" },
        { label: "Auflösung", value: "2556 × 1179 px" },
      ],
      camera: [
        { label: "Hauptkamera", value: "48 MP" },
        { label: "Ultraweitwinkel", value: "12 MP" },
        { label: "Zoom", value: "2× optisch" },
      ],
      performance: [
        { label: "Prozessor", value: "Apple A19" },
        { label: "RAM", value: "8 GB" },
      ],
      battery: [
        { label: "Kapazität", value: "Bis zu 26 Std. Video" },
        { label: "Laden", value: "MagSafe & USB‑C" },
      ],
      connectivity: [
        { label: "5G", value: "Ja" },
        { label: "WLAN", value: "Wi‑Fi 6E" },
        { label: "Bluetooth", value: "Bluetooth 5.4" },
      ],
    },
  },
  {
    id: "offer-pixel-10",
    slug: "google-pixel-10",
    brand: "Google",
    name: "Google Pixel 10",
    model: "Pixel 10",
    generation: "Pixel 10",
    category: "Smartphones",
    catalogCategory: "smartphones",
    tagline: "Smart. Klar. Pixel.",
    description:
      "Google Pixel 10 verbindet smarte KI-Funktionen, starke Kamera-Technologie und ein flüssiges Android-Erlebnis.",
    badge: "Neu",
    compareWith: ["offer-samsung"],
    stock: 29,
    recommendedAccessories: [
      "catalog-pixel-watch",
      "catalog-chargers",
      "catalog-cases",
      "catalog-screen-protector",
      "catalog-cables",
    ],
    similarProducts: ["offer-samsung", "offer-iphone-17"],
    images: [
      {
        id: "obsidian",
        colorName: "Obsidian",
        colorCode: "#1d1d1f",
        image: getColorDefinitionsForSlug("google-pixel-10")?.[0]?.image ?? "",
      },
    ],
    storageOptions: [
      { storage: "128 GB", price: 799 },
      { storage: "256 GB", price: 899 },
      { storage: "512 GB", price: 1049 },
    ],
    features: ["Google Tensor G5", "Magic Eraser", "7 Jahre Updates", "Pure Android"],
    specifications: {
      display: [
        { label: "Größe", value: "6,7″ OLED" },
        { label: "Technologie", value: "LTPO 120 Hz" },
        { label: "Auflösung", value: "2992 × 1344 px" },
      ],
      camera: [
        { label: "Hauptkamera", value: "50 MP" },
        { label: "Ultraweitwinkel", value: "48 MP" },
        { label: "Zoom", value: "5× optisch" },
      ],
      performance: [
        { label: "Prozessor", value: "Google Tensor G5" },
        { label: "RAM", value: "12 GB" },
      ],
      battery: [
        { label: "Kapazität", value: "5050 mAh" },
        { label: "Laden", value: "30 W Schnellladen" },
      ],
      connectivity: [
        { label: "5G", value: "Ja" },
        { label: "WLAN", value: "Wi‑Fi 7" },
        { label: "Bluetooth", value: "Bluetooth 5.4" },
      ],
    },
  },
];

const detailedProducts: PremiumProduct[] = productSeeds.map(completeProductSeed);
const generatedProducts = buildGeneratedCatalog();

export const premiumProducts: PremiumProduct[] = mergeCatalog(
  detailedProducts,
  generatedProducts,
);

export function getPremiumProductById(id: string): PremiumProduct | undefined {
  return premiumProducts.find((product) => product.id === id);
}

export function getPremiumProductBySlug(slug: string): PremiumProduct | undefined {
  return premiumProducts.find((product) => product.slug === slug);
}

export function getPremiumProductsByCategory(
  categoryId: CatalogCategoryId,
): PremiumProduct[] {
  return premiumProducts.filter((product) => product.catalogCategory === categoryId);
}

export {
  getColorVariant,
  getDefaultColor,
  getDefaultStorage,
  getDefaultAvailableColorId,
  getDefaultAvailableStorage,
  getDefaultAvailableConditionId,
  getMonthlyPrice,
  getProductMinPrice,
  getProductMinAvailablePrice,
  getProductPrice,
  getStorageOption,
  getStorageOptionsForColor,
  validateVariantPrices,
  normalizeStoragePrice,
};

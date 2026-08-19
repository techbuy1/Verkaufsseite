import type { CatalogCategoryId } from "@/data/catalogCategories";

export type ConditionId =
  | "new"
  | "like_new"
  | "excellent"
  | "very_good"
  | "good"
  | "heavily_used"
  | "poor";

export interface ProductImageVariant {
  id: string;
  colorName: string;
  colorCode: string;
  image: string;
  imageMissing?: boolean;
  /** Weitere echte Produktfotos derselben Farbe (z. B. Rückseite, Seite) — nur gesetzt, wenn Assets vorhanden sind. */
  angles?: string[];
}

/** Zustand einer Farb-/Speicherkombination */
export interface ConditionOption {
  condition: ConditionId;
  label: string;
  price: number;
  stock: number;
  /** Deaktivierte Zustände bleiben gespeichert, sind aber nicht kaufbar */
  active: boolean;
  /** Optionaler Hinweis z. B. „kleiner Kratzer am Rahmen“ */
  note?: string;
  /** Eindeutige SKU, z. B. APL-IP15-BLU-128-VG */
  sku?: string;
}

export interface StorageOption {
  storage: string;
  /**
   * Abgeleiteter Mindestpreis (aktive Zustände) — für Legacy/Karten.
   * Quelle der Wahrheit: conditions[].
   */
  price: number;
  /** Abgeleiteter Bestand aktiver Zustände */
  stock?: number;
  /** Zustände mit eigenem Preis & Bestand */
  conditions?: ConditionOption[];
}

/** Farbvariante mit eigenen Speicheroptionen und Preisen */
export interface ProductVariant {
  id: string;
  colorName: string;
  colorCode: string;
  image: string;
  imageMissing?: boolean;
  /** Weitere echte Produktfotos derselben Farbe (z. B. Rückseite, Seite) — nur gesetzt, wenn Assets vorhanden sind. */
  angles?: string[];
  storageOptions: StorageOption[];
}

export interface SpecRow {
  label: string;
  value: string;
}

export interface ProductSpecifications {
  display: SpecRow[];
  camera: SpecRow[];
  performance: SpecRow[];
  battery: SpecRow[];
  connectivity: SpecRow[];
}

export interface AdminProductSpecs {
  display: string;
  camera: string;
  chip: string;
  battery: string;
  storage: string;
  protection: string;
  operatingSystem: string;
}

export interface ProductModelVariant {
  id: string;
  name: string;
  displaySize: string;
  storageRange: string;
  priceFrom: number;
  slug: string;
}

export interface BundleOffer {
  id: string;
  title: string;
  productIds: string[];
  discountLabel?: string;
}

export interface PremiumProduct {
  id: string;
  slug: string;
  brand: string;
  name: string;
  /** Modellbezeichnung, z. B. „iPhone 15 Pro“ */
  model: string;
  /** Generation / Serie, z. B. „2024“ oder „S26“ */
  generation: string;
  category: string;
  catalogCategory: CatalogCategoryId;
  /** Kurzbeschreibung / Tagline */
  tagline: string;
  shortDescription: string;
  /** Ausführliche Beschreibung (HTML) */
  longDescription: string;
  /** Legacy plain description — synced with short/long */
  description: string;
  mainImage?: string;
  galleryImages: string[];
  /** Primäre Varianten — Farbe + Speicher + Zustand + Preis pro Kombination */
  variants?: ProductVariant[];
  images: ProductImageVariant[];
  /** Abgeleitete Union aller Speicher (Karten/Filter) — via syncProductVariants */
  storageOptions: StorageOption[];
  specifications: ProductSpecifications;
  adminSpecs: AdminProductSpecs;
  highlights: string[];
  deliveryContent: string[];
  features: string[];
  modelVariants?: ProductModelVariant[];
  operatingSystem?: string;
  boxContents?: string[];
  badge?: "Neu" | "Sale";
  discount?: string;
  compareWith?: string[];
  stock?: number;
  /** Manuell aus dem Shop ausblenden — unabhängig vom Bestand */
  manualArchive?: boolean;
  /** Suchbegriffe für Produktsuche */
  keywords?: string[];
  recommendedAccessories?: string[];
  /** Ähnliche Produkte */
  similarProducts?: string[];
  /** Bundle-Angebote */
  bundleOffers?: BundleOffer[];
}

export interface AddToCartPayload {
  productId: string;
  colorId?: string;
  storage?: string;
  condition?: ConditionId;
  quantity?: number;
}

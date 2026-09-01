import type { CatalogCategoryId } from "@/data/catalogCategories";
import { EBAY_INVENTORY, type EbayInventoryRow } from "@/data/ebayInventory";
import { VARIANT_IMAGE_PLACEHOLDER } from "@/data/productImageRegistry";
import type { Product } from "@/data/products";
import { toCatalogSummary, summaryToLegacyProduct } from "@/lib/catalogSummary";
import { calculateTechBuyPrice } from "@/lib/ebayPricing";
import type { ConditionId, PremiumProduct } from "@/types/product";

export interface ParsedEbayListing {
  ebayItemId: string;
  ebayTitle: string;
  brand: string;
  model: string;
  name: string;
  category: string;
  catalogCategory: CatalogCategoryId;
  storage: string;
  ram: string;
  color: string;
  condition: string;
  conditionNote: string;
  conditionId: ConditionId;
  batteryHealth: number | null;
  isDefective: boolean;
  ebayPrice: number;
  techbuyPrice: number;
  calculatedPrice: number;
  quantity: number;
  slug: string;
  keywords: string[];
}

const EMPTY_SPECS = {
  display: [],
  camera: [],
  performance: [],
  battery: [],
  connectivity: [],
};

export function getStockStatusLabel(quantity: number): string {
  if (quantity <= 0) return "Ausverkauft";
  if (quantity === 1) return "Nur noch 1 Stück verfügbar";
  if (quantity === 2) return "Nur noch 2 Stück verfügbar";
  if (quantity >= 3 && quantity <= 5) return "Nur noch wenige verfügbar";
  return "Auf Lager";
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function detectBrand(title: string): string {
  if (/\bapple\b|iphone|ipad|macbook|mac mini|airpods|watch|magic keyboard|magsafe/i.test(title)) {
    return "Apple";
  }
  if (/samsung|galaxy/i.test(title)) return "Samsung";
  if (/google|pixel/i.test(title)) return "Google";
  if (/xiaomi/i.test(title)) return "Xiaomi";
  if (/dell/i.test(title)) return "Dell";
  if (/\bhp\b|zbook/i.test(title)) return "HP";
  if (/jbl/i.test(title)) return "JBL";
  return "TechBuy";
}

function detectCategory(title: string): { category: string; catalogCategory: CatalogCategoryId } {
  if (/magic keyboard|magsafe|adapter|multiport|powerbank|vga/i.test(title)) {
    return { category: "Zubehör", catalogCategory: "zubehoer" };
  }
  if (/airpods|kopfhörer|partybox|mikrofon/i.test(title)) {
    return { category: "Audio", catalogCategory: "audio" };
  }
  if (/watch/i.test(title)) {
    return { category: "Smartwatches", catalogCategory: "smartwatches" };
  }
  if (/ipad|galaxy tab|tablet/i.test(title)) {
    return { category: "Tablets", catalogCategory: "tablets" };
  }
  if (/macbook|mac mini|macbook pro|macbook air/i.test(title)) {
    return { category: "MacBooks", catalogCategory: "macbooks" };
  }
  if (/dell|zbook|laptop/i.test(title)) {
    return { category: "Laptops", catalogCategory: "laptops" };
  }
  return { category: "Smartphones", catalogCategory: "smartphones" };
}

function parseBattery(title: string): number | null {
  const match = title.match(/(\d{2,3})\s*%\s*(?:batterie)?/i) ?? title.match(/batterie\s*(\d{2,3})\s*%/i);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

function parseStorage(title: string): string {
  const tb = title.match(/(\d+(?:[.,]\d+)?)\s*TB/i);
  if (tb) return `${tb[1].replace(",", ".")} TB`.replace(". TB", " TB");
  const gb = title.match(/(\d+)\s*GB/i);
  if (gb) return `${gb[1]} GB`;
  return "";
}

function parseRam(title: string): string {
  const ram = title.match(/(\d+)\s*GB\s*RAM/i) ?? title.match(/(\d+)GB\/(\d+)GB/i);
  if (!ram) return "";
  if (ram[2]) return `${ram[1]} GB`;
  return `${ram[1]} GB`;
}

const COLOR_PATTERNS: [RegExp, string][] = [
  [/schwarz|black|onyx black|space schwarz|obsidian|midnight|awesome graphite|graphite|navy blau/i, "Schwarz"],
  [/weiß|white|polarstern/i, "Weiß"],
  [/gold|desert gold|desert titanium|canyon/i, "Gold"],
  [/silber|silver/i, "Silber"],
  [/cosmic orange|orange/i, "Cosmic Orange"],
  [/tiefblau|deep blue|blau|navy/i, "Blau"],
  [/violett|purple|lila|lilac/i, "Violett"],
  [/titanium black|titanium silverblue|silverblue/i, "Titanium"],
  [/wüstensand|desert/i, "Wüstensand"],
  [/cobalt violet|violet/i, "Cobalt Violet"],
  [/mitternacht/i, "Mitternacht"],
  [/pistazie|pistachio/i, "Pistazie"],
  [/grün|starlit green|green/i, "Grün"],
  [/icyblue|icy blue/i, "Icy Blue"],
  [/gray|grey/i, "Grau"],
];

function parseColor(title: string): string {
  for (const [pattern, label] of COLOR_PATTERNS) {
    if (pattern.test(title)) return label;
  }
  return "";
}

function parseCondition(title: string): {
  condition: string;
  conditionNote: string;
  conditionId: ConditionId;
  isDefective: boolean;
} {
  const isDefective = /defekt/i.test(title);
  if (isDefective) {
    return { condition: "Defekt", conditionNote: "", conditionId: "poor", isDefective: true };
  }

  const hasKundenretoure = /kunden\s*retoure|kundenretoure/i.test(title);
  const hasWieNeu = /wie neu/i.test(title);
  const hasNeuOvp =
    /neu\s*&\s*ovp|neu\s*ovp|neuware|versiegelt|ungeöffnet|neu \+|neu ohne simlock/i.test(title);

  if (hasWieNeu && hasKundenretoure) {
    return { condition: "Wie neu", conditionNote: "Kundenretoure", conditionId: "like_new", isDefective: false };
  }
  if (hasNeuOvp) {
    return { condition: "Neu & OVP", conditionNote: "", conditionId: "new", isDefective: false };
  }
  if (hasWieNeu) {
    return { condition: "Wie neu", conditionNote: "", conditionId: "like_new", isDefective: false };
  }
  if (hasKundenretoure) {
    return { condition: "Kundenretoure", conditionNote: "", conditionId: "like_new", isDefective: false };
  }

  return { condition: "", conditionNote: "", conditionId: "very_good", isDefective: false };
}

function extractModel(title: string, brand: string): string {
  const patterns = [
    /Apple iPhone[^–\-|]*/i,
    /Samsung Galaxy[^–\-|]*/i,
    /Google Pixel[^–\-|]*/i,
    /Xiaomi [^–\-|]*/i,
    /Apple iPad[^–\-|]*/i,
    /Apple Watch[^–\-|]*/i,
    /Apple MacBook[^–\-|]*/i,
    /Apple Mac mini[^–\-|]*/i,
    /Apple AirPods[^–\-|]*/i,
    /Dell Pro[^–\-|]*/i,
    /HP ZBook[^–\-|]*/i,
    /Magic Keyboard[^–\-|]*/i,
    /MagSafe[^–\-|]*/i,
    /Apple USB-C[^–\-|]*/i,
    /JBL [^–\-|]*/i,
  ];

  let model = title;
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      model = match[0];
      break;
    }
  }

  model = model
    .replace(/\b(defekt|neu|ovp|wie neu|kunden\s*retoure|kundenretoure|versiegelt|ungeöffnet)\b/gi, "")
    .replace(/\b\d+\s*GB\b/gi, "")
    .replace(/\b\d+\s*TB\b/gi, "")
    .replace(/\b\d+\s*%\s*batterie\b/gi, "")
    .replace(/\b\d+\s*%\b/gi, "")
    .replace(/\b\d+\s*GB\s*RAM\b/gi, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (brand === "Apple" && /iphone/i.test(model)) {
    const iphone = model.match(/iPhone[^–\-|]*/i);
    if (iphone) model = iphone[0].trim();
  }

  return model.replace(/\s+–\s*$/, "").trim();
}

export function parseEbayListing(row: EbayInventoryRow): ParsedEbayListing {
  const pricing = calculateTechBuyPrice(row.ebay_price);
  const { category, catalogCategory } = detectCategory(row.title);
  const brand = detectBrand(row.title);
  const model = extractModel(row.title, brand);
  const storage = parseStorage(row.title);
  const ram = parseRam(row.title);
  const color = parseColor(row.title);
  const { condition, conditionNote, conditionId, isDefective } = parseCondition(row.title);
  const batteryHealth = parseBattery(row.title);

  const slugBase = slugify(`${brand}-${model}-${storage}-${color}-${row.ebay_item_id}`);
  const slug = slugBase || `ebay-${row.ebay_item_id}`;

  return {
    ebayItemId: row.ebay_item_id,
    ebayTitle: row.title,
    brand,
    model,
    name: model,
    category,
    catalogCategory,
    storage,
    ram,
    color,
    condition,
    conditionNote,
    conditionId,
    batteryHealth,
    isDefective,
    ebayPrice: pricing.ebay_price,
    calculatedPrice: pricing.calculated_price,
    techbuyPrice: pricing.techbuy_price,
    quantity: row.quantity,
    slug,
    keywords: [brand, model, storage, color, condition, row.ebay_item_id, category].filter(Boolean),
  };
}

export function buildEbayPremiumProduct(parsed: ParsedEbayListing): PremiumProduct {
  const storageLabel = parsed.storage || "Standard";
  const colorLabel = parsed.color || "Standard";
  const colorId = slugify(colorLabel) || "standard";
  const image = VARIANT_IMAGE_PLACEHOLDER;
  const conditionLabel = parsed.condition || "Verfügbar";
  const shortParts = [storageLabel, colorLabel].filter(Boolean);
  const shortDescription = shortParts.length > 0 ? shortParts.join(" · ") : parsed.model;

  const highlights: string[] = [];
  if (parsed.condition) highlights.push(`Zustand: ${parsed.condition}`);
  if (parsed.conditionNote) highlights.push(parsed.conditionNote);
  if (parsed.batteryHealth !== null) highlights.push(`Akku: ${parsed.batteryHealth} %`);
  if (parsed.ram) highlights.push(`RAM: ${parsed.ram}`);

  return {
    id: `ebay-${parsed.ebayItemId}`,
    slug: parsed.slug,
    brand: parsed.brand,
    name: parsed.name,
    model: parsed.model,
    generation: "",
    category: parsed.category,
    catalogCategory: parsed.catalogCategory,
    tagline: shortDescription,
    shortDescription,
    longDescription: `<p>${parsed.ebayTitle}</p>`,
    description: parsed.ebayTitle,
    mainImage: image,
    galleryImages: [image],
    images: [
      {
        id: colorId,
        colorName: colorLabel,
        colorCode: "#e8e8ed",
        image,
        imageMissing: true,
      },
    ],
    storageOptions: [
      {
        storage: storageLabel,
        price: parsed.techbuyPrice,
        stock: parsed.quantity,
        conditions: [
          {
            condition: parsed.conditionId,
            label: conditionLabel,
            price: parsed.techbuyPrice,
            stock: parsed.quantity,
            active: parsed.quantity > 0,
            note: parsed.conditionNote || undefined,
            sku: `EBAY-${parsed.ebayItemId}`,
            ebayItemId: parsed.ebayItemId,
            ebayPrice: parsed.ebayPrice,
            calculatedPrice: parsed.calculatedPrice,
          },
        ],
      },
    ],
    specifications: EMPTY_SPECS,
    adminSpecs: {
      display: "—",
      camera: "—",
      chip: "—",
      battery: parsed.batteryHealth !== null ? `${parsed.batteryHealth} %` : "—",
      storage: storageLabel,
      protection: "—",
      operatingSystem: "—",
    },
    highlights,
    deliveryContent: ["Artikel laut Beschreibung"],
    features: highlights,
    stock: parsed.quantity,
    badge: parsed.isDefective ? undefined : parsed.condition === "Neu & OVP" ? "Neu" : undefined,
    keywords: parsed.keywords,
    ebayItemId: parsed.ebayItemId,
    ebayTitle: parsed.ebayTitle,
    ebayPrice: parsed.ebayPrice,
    calculatedPrice: parsed.calculatedPrice,
    techbuyPrice: parsed.techbuyPrice,
    listingCondition: parsed.condition || undefined,
    conditionNote: parsed.conditionNote || undefined,
    batteryHealth: parsed.batteryHealth,
    isDefective: parsed.isDefective,
    manualArchive: parsed.quantity <= 0,
    stockArchived: parsed.quantity <= 0,
  };
}

export function buildEbayPremiumProducts(): PremiumProduct[] {
  return EBAY_INVENTORY.map((row) => buildEbayPremiumProduct(parseEbayListing(row)));
}

export function getEbayLegacyProducts(): Product[] {
  return buildEbayPremiumProducts().map((product) => {
    const legacy = summaryToLegacyProduct(toCatalogSummary(product));
    return {
      ...legacy,
      ebayItemId: product.ebayItemId,
      ebayPrice: product.ebayPrice,
      techbuyPrice: product.techbuyPrice,
      listingCondition: product.listingCondition,
      conditionNote: product.conditionNote,
      batteryHealth: product.batteryHealth ?? undefined,
      stockStatusLabel: getStockStatusLabel(product.stock ?? 0),
      isDefective: product.isDefective,
    };
  });
}

export function getEbayProductBySlug(slug: string): PremiumProduct | undefined {
  return buildEbayPremiumProducts().find((product) => product.slug === slug);
}

export function getEbayProductById(id: string): PremiumProduct | undefined {
  return buildEbayPremiumProducts().find((product) => product.id === id);
}

export function isEbayInventoryProduct(
  product: Pick<PremiumProduct, "id" | "ebayItemId">,
): boolean {
  return Boolean(product.ebayItemId) || product.id.startsWith("ebay-");
}

export function isEbayInventoryActive(): boolean {
  return EBAY_INVENTORY.length > 0;
}

export function applyEbayPriceUpdate(ebayItemId: string, newEbayPrice: number): PremiumProduct | undefined {
  const row = EBAY_INVENTORY.find((entry) => entry.ebay_item_id === ebayItemId);
  if (!row) return undefined;
  const parsed = parseEbayListing({ ...row, ebay_price: newEbayPrice });
  return buildEbayPremiumProduct(parsed);
}

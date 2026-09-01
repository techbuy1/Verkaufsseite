import { EBAY_INVENTORY } from "@/data/ebayInventory";
import { parseEbayListing, type ParsedEbayListing } from "@/lib/ebayInventorySync";
import { syncProductVariants } from "@/lib/productVariants";
import { syncStockArchiveState } from "@/lib/productAvailability";
import type {
  ConditionId,
  ConditionOption,
  PremiumProduct,
  ProductVariant,
  StorageOption,
} from "@/types/product";

/**
 * Overlay: der Shop-Katalog bleibt der bestehende Gerätekatalog
 * (`src/data/server-catalog.json` + Seed) mit allen echten Produktbildern —
 * aber **Bestand und Preis** kommen ausschließlich aus dem realen
 * eBay-Bestand (`src/data/ebayInventory.ts`, 2 % unter eBay, auf ,99
 * gerundet über `calculateTechBuyPrice`).
 *
 * Für jedes Katalogprodukt:
 * - passende eBay-Einzelstücke werden über `ebayModelToCatalogSlug()` dem
 *   Produkt-Slug zugeordnet;
 * - je (Farbe · Speicher · Zustand) wird genau die Zelle mit Bestand + Preis
 *   des Einzelstücks befüllt, alle übrigen Kombinationen auf Bestand 0
 *   gesetzt;
 * - Produkte ohne passendes eBay-Einzelstück werden auf Bestand 0 archiviert
 *   (verschwinden damit aus dem Shop, `isProductVisibleInShop`).
 */

const CONDITION_LABEL: Record<ConditionId, string> = {
  new: "Neu",
  like_new: "Wie neu",
  excellent: "Hervorragend",
  very_good: "Sehr gut",
  good: "Gut",
  heavily_used: "Stark gebraucht",
  poor: "Schlecht",
};

/**
 * Ordnet die von `parseEbayListing()` erkannte Modellbezeichnung einem
 * Katalog-Slug zu. Spezifischste Regel zuerst. `null` = kein Katalogprodukt
 * (Einzelstück ist über diesen Katalog nicht verkäufbar).
 */
export function ebayModelToCatalogSlug(parsed: ParsedEbayListing): string | null {
  const t = `${parsed.brand} ${parsed.model} ${parsed.ebayTitle}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Zubeh\u00f6r / Audio / Peripherie hat kein passendes Katalog-Ger\u00e4teprodukt \u2014
  // NIE einem Ger\u00e4t zuordnen (sonst leckt z. B. \u201eMagic Keyboard iPad Air\u201c in
  // das iPad-Air-Produkt).
  if (
    /magic keyboard|magsafe|multiport|adapter|\bvga\b|powerbank|partybox|mikrofon|airpods|kopfhorer|huelle|hulle|\bkabel\b|ladegerat/.test(
      t,
    )
  ) {
    return null;
  }

  const rules: [RegExp, string][] = [
    // iPhone
    [/iphone 17 pro max/, "iphone-17-pro-max"],
    [/iphone 17 pro/, "iphone-17-pro"],
    [/iphone 17/, "iphone-17"],
    [/iphone 16e/, "iphone-16e"],
    [/iphone 16 pro max/, "iphone-16-pro-max"],
    [/iphone 16 pro/, "iphone-16-pro"],
    [/iphone 16 plus/, "iphone-16-plus"],
    [/iphone 16/, "iphone-16"],
    [/iphone 15 pro max/, "iphone-15-pro-max"],
    [/iphone 15 pro/, "iphone-15-pro"],
    [/iphone 15 plus/, "iphone-15-plus"],
    [/iphone 15/, "iphone-15"],
    [/iphone 14 pro max/, "iphone-14-pro-max"],
    [/iphone 14 pro/, "iphone-14-pro"],
    [/iphone 14 plus/, "iphone-14-plus"],
    [/iphone 14/, "iphone-14"],
    // Samsung Galaxy S
    [/galaxy s25 ultra/, "galaxy-s25-ultra"],
    [/galaxy s25\+|galaxy s25 plus/, "galaxy-s25-plus"],
    [/galaxy s25/, "galaxy-s25"],
    [/galaxy s24 fe/, "galaxy-s24-fe"],
    [/galaxy s24 ultra/, "galaxy-s24-ultra"],
    [/galaxy s24\+|galaxy s24 plus/, "galaxy-s24-plus"],
    [/galaxy s24/, "galaxy-s24"],
    // Samsung Galaxy A
    [/galaxy a57/, "galaxy-a57"],
    [/galaxy a56/, "galaxy-a56"],
    [/galaxy a37/, "galaxy-a37"],
    [/galaxy a36/, "galaxy-a36"],
    [/galaxy a27/, "galaxy-a27"],
    [/galaxy a26/, "galaxy-a26"],
    [/galaxy a17/, "galaxy-a17"],
    [/galaxy a16/, "galaxy-a16"],
    // iPad
    [/ipad pro/, "ipad-pro-m5"],
    [/ipad air/, "ipad-air-m3"],
    // Google Pixel (Katalog reicht nur bis Pixel 10)
    [/pixel 10 pro xl/, "google-pixel-10-pro-xl"],
    [/pixel 10 pro/, "google-pixel-10-pro"],
    [/pixel 10a/, "google-pixel-10a"],
    [/pixel 10/, "google-pixel-10"],
    [/pixel 9 pro xl/, "google-pixel-9-pro-xl"],
    [/pixel 9 pro/, "google-pixel-9-pro"],
    [/pixel 9/, "pixel-9"],
    [/pixel 8 pro/, "pixel-8-pro"],
    [/pixel 8/, "pixel-8"],
  ];

  for (const [pattern, slug] of rules) {
    if (pattern.test(t)) return slug;
  }
  return null;
}

interface OverlayUnit {
  storage: string;
  colorRaw: string;
  conditionId: ConditionId;
  price: number;
  ebayPrice: number;
  quantity: number;
  ebayItemId: string;
  title: string;
}

export interface EbayOverlayEntry {
  slug: string | null;
  unit: OverlayUnit;
}

/**
 * eBay-Zustand → verwendeter Katalog-Zustandsbucket. „new" wird bewusst auf
 * „like_new" abgebildet: Wird der `new`-Zustand befüllt, vererbt die
 * Katalog-Logik (`getEffectiveConditionStock`) dessen Bestand an alle
 * übrigen Zustände (Shared-Pool „sobald Neuware da ist, sind alle Zustände
 * wählbar") — dann würden Demo-Rabattpreise wieder kaufbar. Ein „Neu & OVP"-
 * Gerät wird daher als „Wie neu" geführt.
 */
function bucketFor(conditionId: ConditionId): ConditionId {
  return conditionId === "new" ? "like_new" : conditionId;
}

/** Alle eBay-Einzelstücke geparst + einem Katalog-Slug zugeordnet. */
export function getEbayOverlayEntries(): EbayOverlayEntry[] {
  return EBAY_INVENTORY.map((row) => {
    const parsed = parseEbayListing(row);
    return {
      slug: ebayModelToCatalogSlug(parsed),
      unit: {
        storage: parsed.storage,
        colorRaw: parsed.color || parsed.ebayTitle,
        conditionId: bucketFor(parsed.conditionId),
        price: parsed.techbuyPrice,
        ebayPrice: parsed.ebayPrice,
        quantity: Math.max(0, parsed.quantity),
        ebayItemId: parsed.ebayItemId,
        title: parsed.ebayTitle,
      },
    };
  });
}

/** Farbbegriffe im eBay-Titel \u2192 Tokens, wie sie in Katalog-Farbnamen stehen. */
const COLOR_SYNONYMS: [RegExp, string][] = [
  [/tiefblau|deep blue|dunkelblau/, "blue blau deep"],
  [/navy blau|\bnavy\b/, "navy blau"],
  [/\bblau\b|\bblue\b/, "blau blue"],
  [/\brot\b|\bred\b/, "rot red"],
  [/silber|silver/, "silber silver"],
  [/\bweiss\b|\bwhite\b|polarstern|starlight|polar/, "weiss white"],
  [/\bschwarz\b|\bblack\b|space schwarz|space black|midnight|mitternacht|obsidian|onyx/, "schwarz black"],
  [/\bgrau\b|\bgray\b|\bgrey\b|graphite|graphit|charcoal/, "grau gray graphite"],
  [/tuerkis|teal|blaugruen/, "teal"],
  [/violett|purple|\blila\b|lilac|lavender|lavendel/, "violett purple lila lilac lavender"],
  [/cosmic orange|\borange\b/, "orange"],
  [/wuestensand|desert/, "wuestensand desert"],
  [/\bgold\b/, "gold"],
  [/\brosa\b|\bpink\b/, "pink"],
  [/\bgruen\b|\bgreen\b|sage|mint|jade/, "gruen green sage mint"],
  [/\bgelb\b|\byellow\b/, "gelb yellow"],
  [/icyblue|icy blue|sky blue|himmelblau|frozen blue/, "icy blue sky"],
  [/titanium black|titan schwarz/, "titanium black titan schwarz"],
  [/titanium silverblue|silverblue/, "titanium silverblue"],
  [/titanium gray|titan grau/, "titanium gray titan grau"],
  [/cobalt violet/, "cobalt violet violett"],
];

function normalizeColorText(value: string): string {
  const base = value
    .toLowerCase()
    .replace(/\u00e4/g, "ae")
    .replace(/\u00f6/g, "oe")
    .replace(/\u00fc/g, "ue")
    .replace(/\u00df/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/awesome\s+/g, "")
    .replace(/\bti?tan(ium)?\b/g, "titan");
  const extra = COLOR_SYNONYMS.filter(([pattern]) => pattern.test(base))
    .map(([, tokens]) => tokens)
    .join(" ");
  return `${base} ${extra}`;
}

/**
 * Beste Farbvariante f\u00fcr ein eBay-Einzelst\u00fcck. `null` = keine sichere
 * Zuordnung (Aufrufer verteilt dann rundlaufend auf freie Varianten, damit
 * zwei unterschiedliche Ger\u00e4te nicht in derselben Zelle zusammenfallen).
 */
function matchColorId(product: PremiumProduct, unit: OverlayUnit): string | null {
  const variants = product.variants ?? [];
  if (variants.length === 0) return null;

  const hay = normalizeColorText(`${unit.colorRaw} ${unit.title}`);

  let best: { id: string; score: number } | null = null;
  for (const variant of variants) {
    const tokens = normalizeColorText(variant.colorName)
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 2);
    const score = tokens.reduce((sum, token) => (hay.includes(token) ? sum + 1 : sum), 0);
    if (score > 0 && (!best || score > best.score)) {
      best = { id: variant.id, score };
    }
  }

  return best?.id ?? null;
}

/** F\u00fchrender Gr\u00f6\u00dfen-Token, z. B. \u201e256 GB \u00b7 WLAN\u201c \u2192 \u201e256gb\u201c, \u201e2 TB\u201c \u2192 \u201e2tb\u201c. */
function storageKey(value: string): string {
  const match = value.match(/(\d+(?:[.,]\d+)?)\s*(gb|tb)/i);
  if (!match) return value.replace(/\s+/g, "").toLowerCase();
  return `${match[1].replace(",", ".")}${match[2].toLowerCase()}`;
}

/**
 * Speicheroption für die eBay-Kapazität. Fehlt sie im Katalog (z. B.
 * Katalog kennt nur 256 GB+, eBay-Gerät hat 128 GB), wird sie aus der
 * Struktur der ersten Option neu angelegt statt das Gerät fälschlich einer
 * anderen Kapazität zuzuordnen.
 */
function matchStorage(
  variant: ProductVariant,
  storage: string,
): StorageOption | undefined {
  const options = variant.storageOptions;
  if (options.length === 0) return undefined;
  const key = storageKey(storage);
  const exact = options.find((option) => storageKey(option.storage) === key);
  if (exact) return exact;
  if (!storage.trim() || !/\d/.test(storage)) return options[0];

  const template = options[0];
  const cellularSuffix = /wlan|cellular|5g/i.test(template.storage)
    ? template.storage.replace(/^[^·]+·?\s*/, " · ").trimEnd()
    : "";
  const created: StorageOption = {
    storage: `${storage}${cellularSuffix}`.trim(),
    price: 0,
    stock: 0,
    conditions: [],
  };
  options.push(created);
  return created;
}

/**
 * Speicheroption komplett leeren: kein Bestand, kein Preis, **keine**
 * Zustände. Wichtig: würden hier Demo-Zustände mit `stock: 0` zurückbleiben,
 * reaktiviert `ensureStorageConditions()` sie (Regel „ungenutzte Zustände
 * für die Auswahl aktivieren") und `getEffectiveConditionStock()` vererbt
 * ihnen den Bestand des `new`-Zustands — dann würde ein einzelnes „Neu"-
 * Gerät fälschlich alle 7 Zustände zu Demo-Preisen kaufbar machen und der
 * „Ab X €"-Preis käme aus einem Demo-Rabattpreis statt vom eBay-Preis.
 */
function emptyStorageOption(option: StorageOption): StorageOption {
  return { ...option, price: 0, stock: 0, conditions: [] };
}

function ensureConditionEntry(
  option: StorageOption,
  conditionId: ConditionId,
): ConditionOption {
  const conditions = option.conditions ?? (option.conditions = []);
  let entry = conditions.find((candidate) => candidate.condition === conditionId);
  if (!entry) {
    entry = {
      condition: conditionId,
      label: CONDITION_LABEL[conditionId],
      price: 0,
      stock: 0,
      active: false,
    };
    conditions.push(entry);
  }
  return entry;
}

function archiveProduct(product: PremiumProduct): PremiumProduct {
  const variants: ProductVariant[] = (product.variants ?? []).map((variant) => ({
    ...variant,
    storageOptions: variant.storageOptions.map(emptyStorageOption),
  }));
  return {
    ...product,
    variants,
    stock: 0,
    manualArchive: true,
    stockArchived: true,
  };
}

function overlayProduct(product: PremiumProduct, units: OverlayUnit[]): PremiumProduct {
  if (units.length === 0) return archiveProduct(product);

  const clone: PremiumProduct = JSON.parse(JSON.stringify(product));
  const variants = clone.variants ?? [];

  // 1) alles auf 0
  for (const variant of variants) {
    variant.storageOptions = variant.storageOptions.map(emptyStorageOption);
  }

  let total = 0;

  // Für Einzelstücke ohne sichere Farbzuordnung: rundlaufend eine noch
  // unbenutzte Farbvariante vergeben, damit zwei verschiedene Geräte nie in
  // derselben (Farbe·Speicher·Zustand)-Zelle zusammenfallen (sonst würde ein
  // Preis den anderen überschreiben).
  const usedColorIds = new Set<string>();
  let roundRobin = 0;

  // 2) reale eBay-Zellen befüllen
  for (const unit of units) {
    if (unit.quantity <= 0) continue;

    let colorId = matchColorId(clone, unit);
    if (!colorId) {
      const free = variants.find((candidate) => !usedColorIds.has(candidate.id));
      colorId = free?.id ?? variants[roundRobin++ % variants.length]?.id ?? null;
    }
    const variant = variants.find((candidate) => candidate.id === colorId) ?? variants[0];
    if (!variant) continue;
    usedColorIds.add(variant.id);

    const storageOption = matchStorage(variant, unit.storage);
    if (!storageOption) continue;

    const entry = ensureConditionEntry(storageOption, unit.conditionId);
    entry.stock += unit.quantity;
    entry.active = true;
    entry.price = unit.price;
    entry.priceOverride = unit.price;
    entry.ebayItemId = unit.ebayItemId;
    entry.ebayPrice = unit.ebayPrice;
    entry.label = entry.label || CONDITION_LABEL[unit.conditionId];

    storageOption.stock = (storageOption.stock ?? 0) + unit.quantity;
    storageOption.price =
      storageOption.price > 0 ? Math.min(storageOption.price, unit.price) : unit.price;

    total += unit.quantity;
  }

  // Lagernde Farbvariante nach vorne — sonst zeigt die Produktkarte das Bild
  // /den Farbnamen einer ausverkauften Variante (`toCatalogSummary` nimmt
  // `images[0]`).
  const variantStock = (variant: ProductVariant): number =>
    variant.storageOptions.reduce(
      (sum, option) =>
        sum + (option.conditions ?? []).reduce((acc, entry) => acc + Math.max(0, entry.stock), 0),
      0,
    );
  variants.sort((a, b) => (variantStock(b) > 0 ? 1 : 0) - (variantStock(a) > 0 ? 1 : 0));

  clone.variants = variants;
  clone.stock = total;
  clone.mainImage = variants[0]?.image ?? clone.mainImage;
  clone.manualArchive = total <= 0;
  clone.stockArchived = total <= 0;

  return syncStockArchiveState(syncProductVariants(clone));
}

/**
 * Wendet den eBay-Bestand auf den gesamten Gerätekatalog an. Wird nur im
 * Lesepfad (`readServerProducts`) aufgerufen — Schreib-/Bestellpfade
 * arbeiten weiter auf den Rohdaten.
 */
export function applyEbayInventoryOverlay(products: PremiumProduct[]): PremiumProduct[] {
  const bySlug = new Map<string, OverlayUnit[]>();
  for (const { slug, unit } of getEbayOverlayEntries()) {
    if (!slug) continue;
    const list = bySlug.get(slug) ?? [];
    list.push(unit);
    bySlug.set(slug, list);
  }

  return products.map((product) =>
    overlayProduct(product, bySlug.get(product.slug) ?? []),
  );
}

/** Diagnose: eBay-Einzelstücke, die keinem Katalogprodukt zugeordnet werden konnten. */
export function getUnmatchedEbayUnits(): OverlayUnit[] {
  return getEbayOverlayEntries()
    .filter((entry) => !entry.slug)
    .map((entry) => entry.unit);
}

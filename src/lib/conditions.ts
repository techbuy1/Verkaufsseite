import type { ConditionId, ConditionOption, StorageOption } from "@/types/product";

export const CONDITION_IDS = [
  "new",
  "like_new",
  "excellent",
  "very_good",
  "good",
  "heavily_used",
  "poor",
] as const satisfies readonly ConditionId[];

/**
 * Default-Abschläge nur für neu angelegte Zustände (Migration / fehlende Einträge).
 * Manuell gesetzte Preise pro Zustand bleiben unverändert.
 */
export const CONDITION_DISCOUNTS: Record<ConditionId, number> = {
  new: 0,
  like_new: 0.05,
  excellent: 0.1,
  very_good: 0.15,
  good: 0.22,
  heavily_used: 0.32,
  poor: 0.45,
};

export const CONDITION_DEFINITIONS: Record<
  ConditionId,
  { label: string; description: string; skuCode: string }
> = {
  new: {
    label: "Neu",
    description: "Unbenutztes Gerät ohne Gebrauchsspuren.",
    skuCode: "NEW",
  },
  like_new: {
    label: "Wie neu",
    description:
      "Nahezu keine sichtbaren Gebrauchsspuren. Optisch kaum von einem neuen Gerät zu unterscheiden.",
    skuCode: "LN",
  },
  excellent: {
    label: "Hervorragend",
    description:
      "Sehr leichte Gebrauchsspuren möglich, insgesamt ausgezeichnete Optik.",
    skuCode: "EX",
  },
  very_good: {
    label: "Sehr gut",
    description:
      "Leichte sichtbare Gebrauchsspuren wie kleine Kratzer möglich.",
    skuCode: "VG",
  },
  good: {
    label: "Gut",
    description:
      "Normale Gebrauchsspuren und sichtbare Kratzer möglich, technisch vollständig funktionsfähig.",
    skuCode: "GD",
  },
  heavily_used: {
    label: "Stark gebraucht",
    description:
      "Deutlich sichtbare Gebrauchsspuren, Kratzer oder kleinere optische Abnutzungen. Technisch funktionsfähig.",
    skuCode: "HU",
  },
  poor: {
    label: "Schlecht",
    description:
      "Starke optische Gebrauchsspuren. Das Gerät erfüllt trotzdem den auf der Website angegebenen technischen Zustand.",
    skuCode: "PR",
  },
};

export function getConditionLabel(condition: ConditionId): string {
  return CONDITION_DEFINITIONS[condition].label;
}

export function getConditionDescription(condition: ConditionId): string {
  return CONDITION_DEFINITIONS[condition].description;
}

export function isConditionId(value: string | undefined | null): value is ConditionId {
  return Boolean(value && (CONDITION_IDS as readonly string[]).includes(value));
}

function roundPrice(price: number): number {
  if (!Number.isFinite(price)) return 0;
  return Math.round(price * 100) / 100;
}

/** Verkaufspreis aus Neu-Basispreis und zentralem Abschlag. */
export function computeConditionPrice(
  newBasePrice: number,
  condition: ConditionId,
): number {
  const base = roundPrice(newBasePrice);
  if (base <= 0) return 0;
  const discount = CONDITION_DISCOUNTS[condition] ?? 0;
  return roundPrice(base * (1 - discount));
}

/** Absolute Ersparnis gegenüber Neu (0 bei Neu). */
export function getConditionSavings(
  newBasePrice: number,
  condition: ConditionId,
): number {
  const base = roundPrice(newBasePrice);
  const sale = computeConditionPrice(base, condition);
  return roundPrice(Math.max(0, base - sale));
}

export function getConditionDiscountRate(condition: ConditionId): number {
  return CONDITION_DISCOUNTS[condition] ?? 0;
}

/** Basispreis „Neu“ einer Speicheroption. */
export function getNewBasePriceFromOption(option: StorageOption): number {
  const ensured = ensureStorageConditions(option);
  const neu = ensured.conditions?.find((entry) => entry.condition === "new");
  if (neu && neu.price > 0) return roundPrice(neu.price);
  if (ensured.price > 0) return roundPrice(ensured.price);
  return 0;
}

function abbreviateToken(value: string, max = 4): string {
  const cleaned = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "")
    .toUpperCase();
  if (!cleaned) return "X";
  return cleaned.slice(0, max);
}

function abbreviateStorage(storage: string): string {
  const match = storage.match(/(\d+)\s*(GB|TB)/i);
  const size = match ? `${match[1]}${(match[2] ?? "GB").toUpperCase()}` : abbreviateToken(storage, 6);
  // Connectivity-enabled products (iPads) list "128 GB · WLAN" and
  // "128 GB · WLAN + Cellular" as separate storage rows with the same size —
  // without this suffix both collapse to the same SKU ("128GB") and get
  // flagged as duplicates even though they're genuinely different variants.
  return /cellular/i.test(storage) ? `${size}CELL` : size;
}

/**
 * Marketing prefixes shared by every colour of a given model line (Samsung's
 * "Awesome …" A-series, "Titanium …" Ultra series) carry no distinguishing
 * information — abbreviating the raw colour name to a handful of characters
 * collapses "Awesome Black"/"Awesome Violet"/"Awesome White" to the same
 * "AWE" and produces duplicate SKUs across colours. Drop these prefixes
 * before abbreviating so the distinguishing word (Black/Violet/White) is
 * what ends up in the SKU.
 */
const GENERIC_COLOR_WORDS = new Set(["awesome", "titanium", "galaxy"]);

function abbreviateColorName(colorName: string, max = 6): string {
  const words = colorName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const meaningful = words.filter((word) => !GENERIC_COLOR_WORDS.has(word.toLowerCase()));
  const source = (meaningful.length > 0 ? meaningful : words).join("");
  return abbreviateToken(source, max);
}

export function buildVariantSku(params: {
  brand: string;
  model: string;
  colorName: string;
  storage: string;
  condition: ConditionId;
}): string {
  const brand = abbreviateToken(params.brand, 3);
  const model = abbreviateToken(params.model.replace(/iphone/i, "IP"), 6);
  const color = abbreviateColorName(params.colorName);
  const storage = abbreviateStorage(params.storage);
  const condition = CONDITION_DEFINITIONS[params.condition].skuCode;
  return `${brand}-${model}-${color}-${storage}-${condition}`;
}

function normalizeConditionEntry(
  partial: Partial<ConditionOption> | undefined,
  condition: ConditionId,
  fallbackPrice: number,
  fallbackStock: number,
  activeDefault: boolean,
): ConditionOption {
  const def = CONDITION_DEFINITIONS[condition];
  const price =
    typeof partial?.price === "number" && Number.isFinite(partial.price)
      ? roundPrice(partial.price)
      : fallbackPrice;
  const stock =
    typeof partial?.stock === "number" && Number.isFinite(partial.stock)
      ? Math.max(0, Math.floor(partial.stock))
      : fallbackStock;

  return {
    condition,
    label: def.label,
    price,
    stock,
    active: typeof partial?.active === "boolean" ? partial.active : activeDefault,
    note: partial?.note?.trim() ? partial.note.trim() : undefined,
    sku: partial?.sku?.trim() ? partial.sku.trim() : undefined,
  };
}

/**
 * Stellt alle 7 Zustände sicher.
 * Vorhandene Einzelpreise bleiben erhalten — Abschläge nur für neu fehlende Zustände.
 */
export function ensureStorageConditions(
  option: StorageOption,
  fallbackStock = 0,
): StorageOption {
  const legacyPrice =
    typeof option.price === "number" && Number.isFinite(option.price) ? roundPrice(option.price) : 0;
  const legacyStock =
    typeof option.stock === "number" && Number.isFinite(option.stock)
      ? Math.max(0, Math.floor(option.stock))
      : Math.max(0, Math.floor(fallbackStock));

  const existing = new Map<ConditionId, ConditionOption>();
  if (Array.isArray(option.conditions)) {
    for (const entry of option.conditions) {
      if (!isConditionId(entry.condition)) continue;
      existing.set(entry.condition, entry);
    }
  }

  const hasAnyConditions = existing.size > 0;
  const newBaseHint =
    (existing.get("new")?.price && existing.get("new")!.price > 0
      ? existing.get("new")!.price
      : legacyPrice) || 0;

  const conditions = CONDITION_IDS.map((condition) => {
    const current = existing.get(condition);
    if (current) {
      // Früher wurden ungenutzte Zustände mit active:false angelegt — für die
      // Zustandsauswahl aktivieren wir sie, behalten aber den Bestand und Preis.
      const shouldActivate =
        current.active ||
        (current.stock === 0 && current.active === false);
      return normalizeConditionEntry(
        { ...current, active: shouldActivate },
        condition,
        typeof current.price === "number" && current.price > 0
          ? current.price
          : legacyPrice,
        typeof current.stock === "number" ? current.stock : 0,
        true,
      );
    }

    if (!hasAnyConditions && condition === "new") {
      return normalizeConditionEntry(
        { price: legacyPrice, stock: legacyStock, active: true },
        "new",
        legacyPrice,
        legacyStock,
        true,
      );
    }

    // Nur fehlende Zustände: Default-Abschlag vom Neu-/Legacy-Preis.
    const defaultPrice =
      newBaseHint > 0 ? computeConditionPrice(newBaseHint, condition) : 0;
    return normalizeConditionEntry(
      { price: defaultPrice, stock: 0, active: true },
      condition,
      defaultPrice,
      0,
      true,
    );
  });

  const activePriced = conditions.filter((c) => c.active && c.price > 0);
  const derivedPrice =
    activePriced.length > 0
      ? Math.min(...activePriced.map((c) => c.price))
      : legacyPrice ||
        Math.min(...conditions.map((c) => c.price).filter((p) => p > 0), Infinity) ||
        0;

  const derivedStock = conditions
    .filter((c) => c.active)
    .reduce((sum, c) => sum + c.stock, 0);

  return {
    ...option,
    storage: option.storage,
    price: Number.isFinite(derivedPrice) && derivedPrice !== Infinity ? derivedPrice : 0,
    stock: derivedStock,
    conditions,
  };
}

/**
 * Verfügbarer Bestand für einen Zustand.
 * Hat der Zustand keinen eigenen Bestand, darf er den Neu-Bestand nutzen (Shared Pool),
 * damit alle Zustände wählbar sind, sobald Neuware verfügbar ist.
 */
export function getEffectiveConditionStock(
  option: StorageOption,
  condition: ConditionId,
): number {
  const ensured = ensureStorageConditions(option);
  const entry = ensured.conditions?.find((c) => c.condition === condition);
  if (!entry || !entry.active) return 0;
  if (entry.stock > 0) return entry.stock;
  if (condition === "new") return 0;
  const neu = ensured.conditions?.find((c) => c.condition === "new");
  if (neu?.active && neu.stock > 0) return neu.stock;
  return 0;
}

export function getActiveConditions(option: StorageOption): ConditionOption[] {
  const ensured = ensureStorageConditions(option);
  return ensured.conditions!.filter((c) => c.active);
}

export function getPurchasableConditions(option: StorageOption): ConditionOption[] {
  const ensured = ensureStorageConditions(option);
  return (ensured.conditions ?? []).filter(
    (c) =>
      c.active &&
      c.price > 0 &&
      getEffectiveConditionStock(ensured, c.condition) > 0,
  );
}

export function getConditionOption(
  option: StorageOption,
  condition: ConditionId,
): ConditionOption {
  const ensured = ensureStorageConditions(option);
  return (
    ensured.conditions!.find((c) => c.condition === condition) ??
    normalizeConditionEntry(undefined, condition, ensured.price, 0, false)
  );
}

export function getDefaultAvailableCondition(option: StorageOption): ConditionOption {
  const purchasable = getPurchasableConditions(option);
  if (purchasable.length > 0) return purchasable[0];
  const active = getActiveConditions(option);
  if (active.length > 0) return active[0];
  return ensureStorageConditions(option).conditions![0];
}

export function getStorageOptionTotalStock(option: StorageOption, onlyActive = true): number {
  const ensured = ensureStorageConditions(option);
  return ensured.conditions!
    .filter((c) => (onlyActive ? c.active : true))
    .reduce((sum, c) => sum + c.stock, 0);
}

export function getStorageMinAvailablePrice(option: StorageOption): number | null {
  const purchasable = getPurchasableConditions(option);
  if (purchasable.length === 0) return null;
  return Math.min(...purchasable.map((c) => c.price));
}

export function getStorageMinAvailableCondition(option: StorageOption): ConditionOption | null {
  const purchasable = getPurchasableConditions(option);
  if (purchasable.length === 0) return null;
  return purchasable.reduce((min, c) => (c.price < min.price ? c : min));
}

export function applyConditionPatch(
  option: StorageOption,
  condition: ConditionId,
  patch: Partial<Pick<ConditionOption, "price" | "stock" | "active" | "note" | "sku">>,
): StorageOption {
  const ensured = ensureStorageConditions(option);
  const conditions = ensured.conditions!.map((entry) =>
    entry.condition === condition
      ? {
          ...entry,
          ...patch,
          label: CONDITION_DEFINITIONS[condition].label,
          price:
            typeof patch.price === "number" ? roundPrice(patch.price) : entry.price,
          stock:
            typeof patch.stock === "number"
              ? Math.max(0, Math.floor(patch.stock))
              : entry.stock,
          note:
            patch.note !== undefined
              ? patch.note.trim()
                ? patch.note.trim()
                : undefined
              : entry.note,
          sku:
            patch.sku !== undefined
              ? patch.sku.trim()
                ? patch.sku.trim()
                : undefined
              : entry.sku,
        }
      : entry,
  );
  return ensureStorageConditions({ ...ensured, conditions });
}

import type { ConditionId, ConditionOption, StorageOption } from "@/types/product";
import {
  DEFAULT_CONDITION_PERCENTAGES,
  type ConditionPricingRules,
} from "@/lib/conditionPricingRules";

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
 * Default-Prozentsätze des Basispreises (100 = voller Preis).
 * Nur für neu angelegte / regelbasierte Zustände — manuelle Overrides bleiben unberührt.
 * @deprecated Verwende DEFAULT_CONDITION_PERCENTAGES aus conditionPricingRules.ts
 */
export const CONDITION_DISCOUNTS: Record<ConditionId, number> = {
  new: 0,
  like_new: 0.08,
  excellent: 0.15,
  very_good: 0.22,
  good: 0.32,
  heavily_used: 0.45,
  poor: 0.6,
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

function computeRulePrice(
  basePrice: number,
  condition: ConditionId,
  rules: ConditionPricingRules = DEFAULT_CONDITION_PERCENTAGES,
): number {
  const base = roundPrice(basePrice);
  if (base <= 0) return 0;
  const pct = rules[condition] ?? DEFAULT_CONDITION_PERCENTAGES[condition] ?? 100;
  return roundPrice((base * pct) / 100);
}

/** Verkaufspreis aus Neu-Basispreis und zentraler Prozentregel. */
export function computeConditionPrice(
  newBasePrice: number,
  condition: ConditionId,
  rules?: ConditionPricingRules,
): number {
  return computeRulePrice(newBasePrice, condition, rules);
}

/** Absolute Ersparnis gegenüber Neu (0 bei Neu). */
export function getConditionSavings(
  newBasePrice: number,
  condition: ConditionId,
  rules?: ConditionPricingRules,
): number {
  const base = roundPrice(newBasePrice);
  const sale = computeConditionPrice(base, condition, rules);
  return roundPrice(Math.max(0, base - sale));
}

export function getConditionPercentage(
  condition: ConditionId,
  rules: ConditionPricingRules = DEFAULT_CONDITION_PERCENTAGES,
): number {
  return rules[condition] ?? DEFAULT_CONDITION_PERCENTAGES[condition] ?? 100;
}

/** @deprecated Abschlag-Rate — nur Legacy-Kompatibilität */
export function getConditionDiscountRate(condition: ConditionId): number {
  const pct = DEFAULT_CONDITION_PERCENTAGES[condition] ?? 100;
  return roundPrice(Math.max(0, 1 - pct / 100));
}

/** Basispreis „Neu“ einer Speicheroption — ohne ensureStorageConditions (Reentrancy-sicher). */
export function getNewBasePriceFromOption(option: StorageOption): number {
  const neu = option.conditions?.find((entry) => entry.condition === "new");
  if (neu && neu.price > 0) return roundPrice(neu.price);
  if (typeof option.price === "number" && option.price > 0) return roundPrice(option.price);
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
  newBaseHint: number,
  rules: ConditionPricingRules = DEFAULT_CONDITION_PERCENTAGES,
): ConditionOption {
  const def = CONDITION_DEFINITIONS[condition];
  const stock =
    typeof partial?.stock === "number" && Number.isFinite(partial.stock)
      ? Math.max(0, Math.floor(partial.stock))
      : fallbackStock;

  let priceOverride = partial?.priceOverride;
  if (priceOverride === undefined && condition !== "new") {
    const stored =
      typeof partial?.price === "number" && Number.isFinite(partial.price)
        ? roundPrice(partial.price)
        : 0;
    if (stored > 0 && newBaseHint > 0) {
      const rulePrice = computeRulePrice(newBaseHint, condition, rules);
      if (Math.abs(stored - rulePrice) > 0.005) {
        priceOverride = stored;
      }
    }
  }

  const effectivePrice =
    condition === "new"
      ? roundPrice(
          typeof partial?.price === "number" && partial.price > 0
            ? partial.price
            : fallbackPrice,
        )
      : priceOverride != null && priceOverride > 0
        ? roundPrice(priceOverride)
        : computeRulePrice(newBaseHint, condition, rules);

  return {
    condition,
    label: def.label,
    price: effectivePrice,
    stock,
    active: typeof partial?.active === "boolean" ? partial.active : activeDefault,
    note: partial?.note?.trim() ? partial.note.trim() : undefined,
    sku: partial?.sku?.trim() ? partial.sku.trim() : undefined,
    priceOverride:
      condition === "new"
        ? undefined
        : priceOverride === null
          ? null
          : priceOverride,
  };
}

export function getEffectivePriceForConditionEntry(
  option: StorageOption,
  entry: ConditionOption,
  rules: ConditionPricingRules = DEFAULT_CONDITION_PERCENTAGES,
  basePriceHint?: number,
): number {
  const basePrice = basePriceHint ?? getNewBasePriceFromOption(option);

  if (entry.condition === "new") {
    return roundPrice(basePrice);
  }

  if (entry.priceOverride != null && entry.priceOverride > 0) {
    return roundPrice(entry.priceOverride);
  }

  if (entry.priceOverride === null) {
    return computeRulePrice(basePrice, entry.condition, rules);
  }

  if (entry.price > 0 && basePrice > 0) {
    const rulePrice = computeRulePrice(basePrice, entry.condition, rules);
    if (Math.abs(entry.price - rulePrice) > 0.005) {
      return roundPrice(entry.price);
    }
  }

  return computeRulePrice(basePrice, entry.condition, rules);
}

/**
 * Stellt alle 7 Zustände sicher.
 * Vorhandene Einzelpreise bleiben erhalten — Abschläge nur für neu fehlende Zustände.
 */
export function ensureStorageConditions(
  option: StorageOption,
  fallbackStock = 0,
  rules: ConditionPricingRules = DEFAULT_CONDITION_PERCENTAGES,
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
        newBaseHint,
        rules,
      );
    }

    if (!hasAnyConditions && condition === "new") {
      return normalizeConditionEntry(
        { price: legacyPrice, stock: legacyStock, active: true },
        "new",
        legacyPrice,
        legacyStock,
        true,
        newBaseHint,
        rules,
      );
    }

    const defaultPrice =
      newBaseHint > 0 ? computeRulePrice(newBaseHint, condition, rules) : 0;
    return normalizeConditionEntry(
      { price: defaultPrice, stock: 0, active: true, priceOverride: undefined },
      condition,
      defaultPrice,
      0,
      true,
      newBaseHint,
      rules,
    );
  });

  const ensuredOption = { ...option, storage: option.storage, conditions };
  const activePriced = conditions.filter((c) => {
    if (!c.active) return false;
    return getEffectivePriceForConditionEntry(ensuredOption, c, rules, newBaseHint) > 0;
  });
  const derivedPrice =
    activePriced.length > 0
      ? Math.min(
          ...activePriced.map((c) =>
            getEffectivePriceForConditionEntry(ensuredOption, c, rules, newBaseHint),
          ),
        )
      : legacyPrice || 0;

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

export function getPurchasableConditions(
  option: StorageOption,
  rules: ConditionPricingRules = DEFAULT_CONDITION_PERCENTAGES,
): ConditionOption[] {
  const ensured = ensureStorageConditions(option, 0, rules);
  return (ensured.conditions ?? []).filter(
    (c) =>
      c.active &&
      getEffectivePriceForConditionEntry(ensured, c, rules) > 0 &&
      getEffectiveConditionStock(ensured, c.condition) > 0,
  );
}

export function getConditionOption(
  option: StorageOption,
  condition: ConditionId,
): ConditionOption {
  const ensured = ensureStorageConditions(option);
  const base = getNewBasePriceFromOption(ensured);
  return (
    ensured.conditions!.find((c) => c.condition === condition) ??
    normalizeConditionEntry(undefined, condition, ensured.price, 0, false, base)
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

export function getStorageMinAvailablePrice(
  option: StorageOption,
  rules: ConditionPricingRules = DEFAULT_CONDITION_PERCENTAGES,
): number | null {
  const purchasable = getPurchasableConditions(option, rules);
  if (purchasable.length === 0) return null;
  const ensured = ensureStorageConditions(option, 0, rules);
  return Math.min(
    ...purchasable.map((c) => getEffectivePriceForConditionEntry(ensured, c, rules)),
  );
}

export function getStorageMinAvailableCondition(
  option: StorageOption,
  rules: ConditionPricingRules = DEFAULT_CONDITION_PERCENTAGES,
): ConditionOption | null {
  const purchasable = getPurchasableConditions(option, rules);
  if (purchasable.length === 0) return null;
  const ensured = ensureStorageConditions(option, 0, rules);
  return purchasable.reduce((min, c) => {
    const price = getEffectivePriceForConditionEntry(ensured, c, rules);
    const minPrice = getEffectivePriceForConditionEntry(ensured, min, rules);
    return price < minPrice ? c : min;
  });
}

export function applyConditionPatch(
  option: StorageOption,
  condition: ConditionId,
  patch: Partial<
    Pick<ConditionOption, "price" | "priceOverride" | "stock" | "active" | "note" | "sku">
  >,
): StorageOption {
  const ensured = ensureStorageConditions(option);
  const conditions = ensured.conditions!.map((entry) => {
    if (entry.condition !== condition) return entry;

    let priceOverride = entry.priceOverride;
    if (patch.priceOverride !== undefined) {
      priceOverride = patch.priceOverride;
    } else if (typeof patch.price === "number") {
      priceOverride = roundPrice(patch.price);
    }

    return {
      ...entry,
      ...patch,
      label: CONDITION_DEFINITIONS[condition].label,
      priceOverride: condition === "new" ? undefined : priceOverride,
      price:
        condition === "new" && typeof patch.price === "number"
          ? roundPrice(patch.price)
          : entry.price,
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
    };
  });
  return ensureStorageConditions({ ...ensured, conditions });
}

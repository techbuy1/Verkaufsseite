import {
  GALAXY_A57_MODEL_PATH,
  GALAXY_S26_ULTRA_MODEL_PATH,
  IPHONE_17_PRO_MODEL_PATH,
} from "@/components/product3d/constants";

const STORAGE_KEY = "techbuy-admin-top-deal-v1";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export interface TopDealProductOption {
  productId: string;
  slug: string;
  label: string;
  modelPath: string;
}

/** Curated to the products that currently have a real 360°/3D model. */
export const TOP_DEAL_PRODUCT_OPTIONS: TopDealProductOption[] = [
  { productId: "samsung-galaxy-a57", slug: "galaxy-a57", label: "Galaxy A57", modelPath: GALAXY_A57_MODEL_PATH },
  { productId: "offer-iphone", slug: "iphone-17-pro", label: "iPhone 17 Pro", modelPath: IPHONE_17_PRO_MODEL_PATH },
  { productId: "offer-samsung", slug: "galaxy-s26-ultra", label: "Galaxy S26 Ultra", modelPath: GALAXY_S26_ULTRA_MODEL_PATH },
];

export interface TopDealConfig {
  productId: string;
  colorId?: string;
  storage?: string;
  discountPercent: number;
  badgeLabel: string;
  headline: string;
  /** ISO timestamp — countdown target. */
  endsAt: string;
  active: boolean;
}

function getSeedConfig(): TopDealConfig {
  return {
    productId: "samsung-galaxy-a57",
    colorId: "icy-blue",
    storage: "128 GB",
    discountPercent: 15,
    badgeLabel: "Top Deal der Woche",
    headline: "Diese Woche stark reduziert.",
    endsAt: new Date(Date.now() + WEEK_MS).toISOString(),
    active: true,
  };
}

function normalizeConfig(raw: Partial<TopDealConfig> | null): TopDealConfig {
  const seed = getSeedConfig();
  if (!raw) return seed;
  return {
    productId: raw.productId ?? seed.productId,
    colorId: raw.colorId ?? seed.colorId,
    storage: raw.storage ?? seed.storage,
    discountPercent:
      typeof raw.discountPercent === "number" && raw.discountPercent >= 0 && raw.discountPercent <= 90
        ? raw.discountPercent
        : seed.discountPercent,
    badgeLabel: raw.badgeLabel || seed.badgeLabel,
    headline: raw.headline || seed.headline,
    endsAt: raw.endsAt && !Number.isNaN(Date.parse(raw.endsAt)) ? raw.endsAt : seed.endsAt,
    active: typeof raw.active === "boolean" ? raw.active : seed.active,
  };
}

export function loadTopDeal(): TopDealConfig {
  if (typeof window === "undefined") return getSeedConfig();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = getSeedConfig();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return normalizeConfig(JSON.parse(raw) as Partial<TopDealConfig>);
  } catch {
    return getSeedConfig();
  }
}

export function saveTopDeal(config: TopDealConfig): TopDealConfig {
  const normalized = normalizeConfig(config);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  }
  return normalized;
}

export function resetTopDealToSeed(): TopDealConfig {
  const seed = getSeedConfig();
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  }
  return seed;
}

import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import {
  setActiveGadgetPriceOverrides,
  type GadgetPriceOverrides,
} from "@/lib/gadgetPricing";

const DATA_DIR = path.join(process.cwd(), ".data");
const OVERRIDES_FILE = path.join(DATA_DIR, "gadget-price-overrides.json");

function normalizeOverrides(raw: unknown): GadgetPriceOverrides {
  if (!raw || typeof raw !== "object") return {};
  const normalized: GadgetPriceOverrides = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      normalized[id] = Math.round(value * 100) / 100;
    }
  }
  return normalized;
}

export async function readServerGadgetPriceOverrides(): Promise<GadgetPriceOverrides> {
  try {
    const raw = await readFile(OVERRIDES_FILE, "utf8");
    const normalized = normalizeOverrides(JSON.parse(raw));
    setActiveGadgetPriceOverrides(normalized);
    return normalized;
  } catch {
    setActiveGadgetPriceOverrides({});
    return {};
  }
}

export async function writeServerGadgetPriceOverrides(
  overrides: GadgetPriceOverrides,
): Promise<GadgetPriceOverrides> {
  const normalized = normalizeOverrides(overrides);
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(OVERRIDES_FILE, JSON.stringify(normalized, null, 2), "utf8");
  setActiveGadgetPriceOverrides(normalized);
  return normalized;
}

/** Setzt genau ein Produkt auf einen manuellen Preis oder entfernt den Override (value=null → Basispreis gilt wieder). */
export async function setServerGadgetPriceOverride(
  productId: string,
  value: number | null,
): Promise<GadgetPriceOverrides> {
  const current = await readServerGadgetPriceOverrides();
  const next = { ...current };
  if (value == null) {
    delete next[productId];
  } else {
    next[productId] = Math.round(value * 100) / 100;
  }
  return writeServerGadgetPriceOverrides(next);
}

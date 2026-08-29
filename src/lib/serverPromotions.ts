import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { setActivePromotions, type Promotion } from "@/lib/promotions";

const DATA_DIR = path.join(process.cwd(), ".data");
const PROMOTIONS_FILE = path.join(DATA_DIR, "promotions.json");

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `promo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readPromotionsFile(): Promise<Promotion[]> {
  try {
    const raw = await readFile(PROMOTIONS_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Promotion[]) : [];
  } catch {
    return [];
  }
}

async function writePromotionsFile(promotions: Promotion[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(PROMOTIONS_FILE, JSON.stringify(promotions, null, 2), "utf8");
}

/** Lädt alle Angebote und macht sie für die zentrale Pricing-Engine (getProductPrice etc.) verfügbar. */
export async function readServerPromotions(): Promise<Promotion[]> {
  const promotions = await readPromotionsFile();
  setActivePromotions(promotions);
  return promotions;
}

export async function createServerPromotion(
  input: Omit<Promotion, "id" | "createdAt" | "updatedAt">,
): Promise<Promotion> {
  const promotions = await readPromotionsFile();
  const now = new Date().toISOString();
  const promotion: Promotion = {
    ...input,
    id: createId(),
    createdAt: now,
    updatedAt: now,
  };
  promotions.unshift(promotion);
  await writePromotionsFile(promotions);
  setActivePromotions(promotions);
  return promotion;
}

export async function updateServerPromotion(
  id: string,
  patch: Partial<Omit<Promotion, "id" | "createdAt">>,
): Promise<Promotion | null> {
  const promotions = await readPromotionsFile();
  const index = promotions.findIndex((entry) => entry.id === id);
  if (index < 0) return null;

  const next: Promotion = {
    ...promotions[index],
    ...patch,
    id: promotions[index].id,
    createdAt: promotions[index].createdAt,
    updatedAt: new Date().toISOString(),
  };
  promotions[index] = next;
  await writePromotionsFile(promotions);
  setActivePromotions(promotions);
  return next;
}

import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { PremiumProduct } from "@/types/product";
import { getSeedProducts, normalizeProduct } from "@/lib/productStore";

const DATA_DIR = path.join(process.cwd(), ".data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products-catalog.json");

export type ServerCatalogResult = {
  products: PremiumProduct[];
  /** True when admin-saved catalog exists on disk. */
  persisted: boolean;
};

function mergeWithSeed(stored: PremiumProduct[]): PremiumProduct[] {
  const seed = getSeedProducts();
  const byId = new Map(stored.map((product) => [product.id, product]));
  const bySlug = new Map(stored.map((product) => [product.slug, product]));

  const merged = seed.map(
    (product) => byId.get(product.id) ?? bySlug.get(product.slug) ?? product,
  );

  for (const product of stored) {
    if (!merged.some((entry) => entry.id === product.id || entry.slug === product.slug)) {
      merged.push(product);
    }
  }

  return merged;
}

/**
 * Server catalog for checkout + shop hydration.
 * Admin saves overwrite seed prices; missing products fall back to seed.
 */
export async function readServerProducts(): Promise<ServerCatalogResult> {
  try {
    const raw = await readFile(PRODUCTS_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return { products: getSeedProducts(), persisted: false };
    }
    const normalized = (parsed as PremiumProduct[]).map(normalizeProduct);
    return { products: mergeWithSeed(normalized), persisted: true };
  } catch {
    return { products: getSeedProducts(), persisted: false };
  }
}

export async function writeServerProducts(
  products: PremiumProduct[],
): Promise<PremiumProduct[]> {
  if (!Array.isArray(products) || products.length === 0) {
    throw new Error("Produktkatalog darf nicht leer sein.");
  }

  const normalized = products.map(normalizeProduct);
  const merged = mergeWithSeed(normalized);
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(PRODUCTS_FILE, JSON.stringify(merged, null, 2), "utf8");
  return merged;
}

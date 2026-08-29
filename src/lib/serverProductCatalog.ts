import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import type { PremiumProduct } from "@/types/product";
import { getSeedProducts, normalizeProduct } from "@/lib/productStore";
import {
  getDefaultAvailableColorId,
  getDefaultAvailableConditionId,
  getDefaultAvailableStorage,
  getVariantStock,
  reduceVariantStock,
  syncStockArchiveState,
  type CheckoutLineItem,
} from "@/lib/productAvailability";
import { isConditionId } from "@/lib/conditions";
import { syncProductVariants } from "@/lib/productVariants";

const DATA_DIR = path.join(process.cwd(), ".data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products-catalog.json");
const PRODUCTS_LOCK_FILE = path.join(DATA_DIR, "products-catalog.lock");

/**
 * Cross-process file lock (same pattern as order/invoice numbering in
 * orderNumbers.ts) — required so concurrent order fulfillments (Stripe
 * webhook, Stripe confirm-poll, PayPal webhook/capture can all race for the
 * same order) never interleave their read-modify-write of the stock file
 * and silently drop a decrement.
 */
async function withProductsLock<T>(fn: () => Promise<T>): Promise<T> {
  await mkdir(DATA_DIR, { recursive: true });

  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      await writeFile(PRODUCTS_LOCK_FILE, `${process.pid}-${Date.now()}`, {
        flag: "wx",
      });
      try {
        return await fn();
      } finally {
        await unlink(PRODUCTS_LOCK_FILE).catch(() => undefined);
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 25 + attempt * 5));
    }
  }

  throw new Error("Produktkatalog ist vorübergehend gesperrt.");
}

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

  return withProductsLock(async () => {
    const merged = mergeWithSeed(normalized);
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(PRODUCTS_FILE, JSON.stringify(merged, null, 2), "utf8");
    return merged;
  });
}

async function readProductsFileUnlocked(): Promise<PremiumProduct[] | null> {
  try {
    const raw = await readFile(PRODUCTS_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return mergeWithSeed((parsed as PremiumProduct[]).map(normalizeProduct));
  } catch {
    return null;
  }
}

export interface StockDeductionResult {
  products: PremiumProduct[];
  /** Lines whose stock was already 0 (or below the requested quantity) at deduction time. */
  oversold: CheckoutLineItem[];
}

/**
 * Single source of truth for reducing stock after a PAID order — called
 * once per order (guarded by the caller's idempotency check) from the
 * Stripe and PayPal fulfillment paths.
 *
 * Runs the read → decrement → write cycle inside {@link withProductsLock}
 * so two orders that finish paying at the same moment (e.g. the last unit
 * bought by two customers) always see each other's decrement instead of
 * both reading the same pre-sale stock value — the "conditional update"
 * needed to prevent overselling on this file-backed catalog.
 */
export async function deductServerStockForOrder(
  items: CheckoutLineItem[],
): Promise<StockDeductionResult> {
  return withProductsLock(async () => {
    const current = await readProductsFileUnlocked();
    if (!current) {
      // No admin-persisted catalog yet — nothing to decrement against.
      return { products: getSeedProducts(), oversold: [] };
    }

    let products = current;
    const oversold: CheckoutLineItem[] = [];

    for (const item of items) {
      products = products.map((product) => {
        if (product.id !== item.productId) return product;

        const colorRef = item.colorId ?? item.color ?? item.colorName;
        const colorId =
          (colorRef
            ? product.images.find(
                (image) => image.id === colorRef || image.colorName === colorRef,
              )?.id
            : undefined) ?? product.images[0]?.id;

        // Resolve exactly the same variant reduceVariantStock() will target,
        // so we can tell whether it actually had enough stock beforehand.
        const synced = syncProductVariants(product);
        const resolvedColorId = colorId ?? getDefaultAvailableColorId(synced);
        const resolvedStorage =
          item.storage ?? getDefaultAvailableStorage(synced, resolvedColorId).storage;
        const resolvedCondition = isConditionId(item.condition)
          ? item.condition
          : getDefaultAvailableConditionId(synced, resolvedColorId, resolvedStorage);
        const priorStock = getVariantStock(
          synced,
          resolvedColorId,
          resolvedStorage,
          resolvedCondition,
        );

        if (priorStock < item.quantity) {
          oversold.push(item);
        }

        return reduceVariantStock(
          product,
          colorId,
          item.storage,
          item.quantity,
          isConditionId(item.condition) ? item.condition : undefined,
        );
      });
    }

    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(
      PRODUCTS_FILE,
      JSON.stringify(products.map(syncStockArchiveState), null, 2),
      "utf8",
    );

    return { products: products.map(syncStockArchiveState), oversold };
  });
}

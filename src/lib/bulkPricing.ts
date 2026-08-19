import type { ConditionId, PremiumProduct } from "@/types/product";
import { CONDITION_IDS, ensureStorageConditions, getConditionLabel } from "@/lib/conditions";
import { syncProductVariants } from "@/lib/productVariants";

export interface VariantRow {
  key: string;
  productId: string;
  brand: string;
  model: string;
  name: string;
  colorId: string;
  colorName: string;
  storage: string;
  condition: ConditionId;
  conditionLabel: string;
  price: number;
  stock: number;
  active: boolean;
  sku?: string;
  note?: string;
}

export type BulkPriceMode = "set" | "add" | "subtract" | "add_percent" | "subtract_percent";

export interface BulkPriceChange {
  mode: BulkPriceMode;
  value: number;
}

export interface BulkPreviewRow {
  key: string;
  label: string;
  from: number;
  to: number;
}

export interface BulkFilters {
  brand?: string;
  model?: string;
  color?: string;
  storage?: string;
  condition?: ConditionId | "";
  availability?: "all" | "in_stock" | "out_of_stock" | "active" | "inactive";
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
}

function roundPrice(price: number): number {
  return Math.round(Math.max(0, price) * 100) / 100;
}

export function flattenVariantRows(products: PremiumProduct[]): VariantRow[] {
  const rows: VariantRow[] = [];

  for (const product of products) {
    const synced = syncProductVariants(product);
    for (const variant of synced.variants ?? []) {
      for (const option of variant.storageOptions) {
        const ensured = ensureStorageConditions(option);
        for (const condition of ensured.conditions ?? []) {
          rows.push({
            key: `${product.id}__${variant.id}__${option.storage}__${condition.condition}`,
            productId: product.id,
            brand: product.brand,
            model: product.model || product.name,
            name: product.name,
            colorId: variant.id,
            colorName: variant.colorName,
            storage: option.storage,
            condition: condition.condition,
            conditionLabel: condition.label || getConditionLabel(condition.condition),
            price: condition.price,
            stock: condition.stock,
            active: condition.active,
            sku: condition.sku,
            note: condition.note,
          });
        }
      }
    }
  }

  return rows;
}

export function filterVariantRows(rows: VariantRow[], filters: BulkFilters): VariantRow[] {
  return rows.filter((row) => {
    if (filters.brand && row.brand !== filters.brand) return false;
    if (filters.model && row.model !== filters.model && row.name !== filters.model) {
      return false;
    }
    if (filters.color && row.colorName !== filters.color) return false;
    if (filters.storage && row.storage !== filters.storage) return false;
    if (filters.condition && row.condition !== filters.condition) return false;
    if (typeof filters.minPrice === "number" && row.price < filters.minPrice) return false;
    if (typeof filters.maxPrice === "number" && row.price > filters.maxPrice) return false;
    if (typeof filters.minStock === "number" && row.stock < filters.minStock) return false;
    if (typeof filters.maxStock === "number" && row.stock > filters.maxStock) return false;

    switch (filters.availability) {
      case "in_stock":
        if (!(row.active && row.stock > 0)) return false;
        break;
      case "out_of_stock":
        if (row.stock > 0) return false;
        break;
      case "active":
        if (!row.active) return false;
        break;
      case "inactive":
        if (row.active) return false;
        break;
      default:
        break;
    }

    return true;
  });
}

export function computeBulkPrice(current: number, change: BulkPriceChange): number {
  const value = Number.isFinite(change.value) ? change.value : 0;
  switch (change.mode) {
    case "set":
      return roundPrice(value);
    case "add":
      return roundPrice(current + value);
    case "subtract":
      return roundPrice(current - value);
    case "add_percent":
      return roundPrice(current * (1 + value / 100));
    case "subtract_percent":
      return roundPrice(current * (1 - value / 100));
    default:
      return roundPrice(current);
  }
}

export function previewBulkPriceChange(
  rows: VariantRow[],
  change: BulkPriceChange,
): BulkPreviewRow[] {
  return rows.map((row) => ({
    key: row.key,
    label: `${row.brand} ${row.name} ${row.colorName} ${row.storage} ${row.conditionLabel}`,
    from: row.price,
    to: computeBulkPrice(row.price, change),
  }));
}

export function applyBulkPriceChangeToProducts(
  products: PremiumProduct[],
  keys: Set<string>,
  change: BulkPriceChange,
): PremiumProduct[] {
  return products.map((product) => {
    const synced = syncProductVariants(product);
    let touched = false;

    const variants = (synced.variants ?? []).map((variant) => ({
      ...variant,
      storageOptions: variant.storageOptions.map((option) => {
        const ensured = ensureStorageConditions(option);
        const conditions = (ensured.conditions ?? []).map((entry) => {
          const key = `${product.id}__${variant.id}__${option.storage}__${entry.condition}`;
          if (!keys.has(key)) return entry;
          touched = true;
          return {
            ...entry,
            price: computeBulkPrice(entry.price, change),
          };
        });
        return ensureStorageConditions({ ...ensured, conditions });
      }),
    }));

    if (!touched) return product;
    return syncProductVariants({ ...synced, variants });
  });
}

export function applyInlineVariantPatch(
  products: PremiumProduct[],
  key: string,
  patch: Partial<Pick<VariantRow, "price" | "stock" | "active">>,
): PremiumProduct[] {
  return products.map((product) => {
    const synced = syncProductVariants(product);
    let touched = false;

    const variants = (synced.variants ?? []).map((variant) => ({
      ...variant,
      storageOptions: variant.storageOptions.map((option) => {
        const ensured = ensureStorageConditions(option);
        const conditions = (ensured.conditions ?? []).map((entry) => {
          const rowKey = `${product.id}__${variant.id}__${option.storage}__${entry.condition}`;
          if (rowKey !== key) return entry;
          touched = true;
          return {
            ...entry,
            price:
              typeof patch.price === "number" ? roundPrice(patch.price) : entry.price,
            stock:
              typeof patch.stock === "number"
                ? Math.max(0, Math.floor(patch.stock))
                : entry.stock,
            active: typeof patch.active === "boolean" ? patch.active : entry.active,
          };
        });
        return ensureStorageConditions({ ...ensured, conditions });
      }),
    }));

    if (!touched) return product;
    return syncProductVariants({ ...synced, variants });
  });
}

export function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "de"));
}

export { CONDITION_IDS };

/**
 * Demo inventory repository — in-memory session state.
 * Replace with PostgreSQL/Supabase repository for production.
 */
import type {
  InventoryItem,
  InventoryMovement,
  InventoryMovementReason,
  StockAdjustAction,
} from "@/types/admin";
import { getStockStatus } from "@/types/admin";

export function computeInventoryStats(items: InventoryItem[]) {
  const totalStockUnits = items.reduce((sum, item) => sum + item.stock, 0);
  const lowStockCount = items.filter(
    (item) => getStockStatus(item.stock, item.minStock) === "low_stock",
  ).length;
  const outOfStockCount = items.filter((item) => item.stock <= 0).length;
  const inventoryValue = items.reduce(
    (sum, item) => sum + item.stock * item.purchasePrice,
    0,
  );

  return { totalStockUnits, lowStockCount, outOfStockCount, inventoryValue };
}

export function adjustStock(
  items: InventoryItem[],
  itemId: string,
  action: StockAdjustAction,
  quantity: number,
  reason: InventoryMovementReason,
  note?: string,
): { items: InventoryItem[]; movement: InventoryMovement | null } {
  const index = items.findIndex((item) => item.id === itemId);
  if (index === -1) return { items, movement: null };

  const item = items[index];
  const previousStock = item.stock;
  let newStock = previousStock;

  if (action === "add") newStock = previousStock + quantity;
  if (action === "remove") newStock = Math.max(0, previousStock - quantity);
  if (action === "set") newStock = Math.max(0, quantity);

  const updated = [...items];
  updated[index] = { ...item, stock: newStock };

  const movement: InventoryMovement = {
    id: `mov-${Date.now()}`,
    inventoryItemId: itemId,
    action,
    quantity,
    reason,
    note,
    previousStock,
    newStock,
    createdAt: new Date().toISOString(),
  };

  return { items: updated, movement };
}

export function incrementStock(
  items: InventoryItem[],
  itemId: string,
  delta: number,
): InventoryItem[] {
  return adjustStock(items, itemId, delta > 0 ? "add" : "remove", Math.abs(delta), "inventory_correction").items;
}

export type InventoryFilter =
  | "all"
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | string;

export function filterInventoryItems(
  items: InventoryItem[],
  search: string,
  filter: InventoryFilter,
): InventoryItem[] {
  const query = search.trim().toLowerCase();

  return items.filter((item) => {
    const status = getStockStatus(item.stock, item.minStock);

    if (filter === "in_stock" && status !== "in_stock") return false;
    if (filter === "low_stock" && status !== "low_stock") return false;
    if (filter === "out_of_stock" && status !== "out_of_stock") return false;
    if (filter.startsWith("cat-") && item.categoryId !== filter) return false;

    if (!query) return true;

    return (
      item.productName.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query) ||
      item.variantLabel.toLowerCase().includes(query)
    );
  });
}

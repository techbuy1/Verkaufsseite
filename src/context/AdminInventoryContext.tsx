"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { InventoryItem, InventoryMovementReason, LowStockAlert, StockAdjustAction } from "@/types/admin";
import { getStockStatus } from "@/types/admin";
import { DEMO_INVENTORY, DEMO_LOW_STOCK_ALERTS } from "@/data/admin/demoData";
import {
  adjustStock,
  computeInventoryStats,
  incrementStock,
} from "@/lib/admin/inventoryRepository";

interface AdminInventoryContextValue {
  inventory: InventoryItem[];
  stats: ReturnType<typeof computeInventoryStats>;
  lowStockAlerts: LowStockAlert[];
  updateStock: (
    itemId: string,
    action: StockAdjustAction,
    quantity: number,
    reason: InventoryMovementReason,
    note?: string,
  ) => void;
  quickAdjust: (itemId: string, delta: number) => void;
  goodsReceipt: (
    itemId: string,
    quantity: number,
    purchasePrice: number,
    note?: string,
  ) => void;
}

const AdminInventoryContext = createContext<AdminInventoryContextValue | null>(null);

export function AdminInventoryProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventory] = useState<InventoryItem[]>(DEMO_INVENTORY);

  const stats = useMemo(() => computeInventoryStats(inventory), [inventory]);

  const lowStockAlerts = useMemo(() => {
    return inventory
      .filter((item) => getStockStatus(item.stock, item.minStock) === "low_stock")
      .map((item) => ({
        id: item.id,
        productName: item.productName,
        variantLabel: item.variantLabel,
        stock: item.stock,
        minStock: item.minStock,
      }))
      .slice(0, 8);
  }, [inventory]);

  const updateStock = useCallback(
    (
      itemId: string,
      action: StockAdjustAction,
      quantity: number,
      reason: InventoryMovementReason,
      note?: string,
    ) => {
      setInventory((prev) => adjustStock(prev, itemId, action, quantity, reason, note).items);
    },
    [],
  );

  const quickAdjust = useCallback((itemId: string, delta: number) => {
    setInventory((prev) => incrementStock(prev, itemId, delta));
  }, []);

  const goodsReceipt = useCallback(
    (itemId: string, quantity: number, purchasePrice: number, note?: string) => {
      setInventory((prev) => {
        const result = adjustStock(prev, itemId, "add", quantity, "goods_receipt", note);
        return result.items.map((item) =>
          item.id === itemId ? { ...item, purchasePrice } : item,
        );
      });
    },
    [],
  );

  const value = useMemo(
    () => ({
      inventory,
      stats,
      lowStockAlerts: lowStockAlerts.length > 0 ? lowStockAlerts : DEMO_LOW_STOCK_ALERTS,
      updateStock,
      quickAdjust,
      goodsReceipt,
    }),
    [inventory, stats, lowStockAlerts, updateStock, quickAdjust, goodsReceipt],
  );

  return (
    <AdminInventoryContext.Provider value={value}>
      {children}
    </AdminInventoryContext.Provider>
  );
}

export function useAdminInventory() {
  const context = useContext(AdminInventoryContext);
  if (!context) {
    throw new Error("useAdminInventory must be used within AdminInventoryProvider");
  }
  return context;
}

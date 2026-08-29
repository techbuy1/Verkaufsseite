"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useAdminInventory } from "@/context/AdminInventoryContext";
import { getCategoryName } from "@/data/admin/demoData";
import { filterInventoryItems, type InventoryFilter } from "@/lib/admin/inventoryRepository";
import { formatCurrency, getStockStatus } from "@/types/admin";
import { AdminIcon } from "./AdminIcons";
import { GoodsReceiptModal } from "./GoodsReceiptModal";
import { StatCard } from "./StatCard";
import { StatusBadge } from "./StatusBadge";
import { StockAdjustModal } from "./StockAdjustModal";
import type { InventoryItem } from "@/types/admin";

const filters: { value: InventoryFilter; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "in_stock", label: "Auf Lager" },
  { value: "low_stock", label: "Wenig Bestand" },
  { value: "out_of_stock", label: "Ausverkauft" },
  { value: "cat-smartphones", label: "Smartphones" },
  { value: "cat-tablets", label: "Tablets" },
  { value: "cat-smartwatches", label: "Smartwatches" },
  { value: "cat-laptops", label: "Laptops" },
  { value: "cat-accessories", label: "Zubehör" },
];

export function InventoryPageContent() {
  const { inventory, stats, updateStock, quickAdjust, goodsReceipt } = useAdminInventory();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<InventoryFilter>("all");
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const filtered = useMemo(
    () => filterInventoryItems(inventory, search, filter),
    [inventory, search, filter],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="admin-page-title">Lagerbestand</h1>
          <p className="admin-page-subtitle">Demo-Daten — Änderungen nur in dieser Sitzung</p>
        </div>
        <button
          onClick={() => setReceiptOpen(true)}
          className="btn-techbuy-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[13px]"
        >
          <AdminIcon name="plus" className="h-4 w-4" />
          Wareneingang
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Gesamtbestand" value={String(stats.totalStockUnits)} />
        <StatCard label="Niedriger Bestand" value={String(stats.lowStockCount)} accent="warning" />
        <StatCard label="Ausverkauft" value={String(stats.outOfStockCount)} accent="danger" />
        <StatCard label="Lagerwert" value={formatCurrency(stats.inventoryValue)} />
      </div>

      <div className="admin-panel md:p-5">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Produkt oder SKU suchen..."
          className="shop-admin-control mb-4"
        />
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`admin-filter-chip ${filter === f.value ? "is-active" : ""}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
          <table className="admin-table min-w-[900px]">
            <thead>
              <tr>
                <th>Bild</th>
                <th>Produkt</th>
                <th>SKU</th>
                <th>Kategorie</th>
                <th>EK</th>
                <th>VK</th>
                <th>Bestand</th>
                <th>Status</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const status = getStockStatus(item.stock, item.minStock);
                return (
                  <tr key={item.id}>
                    <td>
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-background-secondary">
                        <Image src={item.image} alt="" fill className="object-contain p-1" />
                      </div>
                    </td>
                    <td>
                      <p className="font-medium text-text-primary">{item.productName}</p>
                      <p className="text-[12px] text-text-secondary">{item.variantLabel}</p>
                    </td>
                    <td className="font-mono text-[13px]">{item.sku}</td>
                    <td className="px-4 py-3">{getCategoryName(item.categoryId)}</td>
                    <td className="px-4 py-3">{formatCurrency(item.purchasePrice)}</td>
                    <td className="px-4 py-3">{formatCurrency(item.salePrice)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => quickAdjust(item.id, -1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d2d2d7]/60 hover:bg-[#f5f5f7]"
                          aria-label="Bestand reduzieren"
                        >
                          −
                        </button>
                        <span className="min-w-[2rem] text-center font-semibold">{item.stock}</span>
                        <button
                          onClick={() => quickAdjust(item.id, 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d2d2d7]/60 hover:bg-[#f5f5f7]"
                          aria-label="Bestand erhöhen"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setAdjustItem(item)}
                        className="text-[13px] font-medium text-accent hover:underline"
                      >
                        Bestand anpassen
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <StockAdjustModal
        open={!!adjustItem}
        onClose={() => setAdjustItem(null)}
        item={adjustItem}
        onSubmit={(action, quantity, reason, note) => {
          if (adjustItem) updateStock(adjustItem.id, action, quantity, reason, note);
        }}
      />

      <GoodsReceiptModal
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        items={inventory}
        onSubmit={goodsReceipt}
      />
    </div>
  );
}

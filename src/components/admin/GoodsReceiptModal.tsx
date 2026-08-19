"use client";

import { useMemo, useState } from "react";
import type { InventoryItem } from "@/types/admin";
import { AdminModal } from "./AdminModal";

interface GoodsReceiptModalProps {
  open: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onSubmit: (itemId: string, quantity: number, purchasePrice: number, note?: string) => void;
}

export function GoodsReceiptModal({ open, onClose, items, onSubmit }: GoodsReceiptModalProps) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? "");
  const [quantity, setQuantity] = useState(20);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [supplier, setSupplier] = useState("");
  const [note, setNote] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.productName.toLowerCase().includes(q) ||
        i.sku.toLowerCase().includes(q),
    );
  }, [items, search]);

  const selected = items.find((i) => i.id === selectedId) ?? items[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    onSubmit(selected.id, quantity, purchasePrice || selected.purchasePrice, note || supplier || undefined);
    onClose();
  };

  return (
    <AdminModal open={open} onClose={onClose} title="Wareneingang buchen" wide>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-[13px] font-medium">Produkt suchen</label>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name oder SKU..."
            className="w-full rounded-xl border border-[#d2d2d7]/60 px-4 py-2.5 text-[14px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium">Produkt</label>
          <select
            value={selectedId}
            onChange={(e) => {
              setSelectedId(e.target.value);
              const item = items.find((i) => i.id === e.target.value);
              if (item) setPurchasePrice(item.purchasePrice);
            }}
            className="w-full rounded-xl border border-[#d2d2d7]/60 px-4 py-2.5 text-[14px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            {filtered.map((item) => (
              <option key={item.id} value={item.id}>
                {item.productName} · {item.variantLabel} ({item.sku})
              </option>
            ))}
          </select>
        </div>

        {selected && (
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-[#f5f5f7] p-4">
            <div>
              <p className="text-[12px] text-[#6e6e73]">SKU</p>
              <p className="font-medium">{selected.sku}</p>
            </div>
            <div>
              <p className="text-[12px] text-[#6e6e73]">Aktuell</p>
              <p className="font-medium">{selected.stock}</p>
            </div>
            <div>
              <p className="text-[12px] text-[#6e6e73]">Neue Lieferung</p>
              <p className="font-medium text-accent">{quantity}</p>
            </div>
            <div>
              <p className="text-[12px] text-[#6e6e73]">Neuer Bestand</p>
              <p className="font-bold text-[#1d1d1f]">{selected.stock + quantity}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium">Gelieferte Menge</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full rounded-xl border border-[#d2d2d7]/60 px-4 py-2.5 text-[14px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium">Einkaufspreis (€)</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={purchasePrice || selected?.purchasePrice || 0}
              onChange={(e) => setPurchasePrice(Number(e.target.value))}
              className="w-full rounded-xl border border-[#d2d2d7]/60 px-4 py-2.5 text-[14px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium">Lieferant</label>
          <input
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className="w-full rounded-xl border border-[#d2d2d7]/60 px-4 py-2.5 text-[14px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium">Notiz</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-[#d2d2d7]/60 px-4 py-2.5 text-[14px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-accent py-3 text-[14px] font-medium text-white hover:bg-accent-hover transition-colors"
        >
          Wareneingang buchen
        </button>
      </form>
    </AdminModal>
  );
}

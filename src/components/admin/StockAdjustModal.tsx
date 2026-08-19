"use client";

import { useState } from "react";
import type { InventoryItem, InventoryMovementReason, StockAdjustAction } from "@/types/admin";
import { AdminModal } from "./AdminModal";

interface StockAdjustModalProps {
  open: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onSubmit: (
    action: StockAdjustAction,
    quantity: number,
    reason: InventoryMovementReason,
    note?: string,
  ) => void;
}

const reasons: { value: InventoryMovementReason; label: string }[] = [
  { value: "goods_receipt", label: "Wareneingang" },
  { value: "sale", label: "Verkauf" },
  { value: "return", label: "Rückgabe" },
  { value: "inventory_correction", label: "Inventurkorrektur" },
  { value: "damaged", label: "Beschädigt" },
  { value: "other", label: "Sonstiges" },
];

const actions: { value: StockAdjustAction; label: string }[] = [
  { value: "add", label: "Bestand hinzufügen" },
  { value: "remove", label: "Bestand entfernen" },
  { value: "set", label: "Bestand festlegen" },
];

export function StockAdjustModal({ open, onClose, item, onSubmit }: StockAdjustModalProps) {
  const [action, setAction] = useState<StockAdjustAction>("add");
  const [quantity, setQuantity] = useState(10);
  const [reason, setReason] = useState<InventoryMovementReason>("goods_receipt");
  const [note, setNote] = useState("");

  if (!item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(action, quantity, reason, note || undefined);
    onClose();
  };

  return (
    <AdminModal open={open} onClose={onClose} title="Bestand anpassen">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <p className="text-[12px] text-[#6e6e73]">Produkt</p>
          <p className="text-[15px] font-medium text-[#1d1d1f]">
            {item.productName} · {item.variantLabel}
          </p>
        </div>
        <div>
          <p className="text-[12px] text-[#6e6e73]">Aktueller Bestand</p>
          <p className="text-[24px] font-bold text-[#1d1d1f]">{item.stock}</p>
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#1d1d1f]">Aktion</label>
          <div className="space-y-2">
            {actions.map((a) => (
              <label key={a.value} className="flex items-center gap-2 text-[14px]">
                <input
                  type="radio"
                  name="action"
                  checked={action === a.value}
                  onChange={() => setAction(a.value)}
                  className="accent-accent"
                />
                {a.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#1d1d1f]">Menge</label>
          <input
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full rounded-xl border border-[#d2d2d7]/60 px-4 py-2.5 text-[14px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#1d1d1f]">Grund</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as InventoryMovementReason)}
            className="w-full rounded-xl border border-[#d2d2d7]/60 px-4 py-2.5 text-[14px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            {reasons.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#1d1d1f]">Notiz (optional)</label>
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
          Bestand aktualisieren
        </button>
      </form>
    </AdminModal>
  );
}

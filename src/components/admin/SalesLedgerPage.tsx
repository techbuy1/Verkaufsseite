"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useProductStore } from "@/context/ProductStoreContext";
import { useSalesLedger } from "@/context/SalesLedgerContext";
import { formatEuro, saleProfit } from "@/lib/salesTypes";

function toDateInputValue(iso: string): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function SalesLedgerPage() {
  const { products } = useProductStore();
  const {
    sales,
    ytdRevenue,
    ytdProfit,
    ytdUnits,
    addSaleTransaction,
    updateSaleTransaction,
    removeSaleTransaction,
  } = useSalesLedger();

  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [variantLabel, setVariantLabel] = useState("");
  const [imei, setImei] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");
  const [soldOn, setSoldOn] = useState(() => toDateInputValue(new Date().toISOString()));
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const year = new Date().getFullYear();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sales;
    return sales.filter((sale) => {
      return (
        sale.productName.toLowerCase().includes(q) ||
        (sale.imei ?? "").toLowerCase().includes(q) ||
        (sale.variantLabel ?? "").toLowerCase().includes(q) ||
        (sale.note ?? "").toLowerCase().includes(q)
      );
    });
  }, [sales, query]);

  function resetForm() {
    setEditingId(null);
    setProductId("");
    setProductName("");
    setVariantLabel("");
    setImei("");
    setPurchasePrice("");
    setSalePrice("");
    setQuantity("1");
    setNote("");
    setSoldOn(toDateInputValue(new Date().toISOString()));
  }

  function handleProductSelect(id: string) {
    setProductId(id);
    const product = products.find((entry) => entry.id === id);
    if (product) {
      setProductName(product.name);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const name = productName.trim();
    if (!name) return;

    const payload = {
      productId: productId || undefined,
      productName: name,
      variantLabel: variantLabel.trim() || undefined,
      imei: imei.trim() || undefined,
      purchasePrice: Number(purchasePrice) || 0,
      salePrice: Number(salePrice) || 0,
      quantity: Math.max(1, Number(quantity) || 1),
      note: note.trim() || undefined,
      createdAt: soldOn
        ? new Date(`${soldOn}T12:00:00`).toISOString()
        : new Date().toISOString(),
      source: "manual" as const,
    };

    if (editingId) {
      updateSaleTransaction(editingId, payload);
    } else {
      addSaleTransaction(payload);
    }
    resetForm();
  }

  function startEdit(id: string) {
    const sale = sales.find((entry) => entry.id === id);
    if (!sale) return;
    setEditingId(sale.id);
    setProductId(sale.productId ?? "");
    setProductName(sale.productName);
    setVariantLabel(sale.variantLabel ?? "");
    setImei(sale.imei ?? "");
    setPurchasePrice(String(sale.purchasePrice));
    setSalePrice(String(sale.salePrice));
    setQuantity(String(sale.quantity));
    setNote(sale.note ?? "");
    setSoldOn(toDateInputValue(sale.createdAt));
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div>
        <h1 className="admin-page-title">Verkäufe</h1>
        <p className="admin-page-subtitle">
          Einzelne Transaktionen mit Einkaufspreis und IMEI — Grundlage für Umsatz {year}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-[16px] border border-border bg-white p-4">
          <p className="text-[12px] text-text-secondary">Umsatz {year}</p>
          <p className="mt-1 text-[22px] font-semibold">{formatEuro(ytdRevenue)}</p>
        </div>
        <div className="rounded-[16px] border border-border bg-white p-4">
          <p className="text-[12px] text-text-secondary">Rohertrag {year}</p>
          <p className="mt-1 text-[22px] font-semibold">{formatEuro(ytdProfit)}</p>
        </div>
        <div className="rounded-[16px] border border-border bg-white p-4">
          <p className="text-[12px] text-text-secondary">Stück {year}</p>
          <p className="mt-1 text-[22px] font-semibold">{ytdUnits}</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-[18px] border border-border bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
      >
        <h2 className="mb-4 text-[16px] font-semibold text-text-primary">
          {editingId ? "Verkauf bearbeiten" : "Neuen Verkauf erfassen"}
        </h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <label className="text-[13px]">
            <span className="mb-1 block font-medium">Produkt (optional wählen)</span>
            <select
              value={productId}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="shop-admin-control w-full"
            >
              <option value="">— manuell benennen —</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[13px]">
            <span className="mb-1 block font-medium">Produktname *</span>
            <input
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="shop-admin-control w-full"
              placeholder="iPhone 17 Pro"
            />
          </label>
          <label className="text-[13px]">
            <span className="mb-1 block font-medium">Variante</span>
            <input
              value={variantLabel}
              onChange={(e) => setVariantLabel(e.target.value)}
              className="shop-admin-control w-full"
              placeholder="256 GB · Cosmic Orange · Neu"
            />
          </label>
          <label className="text-[13px]">
            <span className="mb-1 block font-medium">IMEI</span>
            <input
              value={imei}
              onChange={(e) => setImei(e.target.value)}
              className="shop-admin-control w-full"
              placeholder="15-stellige IMEI"
            />
          </label>
          <label className="text-[13px]">
            <span className="mb-1 block font-medium">Einkaufspreis (€)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              className="shop-admin-control w-full"
              required
            />
          </label>
          <label className="text-[13px]">
            <span className="mb-1 block font-medium">Verkaufspreis (€)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              className="shop-admin-control w-full"
              required
            />
          </label>
          <label className="text-[13px]">
            <span className="mb-1 block font-medium">Menge</span>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="shop-admin-control w-full"
            />
          </label>
          <label className="text-[13px]">
            <span className="mb-1 block font-medium">Verkaufsdatum</span>
            <input
              type="date"
              value={soldOn}
              onChange={(e) => setSoldOn(e.target.value)}
              className="shop-admin-control w-full"
            />
          </label>
          <label className="text-[13px] md:col-span-2 xl:col-span-1">
            <span className="mb-1 block font-medium">Notiz</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="shop-admin-control w-full"
              placeholder="optional"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="submit" className="btn-techbuy-primary px-4 py-2.5 text-[13px]">
            {editingId ? "Speichern" : "Verkauf hinzufügen"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="btn-techbuy-secondary px-4 py-2.5 text-[13px]"
            >
              Abbrechen
            </button>
          )}
        </div>
      </form>

      <div className="rounded-[18px] border border-border bg-white p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[16px] font-semibold">Alle Transaktionen</h2>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suche Name, IMEI, Variante…"
            className="shop-admin-control max-w-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-[13px]">
            <thead className="border-b border-border text-[11px] uppercase tracking-wide text-text-secondary">
              <tr>
                <th className="px-2 py-2 font-medium">Datum</th>
                <th className="px-2 py-2 font-medium">Produkt</th>
                <th className="px-2 py-2 font-medium">IMEI</th>
                <th className="px-2 py-2 font-medium">EK</th>
                <th className="px-2 py-2 font-medium">VK</th>
                <th className="px-2 py-2 font-medium">Menge</th>
                <th className="px-2 py-2 font-medium">Gewinn</th>
                <th className="px-2 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-2 py-8 text-center text-text-secondary">
                    Noch keine Verkäufe erfasst.
                  </td>
                </tr>
              ) : (
                filtered.map((sale) => (
                  <tr key={sale.id} className="border-b border-border/60">
                    <td className="px-2 py-3 whitespace-nowrap text-text-secondary">
                      {new Date(sale.createdAt).toLocaleDateString("de-DE")}
                    </td>
                    <td className="px-2 py-3">
                      <p className="font-medium text-text-primary">{sale.productName}</p>
                      {sale.variantLabel && (
                        <p className="text-[12px] text-text-secondary">{sale.variantLabel}</p>
                      )}
                    </td>
                    <td className="px-2 py-3 font-mono text-[12px]">{sale.imei || "—"}</td>
                    <td className="px-2 py-3">{formatEuro(sale.purchasePrice)}</td>
                    <td className="px-2 py-3">{formatEuro(sale.salePrice)}</td>
                    <td className="px-2 py-3">{sale.quantity}</td>
                    <td className="px-2 py-3 font-medium">{formatEuro(saleProfit(sale))}</td>
                    <td className="px-2 py-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => startEdit(sale.id)}
                        className="mr-2 text-accent hover:underline"
                      >
                        Bearbeiten
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Diesen Verkauf löschen?")) {
                            removeSaleTransaction(sale.id);
                          }
                        }}
                        className="text-red-600 hover:underline"
                      >
                        Löschen
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

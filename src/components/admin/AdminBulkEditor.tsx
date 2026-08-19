"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useProductStore } from "@/context/ProductStoreContext";
import { formatPrice } from "@/data/products";
import { CONDITION_DEFINITIONS, CONDITION_IDS } from "@/lib/conditions";
import {
  applyBulkPriceChangeToProducts,
  applyInlineVariantPatch,
  filterVariantRows,
  flattenVariantRows,
  previewBulkPriceChange,
  uniqueSorted,
  type BulkFilters,
  type BulkPriceChange,
  type BulkPriceMode,
  type BulkPreviewRow,
  type VariantRow,
} from "@/lib/bulkPricing";
import type { ConditionId, PremiumProduct } from "@/types/product";

const UNDO_KEY = "techbuy-bulk-undo-v1";

const MODE_OPTIONS: { value: BulkPriceMode; label: string }[] = [
  { value: "set", label: "Preis setzen auf" },
  { value: "add", label: "+ Betrag (€)" },
  { value: "subtract", label: "− Betrag (€)" },
  { value: "add_percent", label: "+ Prozent (%)" },
  { value: "subtract_percent", label: "− Prozent (%)" },
];

export function AdminBulkEditor() {
  const { products, ready, setProductsState } = useProductStore();
  const [filters, setFilters] = useState<BulkFilters>({ availability: "all" });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<BulkPriceMode>("set");
  const [value, setValue] = useState("0");
  const [preview, setPreview] = useState<BulkPreviewRow[] | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [undoAvailable, setUndoAvailable] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      setUndoAvailable(Boolean(sessionStorage.getItem(UNDO_KEY)));
    } catch {
      setUndoAvailable(false);
    }
  }, []);

  const rows = useMemo(() => flattenVariantRows(products), [products]);
  const filtered = useMemo(() => filterVariantRows(rows, filters), [rows, filters]);

  const brands = useMemo(() => uniqueSorted(rows.map((r) => r.brand)), [rows]);
  const models = useMemo(
    () =>
      uniqueSorted(
        rows
          .filter((r) => !filters.brand || r.brand === filters.brand)
          .map((r) => r.model),
      ),
    [rows, filters.brand],
  );
  const colors = useMemo(() => uniqueSorted(rows.map((r) => r.colorName)), [rows]);
  const storages = useMemo(() => uniqueSorted(rows.map((r) => r.storage)), [rows]);

  const change: BulkPriceChange = {
    mode,
    value: Number.parseFloat(value.replace(",", ".")) || 0,
  };

  function toggleRow(key: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function selectFiltered() {
    setSelected(new Set(filtered.map((row) => row.key)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function buildPreview() {
    const targets = filtered.filter((row) => selected.has(row.key));
    if (targets.length === 0) {
      setMessage("Bitte mindestens eine Variante auswählen.");
      return;
    }
    setMessage(null);
    setPreview(previewBulkPriceChange(targets, change));
    setConfirmOpen(true);
  }

  function persistUndoSnapshot(snapshot: PremiumProduct[]) {
    try {
      sessionStorage.setItem(UNDO_KEY, JSON.stringify(snapshot));
      setUndoAvailable(true);
    } catch {
      setUndoAvailable(false);
    }
  }

  function applyChanges() {
    if (!preview || preview.length === 0) return;
    persistUndoSnapshot(products);
    const keys = new Set(preview.map((row) => row.key));
    const next = applyBulkPriceChangeToProducts(products, keys, change);
    setProductsState(next);
    setConfirmOpen(false);
    setPreview(null);
    setMessage(`${keys.size} Varianten aktualisiert.`);
  }

  function undoLast() {
    try {
      const raw = sessionStorage.getItem(UNDO_KEY);
      if (!raw) return;
      const snapshot = JSON.parse(raw) as PremiumProduct[];
      setProductsState(snapshot);
      sessionStorage.removeItem(UNDO_KEY);
      setUndoAvailable(false);
      setMessage("Letzte Massenänderung rückgängig gemacht.");
    } catch {
      setMessage("Rückgängig nicht möglich.");
    }
  }

  function saveInline(row: VariantRow, patch: Partial<Pick<VariantRow, "price" | "stock" | "active">>) {
    const next = applyInlineVariantPatch(products, row.key, patch);
    setProductsState(next);
  }

  if (!ready) {
    return <p className="text-[14px] text-[#6e6e73]">Lade Varianten…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/admin/products" className="text-[13px] text-[#6e6e73] hover:text-[#1d1d1f]">
            ← Produkte
          </Link>
          <h1 className="admin-page-title">Massenbearbeitung</h1>
          <p className="admin-page-subtitle">
            Preise & Bestand je Farbe / Speicher / Zustand — inkl. Vorschau und Undo.
          </p>
        </div>
        <button
          type="button"
          disabled={!undoAvailable}
          onClick={undoLast}
          className="btn-techbuy-secondary px-4 py-2 text-[13px] disabled:opacity-40"
        >
          Letzte Massenänderung rückgängig
        </button>
      </div>

      {message && <div className="admin-alert-success">{message}</div>}

      <section className="rounded-[18px] bg-white p-4 shadow-sm md:p-5">
        <h2 className="mb-3 text-[16px] font-semibold text-[#1d1d1f]">Filter</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect
            label="Hersteller"
            value={filters.brand ?? ""}
            onChange={(brand) => setFilters((f) => ({ ...f, brand: brand || undefined }))}
            options={brands}
          />
          <FilterSelect
            label="Modell"
            value={filters.model ?? ""}
            onChange={(model) => setFilters((f) => ({ ...f, model: model || undefined }))}
            options={models}
          />
          <FilterSelect
            label="Farbe"
            value={filters.color ?? ""}
            onChange={(color) => setFilters((f) => ({ ...f, color: color || undefined }))}
            options={colors}
          />
          <FilterSelect
            label="Speicher"
            value={filters.storage ?? ""}
            onChange={(storage) => setFilters((f) => ({ ...f, storage: storage || undefined }))}
            options={storages}
          />
          <label className="block text-[13px]">
            <span className="mb-1 block text-[#6e6e73]">Zustand</span>
            <select
              className="field-input rounded-[10px] border-[#d2d2d7]/60 bg-white text-[13px]"
              value={filters.condition ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  condition: (e.target.value || "") as ConditionId | "",
                }))
              }
            >
              <option value="">Alle</option>
              {CONDITION_IDS.map((id) => (
                <option key={id} value={id}>
                  {CONDITION_DEFINITIONS[id].label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[13px]">
            <span className="mb-1 block text-[#6e6e73]">Verfügbarkeit</span>
            <select
              className="field-input rounded-[10px] border-[#d2d2d7]/60 bg-white text-[13px]"
              value={filters.availability ?? "all"}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  availability: e.target.value as BulkFilters["availability"],
                }))
              }
            >
              <option value="all">Alle</option>
              <option value="in_stock">Auf Lager</option>
              <option value="out_of_stock">Bestand 0</option>
              <option value="active">Aktiv</option>
              <option value="inactive">Inaktiv</option>
            </select>
          </label>
          <label className="block text-[13px]">
            <span className="mb-1 block text-[#6e6e73]">Preis von</span>
            <input
              type="number"
              className="field-input rounded-[10px] border-[#d2d2d7]/60 bg-white text-[13px]"
              value={filters.minPrice ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  minPrice: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
          </label>
          <label className="block text-[13px]">
            <span className="mb-1 block text-[#6e6e73]">Preis bis</span>
            <input
              type="number"
              className="field-input rounded-[10px] border-[#d2d2d7]/60 bg-white text-[13px]"
              value={filters.maxPrice ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  maxPrice: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={selectFiltered} className="btn-techbuy-secondary px-4 py-2 text-[13px]">
            Alle gefilterten Varianten auswählen ({filtered.length})
          </button>
          <button type="button" onClick={clearSelection} className="text-[13px] text-[#6e6e73] hover:underline">
            Auswahl leeren
          </button>
        </div>
      </section>

      <section className="rounded-[18px] bg-white p-4 shadow-sm md:p-5">
        <h2 className="mb-3 text-[16px] font-semibold text-[#1d1d1f]">Preisaktion</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block flex-1 text-[13px]">
            <span className="mb-1 block text-[#6e6e73]">Aktion</span>
            <select
              className="field-input rounded-[10px] border-[#d2d2d7]/60 bg-white text-[13px]"
              value={mode}
              onChange={(e) => setMode(e.target.value as BulkPriceMode)}
            >
              {MODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block w-full text-[13px] sm:w-40">
            <span className="mb-1 block text-[#6e6e73]">Wert</span>
            <input
              type="number"
              step="0.01"
              className="field-input rounded-[10px] border-[#d2d2d7]/60 bg-white text-[13px]"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={buildPreview}
            className="btn-techbuy-primary px-5 py-2.5 text-[14px]"
          >
            Vorschau ({selected.size})
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-[18px] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-[13px]">
            <thead className="bg-[#f5f5f7] text-[11px] uppercase tracking-wide text-[#6e6e73]">
              <tr>
                <th className="px-3 py-3">☑</th>
                <th className="px-3 py-3">Hersteller</th>
                <th className="px-3 py-3">Modell</th>
                <th className="px-3 py-3">Farbe</th>
                <th className="px-3 py-3">Speicher</th>
                <th className="px-3 py-3">Zustand</th>
                <th className="px-3 py-3">Preis</th>
                <th className="px-3 py-3">Bestand</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.key} className="border-t border-[#d2d2d7]/40">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected.has(row.key)}
                      onChange={() => toggleRow(row.key)}
                      className="h-4 w-4 accent-accent"
                    />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{row.brand}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{row.name}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{row.colorName}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{row.storage}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{row.conditionLabel}</td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="0.01"
                      className="w-[88px] rounded-[8px] border border-[#d2d2d7]/60 px-2 py-1"
                      defaultValue={row.price}
                      key={`${row.key}-price-${row.price}`}
                      onBlur={(e) => {
                        const next = Number.parseFloat(e.target.value);
                        if (Number.isFinite(next) && next !== row.price) {
                          saveInline(row, { price: next });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      className="w-[72px] rounded-[8px] border border-[#d2d2d7]/60 px-2 py-1"
                      defaultValue={row.stock}
                      key={`${row.key}-stock-${row.stock}`}
                      onBlur={(e) => {
                        const next = Math.max(0, Math.floor(Number(e.target.value) || 0));
                        if (next !== row.stock) saveInline(row, { stock: next });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <label className="inline-flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={row.active}
                        onChange={(e) => saveInline(row, { active: e.target.checked })}
                        className="h-4 w-4 accent-accent"
                      />
                      {row.active ? "Aktiv" : "Aus"}
                    </label>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-[#6e6e73]">
                    Keine Varianten für diesen Filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {confirmOpen && preview && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-[18px] bg-white shadow-xl">
            <div className="border-b border-[#d2d2d7]/40 px-5 py-4">
              <h3 className="text-[18px] font-semibold text-[#1d1d1f]">Vorschau</h3>
              <p className="mt-1 text-[13px] text-[#6e6e73]">
                Du änderst die Preise von {preview.length} Varianten.
              </p>
            </div>
            <div className="max-h-[50vh] space-y-2 overflow-y-auto px-5 py-4">
              {preview.slice(0, 80).map((row) => (
                <div
                  key={row.key}
                  className="flex flex-wrap items-baseline justify-between gap-2 text-[13px]"
                >
                  <span className="text-[#1d1d1f]">{row.label}</span>
                  <span className="tabular-nums text-[#6e6e73]">
                    {formatPrice(row.from)} →{" "}
                    <span className="font-semibold text-[#1d1d1f]">{formatPrice(row.to)}</span>
                  </span>
                </div>
              ))}
              {preview.length > 80 && (
                <p className="text-[12px] text-[#86868b]">… und {preview.length - 80} weitere</p>
              )}
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-[#d2d2d7]/40 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false);
                  setPreview(null);
                }}
                className="btn-techbuy-secondary px-4 py-2.5 text-[14px]"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={applyChanges}
                className="btn-techbuy-primary px-4 py-2.5 text-[14px]"
              >
                Änderungen übernehmen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block text-[13px]">
      <span className="mb-1 block text-[#6e6e73]">{label}</span>
      <select
        className="field-input rounded-[10px] border-[#d2d2d7]/60 bg-white text-[13px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Alle</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

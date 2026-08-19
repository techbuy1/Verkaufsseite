"use client";

import { useEffect, useMemo, useState } from "react";
import { useTopDeal } from "@/context/TopDealContext";
import { formatPrice } from "@/data/products";
import { getColorDefinitionsForSlug } from "@/data/productImageMap";
import { resolvePremiumProduct } from "@/lib/catalog";
import { getProductPrice, getStorageOptionsForColor } from "@/lib/productVariants";
import { TOP_DEAL_PRODUCT_OPTIONS } from "@/lib/topDealStore";
import type { TopDealConfig } from "@/lib/topDealStore";

/** "2026-08-25T14:00" for a <input type="datetime-local"> value, in local time. */
function toDateTimeLocalValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function AdminTopDealPage() {
  const { config, ready, updateConfig, resetToSeed } = useTopDeal();
  const [form, setForm] = useState<TopDealConfig>(config);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Keep the form in sync whenever the persisted config changes underneath it
  // (first client-side load, or an explicit reset) — not a plain useMemo,
  // since setting state from a memo body isn't a supported React pattern.
  useEffect(() => {
    if (ready) setForm(config);
  }, [ready, config]);

  const product = resolvePremiumProduct(form.productId);
  const modelOption = TOP_DEAL_PRODUCT_OPTIONS.find((option) => option.productId === form.productId);
  const colors = useMemo(
    () => (modelOption ? getColorDefinitionsForSlug(modelOption.slug) ?? [] : []),
    [modelOption],
  );
  const selectedColor = colors.find((color) => color.id === form.colorId) ?? colors[0];
  const storageOptions = product && selectedColor ? getStorageOptionsForColor(product, selectedColor.id) : [];
  const selectedStorage =
    storageOptions.find((option) => option.storage === form.storage) ?? storageOptions[0];

  const originalPrice =
    product && selectedColor && selectedStorage
      ? getProductPrice(product, selectedStorage.storage, selectedColor.id)
      : 0;
  const dealPrice = Math.round(originalPrice * (1 - form.discountPercent / 100));

  function patch(next: Partial<TopDealConfig>) {
    setForm((current) => ({ ...current, ...next }));
    setSavedAt(null);
  }

  function handleProductChange(productId: string) {
    const option = TOP_DEAL_PRODUCT_OPTIONS.find((o) => o.productId === productId);
    const nextColors = option ? getColorDefinitionsForSlug(option.slug) ?? [] : [];
    patch({ productId, colorId: nextColors[0]?.id, storage: undefined });
  }

  function handleSave() {
    if (!selectedColor || !selectedStorage) return;
    updateConfig({
      ...form,
      colorId: selectedColor.id,
      storage: selectedStorage.storage,
    });
    setSavedAt(Date.now());
  }

  if (!ready) {
    // Server/first-client-paint render nothing date-dependent — `config`
    // (in particular `endsAt`) is only deterministic once the persisted
    // value has loaded client-side, otherwise SSR and hydration disagree.
    return (
      <div className="mx-auto max-w-[900px]">
        <h1 className="text-[28px] font-bold tracking-tight text-[#1d1d1f]">Top Deal der Woche</h1>
        <p className="mt-2 text-[15px] text-[#6e6e73]">Lade Konfiguration …</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[900px]">
      <h1 className="text-[28px] font-bold tracking-tight text-[#1d1d1f]">Top Deal der Woche</h1>
      <p className="mt-2 text-[15px] text-[#6e6e73]">
        Konfiguriere das Produkt, den Rabatt und den Countdown für die Deal-Sektion auf der Startseite.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-5 rounded-[18px] border border-[#d2d2d7]/40 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <label className="flex items-center gap-2.5 text-[14px] font-medium text-[#1d1d1f]">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) => patch({ active: event.target.checked })}
              className="h-4 w-4 accent-[#16c66a]"
            />
            Sektion auf der Startseite anzeigen
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium">Produkt</label>
              <select
                className="field-input"
                value={form.productId}
                onChange={(event) => handleProductChange(event.target.value)}
              >
                {TOP_DEAL_PRODUCT_OPTIONS.map((option) => (
                  <option key={option.productId} value={option.productId}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium">Farbe</label>
              <select
                className="field-input"
                value={selectedColor?.id ?? ""}
                onChange={(event) => patch({ colorId: event.target.value })}
                disabled={colors.length === 0}
              >
                {colors.map((color) => (
                  <option key={color.id} value={color.id}>
                    {color.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium">Speicher</label>
              <select
                className="field-input"
                value={selectedStorage?.storage ?? ""}
                onChange={(event) => patch({ storage: event.target.value })}
                disabled={storageOptions.length === 0}
              >
                {storageOptions.map((option) => (
                  <option key={option.storage} value={option.storage}>
                    {option.storage}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium">Rabatt (%)</label>
              <input
                type="number"
                min={0}
                max={90}
                className="field-input"
                value={form.discountPercent}
                onChange={(event) =>
                  patch({ discountPercent: Math.max(0, Math.min(90, Number(event.target.value) || 0)) })
                }
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium">Badge-Text</label>
            <input
              type="text"
              className="field-input"
              value={form.badgeLabel}
              onChange={(event) => patch({ badgeLabel: event.target.value })}
              placeholder="Top Deal der Woche"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium">Unterzeile</label>
            <input
              type="text"
              className="field-input"
              value={form.headline}
              onChange={(event) => patch({ headline: event.target.value })}
              placeholder="Diese Woche stark reduziert."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium">Countdown endet am</label>
            <input
              type="datetime-local"
              className="field-input"
              value={toDateTimeLocalValue(form.endsAt)}
              onChange={(event) => {
                const value = event.target.value;
                if (!value) return;
                const date = new Date(value);
                if (!Number.isNaN(date.getTime())) patch({ endsAt: date.toISOString() });
              }}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex min-h-[42px] items-center justify-center rounded-full bg-[#16c66a] px-6 text-[14px] font-semibold text-white transition-colors hover:bg-[#12a85a]"
            >
              Änderungen speichern
            </button>
            <button
              type="button"
              onClick={() => {
                resetToSeed();
                setSavedAt(Date.now());
              }}
              className="inline-flex min-h-[42px] items-center justify-center rounded-full border border-[#d2d2d7] px-5 text-[14px] font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
            >
              Zurücksetzen
            </button>
            {savedAt && <span className="text-[13px] text-[#16c66a]">Gespeichert.</span>}
          </div>
        </div>

        <div className="h-fit rounded-[18px] border border-[#d2d2d7]/40 bg-[#0b0f1a] p-5 text-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">Vorschau</p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#e8622a] to-[#f2934f] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white">
            ⚡ {form.badgeLabel || "Top Deal der Woche"}
          </span>
          <p className="mt-3 text-[17px] font-bold leading-snug">{product?.name ?? "—"}</p>
          <p className="mt-1 text-[13px] text-white/50">{form.headline}</p>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-[13px] text-white/40 line-through">{formatPrice(originalPrice)}</span>
            <span className="text-[22px] font-bold">{formatPrice(dealPrice)}</span>
            <span className="mb-1 rounded-full bg-[#16c66a]/15 px-2 py-0.5 text-[11px] font-semibold text-[#16c66a]">
              -{form.discountPercent}%
            </span>
          </div>
          <p className="mt-1 text-[12px] text-white/40">
            {selectedStorage?.storage ?? "—"} · {selectedColor?.name ?? "—"}
          </p>
          {!form.active && (
            <p className="mt-4 rounded-lg bg-white/[0.06] px-3 py-2 text-[12px] text-white/50">
              Sektion ist aktuell auf der Startseite ausgeblendet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/data/products";
import { getAllPremiumProducts } from "@/lib/catalog";
import { getProductRegularPrice, getDefaultAvailableStorage, getDefaultAvailableColorId } from "@/lib/productVariants";
import { useProductStore } from "@/context/ProductStoreContext";
import {
  getPromotionStatus,
  type Promotion,
  type PromotionDiscountType,
  type PromotionStatus,
} from "@/lib/promotions";
import type { ConditionId } from "@/types/product";

const STATUS_LABEL: Record<PromotionStatus, string> = {
  active: "Aktiv",
  scheduled: "Geplant",
  expired: "Abgelaufen",
  disabled: "Deaktiviert",
};

const STATUS_CLASS: Record<PromotionStatus, string> = {
  active: "bg-accent/10 text-accent",
  scheduled: "bg-[#0071e3]/10 text-[#0071e3]",
  expired: "bg-text-secondary/10 text-text-secondary",
  disabled: "bg-text-secondary/10 text-text-secondary",
};

/** "2026-08-25T14:00" für <input type="datetime-local">, in lokaler Zeit. */
function toDateTimeLocalValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

interface DeviceOption {
  id: string;
  brand: string;
  model: string;
  label: string;
}

const CONDITION_OPTIONS: { id: ConditionId; label: string }[] = [
  { id: "new", label: "Neu" },
  { id: "like_new", label: "Wie neu" },
  { id: "excellent", label: "Hervorragend" },
  { id: "very_good", label: "Sehr gut" },
  { id: "good", label: "Gut" },
  { id: "heavily_used", label: "Stark gebraucht" },
  { id: "poor", label: "Schlecht" },
];

interface FormState {
  id?: string;
  name: string;
  productIds: string[];
  discountType: PromotionDiscountType;
  discountPercent: number;
  fixedPrices: Record<string, number>;
  scope: "all_variants" | "specific_variants";
  variantColorIds: string[];
  variantStorages: string[];
  variantConditions: ConditionId[];
  startsAt: string;
  endsAt: string;
  active: boolean;
}

function emptyForm(): FormState {
  const now = new Date();
  const inAWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    name: "",
    productIds: [],
    discountType: "percent",
    discountPercent: 10,
    fixedPrices: {},
    scope: "all_variants",
    variantColorIds: [],
    variantStorages: [],
    variantConditions: [],
    startsAt: now.toISOString(),
    endsAt: inAWeek.toISOString(),
    active: true,
  };
}

export default function AdminPromotionsPage() {
  const { fullProducts: products, adminReady: ready } = useProductStore();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deviceSearch, setDeviceSearch] = useState("");

  useEffect(() => {
    void loadPromotions();
  }, []);

  async function loadPromotions() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/promotions");
      const data = (await response.json()) as { promotions?: Promotion[] };
      setPromotions(Array.isArray(data.promotions) ? data.promotions : []);
    } catch {
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }

  const deviceGroups = useMemo(() => {
    void ready;
    void products;
    const all: DeviceOption[] = getAllPremiumProducts()
      .map((product) => ({
        id: product.id,
        brand: product.brand,
        model: product.model,
        label: `${product.brand} ${product.model}`,
      }))
      .sort((a, b) => a.brand.localeCompare(b.brand, "de") || a.model.localeCompare(b.model, "de"));

    const filtered = deviceSearch.trim()
      ? all.filter((d) => d.label.toLowerCase().includes(deviceSearch.trim().toLowerCase()))
      : all;

    const groups = new Map<string, DeviceOption[]>();
    for (const device of filtered) {
      const bucket = groups.get(device.brand);
      if (bucket) bucket.push(device);
      else groups.set(device.brand, [device]);
    }
    return Array.from(groups.entries()).map(([brand, options]) => ({ brand, options }));
  }, [products, ready, deviceSearch]);

  const deviceById = useMemo(() => {
    const map = new Map<string, DeviceOption>();
    for (const group of deviceGroups) {
      for (const option of group.options) map.set(option.id, option);
    }
    // deviceSearch can hide entries from deviceGroups — also index the unfiltered list.
    for (const product of getAllPremiumProducts()) {
      if (!map.has(product.id)) {
        map.set(product.id, {
          id: product.id,
          brand: product.brand,
          model: product.model,
          label: `${product.brand} ${product.model}`,
        });
      }
    }
    return map;
  }, [deviceGroups]);

  function startCreate() {
    setForm(emptyForm());
    setError(null);
  }

  function startEdit(promotion: Promotion) {
    setForm({
      id: promotion.id,
      name: promotion.name,
      productIds: promotion.productIds,
      discountType: promotion.discountType,
      discountPercent: promotion.discountPercent ?? 10,
      fixedPrices: promotion.fixedPrices ?? {},
      scope: promotion.scope,
      variantColorIds: promotion.variantScope?.colorIds ?? [],
      variantStorages: promotion.variantScope?.storages ?? [],
      variantConditions: promotion.variantScope?.conditions ?? [],
      startsAt: promotion.startsAt,
      endsAt: promotion.endsAt,
      active: promotion.active,
    });
    setError(null);
  }

  function toggleProduct(productId: string) {
    if (!form) return;
    const has = form.productIds.includes(productId);
    setForm({
      ...form,
      productIds: has
        ? form.productIds.filter((id) => id !== productId)
        : [...form.productIds, productId],
    });
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    setError(null);

    const payload: Omit<Promotion, "id" | "createdAt" | "updatedAt"> = {
      name: form.name.trim(),
      productIds: form.productIds,
      discountType: form.discountType,
      discountPercent: form.discountType === "percent" ? form.discountPercent : undefined,
      fixedPrices: form.discountType === "fixed" ? form.fixedPrices : undefined,
      scope: form.scope,
      variantScope:
        form.scope === "specific_variants"
          ? {
              colorIds: form.variantColorIds.length ? form.variantColorIds : undefined,
              storages: form.variantStorages.length ? form.variantStorages : undefined,
              conditions: form.variantConditions.length ? form.variantConditions : undefined,
            }
          : undefined,
      startsAt: form.startsAt,
      endsAt: form.endsAt,
      active: form.active,
    };

    try {
      const response = await fetch(
        form.id ? `/api/admin/promotions/${form.id}` : "/api/admin/promotions",
        {
          method: form.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(payload),
        },
      );
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(data.message ?? "Angebot konnte nicht gespeichert werden.");
        return;
      }
      setForm(null);
      await loadPromotions();
    } catch {
      setError("Netzwerkfehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(promotion: Promotion) {
    try {
      await fetch(`/api/admin/promotions/${promotion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ active: !promotion.active }),
      });
      await loadPromotions();
    } catch {
      // ignore — list stays as-is, user can retry
    }
  }

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="admin-page-title">Angebote</h1>
          <p className="mt-2 text-[15px] text-[#6e6e73]">
            Zeitlich begrenzte Rabatte auf einzelne oder mehrere Geräte — der Preis kehrt nach Ende
            automatisch zum Normalpreis zurück.
          </p>
        </div>
        {!form && (
          <button
            type="button"
            onClick={startCreate}
            className="btn-techbuy-primary min-h-[42px] px-5 text-[14px]"
          >
            Neues Angebot
          </button>
        )}
      </div>

      {form ? (
        <PromotionForm
          form={form}
          setForm={setForm}
          deviceGroups={deviceGroups}
          deviceById={deviceById}
          deviceSearch={deviceSearch}
          setDeviceSearch={setDeviceSearch}
          onToggleProduct={toggleProduct}
          onCancel={() => setForm(null)}
          onSave={handleSave}
          saving={saving}
          error={error}
        />
      ) : (
        <div className="mt-8 overflow-x-auto rounded-[18px] border border-[#d2d2d7]/40 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          {loading ? (
            <p className="p-6 text-[14px] text-text-secondary">Lade Angebote …</p>
          ) : promotions.length === 0 ? (
            <p className="p-6 text-[14px] text-text-secondary">
              Noch keine Angebote angelegt. Klicke auf „Neues Angebot“, um eines zu erstellen.
            </p>
          ) : (
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#e5e5ea] text-[12px] uppercase tracking-wide text-text-secondary">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Geräte</th>
                  <th className="px-5 py-3 font-medium">Rabatt</th>
                  <th className="px-5 py-3 font-medium">Start</th>
                  <th className="px-5 py-3 font-medium">Ende</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promotion) => {
                  const status = getPromotionStatus(promotion);
                  return (
                    <tr key={promotion.id} className="border-b border-[#f0f0f2] last:border-0">
                      <td className="px-5 py-3.5 font-medium text-text-primary">{promotion.name}</td>
                      <td className="px-5 py-3.5 text-text-secondary">
                        {promotion.productIds.length} Gerät{promotion.productIds.length === 1 ? "" : "e"}
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary">
                        {promotion.discountType === "percent"
                          ? `-${promotion.discountPercent}%`
                          : "Fixpreis"}
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary">{formatDate(promotion.startsAt)}</td>
                      <td className="px-5 py-3.5 text-text-secondary">{formatDate(promotion.endsAt)}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_CLASS[status]}`}
                        >
                          {STATUS_LABEL[status]}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(promotion)}
                            className="btn-techbuy-secondary min-h-[32px] px-3 text-[12px]"
                          >
                            Bearbeiten
                          </button>
                          <button
                            type="button"
                            onClick={() => void toggleActive(promotion)}
                            className="btn-techbuy-secondary min-h-[32px] px-3 text-[12px]"
                          >
                            {promotion.active ? "Deaktivieren" : "Aktivieren"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

interface PromotionFormProps {
  form: FormState;
  setForm: (form: FormState) => void;
  deviceGroups: { brand: string; options: DeviceOption[] }[];
  deviceById: Map<string, DeviceOption>;
  deviceSearch: string;
  setDeviceSearch: (value: string) => void;
  onToggleProduct: (productId: string) => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  error: string | null;
}

function PromotionForm({
  form,
  setForm,
  deviceGroups,
  deviceById,
  deviceSearch,
  setDeviceSearch,
  onToggleProduct,
  onCancel,
  onSave,
  saving,
  error,
}: PromotionFormProps) {
  function patch(next: Partial<FormState>) {
    setForm({ ...form, ...next });
  }

  const selectedDevices = form.productIds.map((id) => deviceById.get(id)).filter(Boolean) as DeviceOption[];

  // Vorschau — echte Preise aus dem Katalog, kein erfundener UVP.
  const preview = selectedDevices.map((device) => {
    const product = getAllPremiumProducts().find((p) => p.id === device.id);
    if (!product) return { device, regularPrice: 0, salePrice: 0 };
    const colorId = getDefaultAvailableColorId(product);
    const storage = getDefaultAvailableStorage(product, colorId).storage;
    const regularPrice = getProductRegularPrice(product, storage, colorId);
    let salePrice = regularPrice;
    if (form.discountType === "percent" && form.discountPercent > 0) {
      salePrice = Math.round(regularPrice * (1 - form.discountPercent / 100) * 100) / 100;
    } else if (form.discountType === "fixed") {
      salePrice = form.fixedPrices[device.id] ?? regularPrice;
    }
    return { device, regularPrice, salePrice };
  });

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-5 rounded-[18px] border border-[#d2d2d7]/40 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {error && (
          <p className="rounded-[12px] bg-[#ff3b30]/10 px-3.5 py-2.5 text-[13px] font-medium text-[#ff3b30]">
            {error}
          </p>
        )}

        <div>
          <label className="mb-1.5 block text-[13px] font-medium">Name des Angebots</label>
          <input
            type="text"
            className="field-input"
            value={form.name}
            onChange={(event) => patch({ name: event.target.value })}
            placeholder="z. B. iPhone Wochenenddeal"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium">Geräte auswählen</label>
          <input
            type="text"
            className="field-input mb-2"
            value={deviceSearch}
            onChange={(event) => setDeviceSearch(event.target.value)}
            placeholder="Suchen …"
          />
          <div className="max-h-[280px] overflow-y-auto rounded-[12px] border border-[#e5e5ea] p-2">
            {deviceGroups.map((group) => (
              <div key={group.brand} className="mb-2 last:mb-0">
                <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                  {group.brand}
                </p>
                {group.options.map((option) => (
                  <label
                    key={option.id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-[8px] px-2 py-1.5 text-[13px] hover:bg-[#f5f5f7]"
                  >
                    <input
                      type="checkbox"
                      checked={form.productIds.includes(option.id)}
                      onChange={() => onToggleProduct(option.id)}
                      className="h-4 w-4 accent-accent"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            ))}
          </div>
          {selectedDevices.length > 0 && (
            <p className="mt-1.5 text-[12px] text-text-secondary">
              {selectedDevices.length} ausgewählt: {selectedDevices.map((d) => d.label).join(", ")}
            </p>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-[13px] font-medium">Rabattart</p>
          <div className="flex gap-4 text-[13px]">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={form.discountType === "percent"}
                onChange={() => patch({ discountType: "percent" })}
                className="h-4 w-4 accent-accent"
              />
              Prozent
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={form.discountType === "fixed"}
                onChange={() => patch({ discountType: "fixed" })}
                className="h-4 w-4 accent-accent"
              />
              Fester Angebotspreis
            </label>
          </div>
        </div>

        {form.discountType === "percent" ? (
          <div>
            <label className="mb-1.5 block text-[13px] font-medium">Rabatt (%)</label>
            <input
              type="number"
              min={1}
              max={99}
              className="field-input max-w-[160px]"
              value={form.discountPercent}
              onChange={(event) =>
                patch({ discountPercent: Math.max(1, Math.min(99, Number(event.target.value) || 0)) })
              }
            />
          </div>
        ) : (
          <div>
            <p className="mb-1.5 text-[13px] font-medium">Angebotspreis je Gerät</p>
            {selectedDevices.length === 0 ? (
              <p className="text-[13px] text-text-secondary">Bitte zuerst Geräte auswählen.</p>
            ) : (
              <div className="space-y-2">
                {selectedDevices.map((device) => (
                  <div key={device.id} className="flex items-center gap-3">
                    <span className="w-56 shrink-0 text-[13px] text-text-primary">{device.label}</span>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      className="field-input max-w-[140px]"
                      value={form.fixedPrices[device.id] ?? ""}
                      onChange={(event) =>
                        patch({
                          fixedPrices: {
                            ...form.fixedPrices,
                            [device.id]: Number(event.target.value) || 0,
                          },
                        })
                      }
                      placeholder="0,00 €"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div>
          <p className="mb-1.5 text-[13px] font-medium">Gilt für</p>
          <div className="flex gap-4 text-[13px]">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={form.scope === "all_variants"}
                onChange={() => patch({ scope: "all_variants" })}
                className="h-4 w-4 accent-accent"
              />
              Alle Varianten
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={form.scope === "specific_variants"}
                onChange={() => patch({ scope: "specific_variants" })}
                className="h-4 w-4 accent-accent"
              />
              Bestimmte Varianten
            </label>
          </div>
        </div>

        {form.scope === "specific_variants" && (
          <div>
            <label className="mb-1.5 block text-[13px] font-medium">Zustände (optional einschränken)</label>
            <div className="flex flex-wrap gap-3 text-[13px]">
              {CONDITION_OPTIONS.map((condition) => (
                <label key={condition.id} className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={form.variantConditions.includes(condition.id)}
                    onChange={() =>
                      patch({
                        variantConditions: form.variantConditions.includes(condition.id)
                          ? form.variantConditions.filter((c) => c !== condition.id)
                          : [...form.variantConditions, condition.id],
                      })
                    }
                    className="h-4 w-4 accent-accent"
                  />
                  {condition.label}
                </label>
              ))}
            </div>
            <p className="mt-1 text-[12px] text-text-secondary">
              Keine Auswahl = gilt für alle Zustände (nur Farbe/Speicher werden dann eingeschränkt, falls
              unten gesetzt).
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium">Start</label>
            <input
              type="datetime-local"
              className="field-input"
              value={toDateTimeLocalValue(form.startsAt)}
              onChange={(event) => {
                const value = event.target.value;
                if (!value) return;
                const date = new Date(value);
                if (!Number.isNaN(date.getTime())) patch({ startsAt: date.toISOString() });
              }}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium">Ende</label>
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
        </div>

        <label className="flex items-center gap-2.5 text-[14px] font-medium text-text-primary">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) => patch({ active: event.target.checked })}
            className="h-4 w-4 accent-accent"
          />
          Angebot aktiv
        </label>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="btn-techbuy-primary min-h-[42px] px-6 text-[14px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Speichert …" : "Speichern"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn-techbuy-secondary min-h-[42px] px-5 text-[14px]"
          >
            Abbrechen
          </button>
        </div>
      </div>

      <div className="h-fit rounded-[18px] border border-[#d2d2d7]/40 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <p className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">Vorschau</p>
        {preview.length === 0 ? (
          <p className="mt-3 text-[13px] text-text-secondary">Wähle Geräte, um eine Vorschau zu sehen.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {preview.map(({ device, regularPrice, salePrice }) => (
              <div key={device.id} className="border-b border-[#f0f0f2] pb-3 last:border-0 last:pb-0">
                <p className="text-[13px] font-medium text-text-primary">{device.label}</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-[13px] text-text-secondary line-through">
                    {formatPrice(regularPrice)}
                  </span>
                  <span className="text-[15px] font-semibold text-accent">{formatPrice(salePrice)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

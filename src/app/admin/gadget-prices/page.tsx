"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/data/products";
import { combineNetAtVatRate, splitGrossAtVatRate } from "@/lib/companySettings";

interface GadgetRow {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  hasOverride: boolean;
}

type FilterKey = "all" | "folien" | "huellen" | "kabel" | "ladegeraete";

function classifyGadget(row: GadgetRow): FilterKey {
  const haystack = `${row.name} ${row.slug}`.toLowerCase();
  if (/panzerfolie|displayschutz/.test(haystack)) return "folien";
  if (/hülle|huelle|silikon/.test(haystack)) return "huellen";
  if (/kabel|cable/.test(haystack)) return "kabel";
  if (/ladegerät|ladegeraet|charger/.test(haystack)) return "ladegeraete";
  return "all";
}

const FILTER_LABELS: Record<FilterKey, string> = {
  all: "Alle",
  folien: "Folien",
  huellen: "Hüllen",
  kabel: "Kabel",
  ladegeraete: "Ladegeräte",
};

function formatPercent(rate: number): string {
  return (rate * 100).toFixed(rate * 100 === Math.round(rate * 100) ? 0 : 2);
}

export default function AdminGadgetPricesPage() {
  const [rows, setRows] = useState<GadgetRow[]>([]);
  const [standardVatRate, setStandardVatRate] = useState(0.19);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [confirmDrop, setConfirmDrop] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  // USt.-Rechner — reine Kalkulationshilfe, komplett getrennt von der
  // Preisänderung darunter. Ändert nie einen gespeicherten Produktpreis.
  const [calcMode, setCalcMode] = useState<"gross" | "net">("gross");
  const [calcAmount, setCalcAmount] = useState("19,99");
  const [calcRate, setCalcRate] = useState("19");

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/gadget-prices");
      const data = (await response.json()) as {
        products?: GadgetRow[];
        standardVatRate?: number;
      };
      setRows(Array.isArray(data.products) ? data.products : []);
      if (typeof data.standardVatRate === "number") {
        setStandardVatRate(data.standardVatRate);
        setCalcRate(formatPercent(data.standardVatRate));
      }
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (filter !== "all" && classifyGadget(row) !== filter) return false;
      if (search.trim() && !row.name.toLowerCase().includes(search.trim().toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [rows, filter, search]);

  function parseDraft(raw: string): number | null {
    const normalized = raw.trim().replace(",", ".");
    if (!normalized) return null;
    const value = Number(normalized);
    return Number.isFinite(value) ? value : null;
  }

  function draftValue(row: GadgetRow): string {
    return drafts[row.id] ?? row.price.toFixed(2).replace(".", ",");
  }

  function isDirty(row: GadgetRow): boolean {
    const draft = drafts[row.id];
    if (draft === undefined) return false;
    const parsed = parseDraft(draft);
    return parsed !== null && Math.abs(parsed - row.price) > 0.004;
  }

  async function saveOne(row: GadgetRow, skipConfirm = false) {
    const parsed = parseDraft(draftValue(row));
    if (parsed === null || parsed <= 0) {
      setMessage("Preis ist ungültig.");
      return;
    }

    if (!skipConfirm && row.price > 0 && parsed < row.price * 0.5) {
      setConfirmDrop(row.id);
      return;
    }

    setSaving(row.id);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/gadget-prices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ updates: [{ productId: row.id, price: parsed }] }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setMessage(data.message ?? "Preis konnte nicht gespeichert werden.");
        return;
      }
      setDrafts((current) => {
        const next = { ...current };
        delete next[row.id];
        return next;
      });
      await load();
    } catch {
      setMessage("Netzwerkfehler beim Speichern.");
    } finally {
      setSaving(null);
      setConfirmDrop(null);
    }
  }

  async function resetToBase(row: GadgetRow) {
    setSaving(row.id);
    setMessage(null);
    try {
      await fetch("/api/admin/gadget-prices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ updates: [{ productId: row.id, price: null }] }),
      });
      setDrafts((current) => {
        const next = { ...current };
        delete next[row.id];
        return next;
      });
      await load();
    } finally {
      setSaving(null);
    }
  }

  async function saveAllDirty() {
    const dirtyRows = filteredRows.filter(isDirty);
    if (dirtyRows.length === 0) return;

    const updates: { productId: string; price: number }[] = [];
    for (const row of dirtyRows) {
      const parsed = parseDraft(draftValue(row));
      if (parsed === null || parsed <= 0) {
        setMessage(`Preis für „${row.name}" ist ungültig.`);
        return;
      }
      updates.push({ productId: row.id, price: parsed });
    }

    setSavingAll(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/gadget-prices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ updates }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setMessage(data.message ?? "Änderungen konnten nicht gespeichert werden.");
        return;
      }
      setDrafts({});
      await load();
    } catch {
      setMessage("Netzwerkfehler beim Speichern.");
    } finally {
      setSavingAll(false);
    }
  }

  const dirtyCount = filteredRows.filter(isDirty).length;

  // Rechner — läuft komplett lokal, kein Request.
  const calcRateValue = Math.min(100, Math.max(0, Number(calcRate.replace(",", ".")) || 0)) / 100;
  const calcAmountValue = Number(calcAmount.replace(",", ".")) || 0;
  const calcResult =
    calcMode === "gross"
      ? splitGrossAtVatRate(calcAmountValue, calcRateValue)
      : combineNetAtVatRate(calcAmountValue, calcRateValue);

  return (
    <div className="mx-auto max-w-[1100px]">
      <h1 className="admin-page-title">Gadget-Preise</h1>
      <p className="mt-2 text-[15px] text-[#6e6e73]">
        Verkaufspreise für Zubehör (Folien, Hüllen, Kabel, Ladegeräte, …) einzeln oder gebündelt
        ändern. Der Bestand bleibt getrennt unter „Bestand nach Gerät&rdquo;.
      </p>

      {/* USt.-Rechner — reine Kalkulationshilfe, verändert keine Preise/Steuerlogik. */}
      <div className="mt-8 rounded-[18px] border border-[#d2d2d7]/40 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h2 className="text-[17px] font-semibold text-text-primary">USt.-Rechner</h2>
        <p className="mt-1 text-[13px] text-text-secondary">
          Nur Kalkulationshilfe — ändert keinen gespeicherten Produktpreis und keine steuerliche
          Behandlung von Bestellungen (Differenzbesteuerung bei Gebrauchtgeräten bleibt davon
          unberührt).
        </p>

        <div className="mt-4 flex flex-wrap gap-4 text-[13px]">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={calcMode === "gross"}
              onChange={() => setCalcMode("gross")}
              className="h-4 w-4 accent-accent"
            />
            Bruttopreis vorhanden
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={calcMode === "net"}
              onChange={() => setCalcMode("net")}
              className="h-4 w-4 accent-accent"
            />
            Nettopreis vorhanden
          </label>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:max-w-[420px]">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium">
              {calcMode === "gross" ? "Bruttopreis" : "Nettopreis"}
            </label>
            <input
              type="text"
              inputMode="decimal"
              className="field-input"
              value={calcAmount}
              onChange={(event) => setCalcAmount(event.target.value)}
              placeholder="19,99"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium">USt.-Satz (%)</label>
            <input
              type="text"
              inputMode="decimal"
              className="field-input"
              value={calcRate}
              onChange={(event) => setCalcRate(event.target.value)}
              placeholder="19"
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4 rounded-[14px] bg-[#f5f5f7] p-4 text-center sm:max-w-[420px]">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-text-secondary">Netto</p>
            <p className="mt-1 text-[16px] font-semibold text-text-primary">
              {formatPrice(calcResult.net)}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-text-secondary">USt.</p>
            <p className="mt-1 text-[16px] font-semibold text-text-primary">
              {formatPrice(calcResult.vat)}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-text-secondary">Brutto</p>
            <p className="mt-1 text-[16px] font-semibold text-text-primary">
              {formatPrice(calcResult.gross)}
            </p>
          </div>
        </div>
      </div>

      {/* Preistabelle */}
      <div className="mt-8 rounded-[18px] border border-[#d2d2d7]/40 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e5ea] p-5">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              className="field-input w-[220px]"
              placeholder="Gadget suchen …"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(FILTER_LABELS) as FilterKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    filter === key
                      ? "bg-accent text-white"
                      : "border border-border bg-white text-text-primary hover:border-accent"
                  }`}
                >
                  {FILTER_LABELS[key]}
                </button>
              ))}
            </div>
          </div>
          {dirtyCount > 0 && (
            <button
              type="button"
              onClick={() => void saveAllDirty()}
              disabled={savingAll}
              className="btn-techbuy-primary min-h-[38px] px-4 text-[13px] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingAll ? "Speichert …" : `Alle Änderungen speichern (${dirtyCount})`}
            </button>
          )}
        </div>

        {message && (
          <p className="mx-5 mt-4 rounded-[10px] bg-[#ff3b30]/10 px-3.5 py-2.5 text-[13px] font-medium text-[#ff3b30]">
            {message}
          </p>
        )}

        {loading ? (
          <p className="p-6 text-[14px] text-text-secondary">Lade Gadget-Preise …</p>
        ) : filteredRows.length === 0 ? (
          <p className="p-6 text-[14px] text-text-secondary">Keine Gadgets gefunden.</p>
        ) : (
          <div className="divide-y divide-[#f0f0f2]">
            {filteredRows.map((row) => {
              const netVat = splitGrossAtVatRate(row.price, standardVatRate);
              const dirty = isDirty(row);
              return (
                <div key={row.id} className="flex flex-wrap items-center gap-4 p-5">
                  <div className="min-w-[180px] flex-1">
                    <p className="text-[14px] font-medium text-text-primary">{row.name}</p>
                    <p className="mt-0.5 text-[12px] text-text-secondary">
                      Aktueller Preis: {formatPrice(row.price)}
                      {row.hasOverride && (
                        <span className="ml-1.5 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                          Manueller Preis
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-[11px] text-text-secondary">
                      Netto {formatPrice(netVat.net)} · enthaltene USt. ({formatPercent(standardVatRate)}%){" "}
                      {formatPrice(netVat.vat)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      className="field-input w-[110px]"
                      value={draftValue(row)}
                      onChange={(event) =>
                        setDrafts((current) => ({ ...current, [row.id]: event.target.value }))
                      }
                    />
                    <span className="text-[13px] text-text-secondary">€</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {confirmDrop === row.id ? (
                      <>
                        <span className="text-[12px] font-medium text-[#ff3b30]">
                          Deutlich niedriger — sicher?
                        </span>
                        <button
                          type="button"
                          onClick={() => void saveOne(row, true)}
                          className="btn-techbuy-primary min-h-[34px] px-3 text-[12px]"
                        >
                          Ja, speichern
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDrop(null)}
                          className="btn-techbuy-secondary min-h-[34px] px-3 text-[12px]"
                        >
                          Abbrechen
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => void saveOne(row)}
                          disabled={!dirty || saving === row.id}
                          className="btn-techbuy-primary min-h-[34px] px-3 text-[12px] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {saving === row.id ? "…" : "Speichern"}
                        </button>
                        {row.hasOverride && (
                          <button
                            type="button"
                            onClick={() => void resetToBase(row)}
                            disabled={saving === row.id}
                            className="btn-techbuy-secondary min-h-[34px] px-3 text-[12px]"
                            title="Manuellen Preis entfernen — Basispreis gilt wieder"
                          >
                            Preisregel verwenden
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

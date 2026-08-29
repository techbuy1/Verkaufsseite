"use client";

import { useEffect, useState } from "react";
import type { ConditionId } from "@/types/product";
import { CONDITION_DEFINITIONS, CONDITION_IDS } from "@/lib/conditions";
import {
  DEFAULT_CONDITION_PERCENTAGES,
  loadClientConditionPricingRules,
  saveClientConditionPricingRules,
  type ConditionPricingRules,
} from "@/lib/conditionPricingRules";
import { setActiveConditionPricingRules } from "@/lib/pricing";

export function ConditionPricingRulesEditor() {
  const [rules, setRules] = useState<ConditionPricingRules>(DEFAULT_CONDITION_PERCENTAGES);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/admin/pricing-rules");
        if (response.ok) {
          const data = (await response.json()) as { rules?: ConditionPricingRules };
          if (!cancelled && data.rules) {
            setRules(data.rules);
            setActiveConditionPricingRules(data.rules);
            saveClientConditionPricingRules(data.rules);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Fallback auf localStorage
      }

      if (!cancelled) {
        const local = loadClientConditionPricingRules();
        setRules(local);
        setActiveConditionPricingRules(local);
        setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  function updateRule(condition: ConditionId, value: string) {
    const parsed = Number(value.replace(",", "."));
    setRules((current) => ({
      ...current,
      [condition]: Number.isFinite(parsed) ? Math.min(200, Math.max(0, parsed)) : 0,
    }));
    setSaved(false);
    setError(null);
  }

  async function handleSave() {
    setError(null);
    try {
      const response = await fetch("/api/admin/pricing-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules }),
      });
      if (!response.ok) {
        throw new Error("Speichern fehlgeschlagen.");
      }
      const data = (await response.json()) as { rules: ConditionPricingRules };
      setRules(data.rules);
      saveClientConditionPricingRules(data.rules);
      setActiveConditionPricingRules(data.rules);
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Speichern fehlgeschlagen.");
    }
  }

  if (loading) {
    return <p className="text-[14px] text-[#6e6e73]">Preisregeln werden geladen…</p>;
  }

  return (
    <div className="rounded-[18px] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
      <h2 className="text-[20px] font-semibold text-[#1d1d1f]">Preisregeln Zustände</h2>
      <p className="mt-2 text-[14px] leading-relaxed text-[#6e6e73]">
        Prozent des Basispreises (Neu). 100&nbsp;% = voller Basispreis, 92&nbsp;% = 92&nbsp;%
        des Basispreises — kein Rabatt von 92&nbsp;%.
      </p>
      <p className="mt-1 text-[13px] text-[#86868b]">
        Produkte ohne manuellen Override werden automatisch neu berechnet, wenn du die Regeln
        änderst.
      </p>

      <div className="mt-6 space-y-3">
        {CONDITION_IDS.map((conditionId) => (
          <label
            key={conditionId}
            className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[#d2d2d7]/50 bg-[#fbfbfd] px-4 py-3"
          >
            <span className="text-[14px] font-medium text-[#1d1d1f]">
              {CONDITION_DEFINITIONS[conditionId].label}
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={200}
                step={0.1}
                inputMode="decimal"
                value={rules[conditionId]}
                onChange={(e) => updateRule(conditionId, e.target.value)}
                className="shop-admin-control w-[88px] text-right"
              />
              <span className="text-[13px] text-[#6e6e73]">%</span>
            </div>
          </label>
        ))}
      </div>

      {error && <p className="mt-4 text-[13px] text-red-600">{error}</p>}
      {saved && (
        <p className="mt-4 text-[13px] font-medium text-accent">Preisregeln gespeichert.</p>
      )}

      <button
        type="button"
        onClick={() => void handleSave()}
        className="btn-techbuy-primary mt-6 px-5 py-2.5 text-[14px]"
      >
        Preisregeln speichern
      </button>
    </div>
  );
}

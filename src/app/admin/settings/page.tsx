import { ConditionPricingRulesEditor } from "@/components/admin/ConditionPricingRulesEditor";

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-[720px] space-y-8">
      <div>
        <h1 className="admin-page-title">Einstellungen</h1>
        <p className="admin-page-subtitle">
          Zentrale Shop-Konfiguration und Preisregeln für Gerätezustände.
        </p>
      </div>

      <ConditionPricingRulesEditor />

      <div className="rounded-[18px] border border-[#d2d2d7]/40 bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <p className="text-[14px] text-[#6e6e73]">
          Weitere Shop-Einstellungen (Zahlungen, Versand) folgen mit dem Backend.
        </p>
      </div>
    </div>
  );
}

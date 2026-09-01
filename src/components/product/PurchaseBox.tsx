"use client";

import { memo } from "react";
import { formatPrice } from "@/data/products";
import type { ConditionId, ProductImageVariant, StorageOption } from "@/types/product";
import { ColorSelector } from "./ColorSelector";
import { ConditionSelector, type ConditionSelectorOption } from "./ConditionSelector";
import { StorageSelector } from "./StorageSelector";

interface PurchaseBoxProps {
  price: number;
  stock?: number;
  colors: ProductImageVariant[];
  colorAvailability?: Record<string, boolean>;
  storageOptions: StorageOption[];
  storageAvailability?: Record<string, number>;
  conditionOptions?: ConditionSelectorOption[];
  selectedColorId: string;
  selectedStorage: string;
  selectedCondition?: ConditionId;
  taxAccepted: boolean;
  canPurchase?: boolean;
  lowStockHint?: string;
  isPresale?: boolean;
  presaleShipLabel?: string;
  /** True when every variant/condition of this product is at stock 0. */
  fullyOutOfStock?: boolean;
  onColorChange: (colorId: string) => void;
  onStorageChange: (storage: string) => void;
  onConditionChange?: (condition: ConditionId) => void;
  onTaxChange: (accepted: boolean) => void;
  onAddToCart: () => void;
  hidePrice?: boolean;
  compact?: boolean;
}

const TRUST_ITEMS = [
  "Kostenloser Versand ab 50 €",
  "30 Tage Rückgabe",
  "Sichere Zahlung",
];

function ConfigCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] border border-border bg-surface-card p-3.5 shadow-[var(--shadow-card)] md:p-4">
      {children}
    </div>
  );
}

export const PurchaseBox = memo(function PurchaseBox({
  price,
  stock,
  colors,
  colorAvailability,
  storageOptions,
  storageAvailability,
  conditionOptions = [],
  selectedColorId,
  selectedStorage,
  selectedCondition,
  taxAccepted,
  canPurchase = true,
  lowStockHint,
  isPresale = false,
  presaleShipLabel,
  fullyOutOfStock = false,
  onColorChange,
  onStorageChange,
  onConditionChange,
  onTaxChange,
  onAddToCart,
  hidePrice = false,
  compact = false,
}: PurchaseBoxProps) {
  const outOfStock = stock !== undefined && stock <= 0;
  const isUnavailable = !canPurchase || (outOfStock && !isPresale);
  const buttonLabel =
    fullyOutOfStock && !isPresale
      ? "Derzeit nicht verfügbar"
      : isUnavailable
        ? "Derzeit nicht verfügbar"
        : isPresale && outOfStock
          ? "Jetzt vorbestellen"
          : "In den Warenkorb";
  const purchasableConditions = conditionOptions.filter(
    (option) => option.active && option.available,
  );
  const visibleConditions = conditionOptions.filter((option) => option.active);
  // Zeigt jede Farbe/jeden Speicher, auch ausverkaufte — die Selektoren
  // stellen ausverkaufte Optionen selbst ausgegraut/disabled dar.
  const hasConfigurableOptions =
    colors.length > 0 || storageOptions.length > 0 || purchasableConditions.length > 0;

  return (
    <div className="space-y-3 md:space-y-3.5">
      {fullyOutOfStock && !isPresale && (
        <ConfigCard>
          <p className="text-[20px] font-semibold tracking-tight text-text-primary">
            Derzeit nicht verfügbar
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
            Für dieses Produkt ist derzeit keine kaufbare Konfiguration verfügbar.
          </p>
        </ConfigCard>
      )}

      {!fullyOutOfStock && !hasConfigurableOptions && !isPresale && (
        <ConfigCard>
          <p className="text-[20px] font-semibold tracking-tight text-text-primary">
            Derzeit nicht verfügbar
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
            Für dieses Produkt ist derzeit keine kaufbare Konfiguration verfügbar.
          </p>
        </ConfigCard>
      )}

      {!hidePrice && (
        <ConfigCard>
          <p className="text-[13px] font-medium text-text-secondary">Preis</p>
          <p className="mt-1 text-[32px] font-semibold tracking-tight text-text-primary md:text-[36px]">
            {formatPrice(price)}
          </p>
          {stock !== undefined && (
            <p
              className={`mt-2 text-[13px] font-medium ${
                stock > 0 || isPresale ? "text-accent" : "text-text-secondary"
              }`}
            >
              {stock > 0
                ? lowStockHint ?? `${stock} auf Lager · Versandbereit`
                : isPresale
                  ? presaleShipLabel
                    ? `Vorverkauf · ${presaleShipLabel}`
                    : "Vorverkauf · Lieferung nach Verfügbarkeit"
                  : "Ausverkauft"}
            </p>
          )}
          {isPresale && (
            <p className="mt-2 inline-flex rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent">
              Vorverkauf
            </p>
          )}
        </ConfigCard>
      )}

      {colors.length > 0 && (
        <ConfigCard>
          <ColorSelector
            colors={colors}
            selectedColorId={selectedColorId}
            colorAvailability={colorAvailability}
            onChange={onColorChange}
          />
        </ConfigCard>
      )}

      {storageOptions.length > 0 && (
        <ConfigCard>
          <StorageSelector
            options={storageOptions}
            selectedStorage={selectedStorage}
            storageAvailability={storageAvailability}
            onChange={onStorageChange}
          />
        </ConfigCard>
      )}

      {visibleConditions.length > 0 && selectedCondition && onConditionChange && (
        <ConfigCard>
          <ConditionSelector
            options={conditionOptions}
            selectedCondition={selectedCondition}
            onChange={onConditionChange}
          />
        </ConfigCard>
      )}

      <ConfigCard>
        <label className="flex cursor-pointer items-start gap-3 rounded-[14px] border border-border bg-surface-hover/70 p-3.5">
          <input
            type="checkbox"
            checked={taxAccepted}
            onChange={(e) => onTaxChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-accent"
          />
          <span className="text-[12px] leading-relaxed text-text-secondary">
            Ich bestätige, dass dieser Artikel differenzbesteuert nach §25a UStG verkauft
            wird und keine Mehrwertsteuer separat ausgewiesen wird.
          </span>
        </label>

        <button
          type="button"
          disabled={!taxAccepted || isUnavailable}
          onClick={onAddToCart}
          className="btn-techbuy-primary mt-4 min-h-[52px] w-full text-[15px] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {buttonLabel}
        </button>

        {!compact && (
          <ul className="mt-4 space-y-2">
            {TRUST_ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-2 text-[13px] text-text-secondary">
                <span className="text-accent">✓</span>
                {item}
              </li>
            ))}
          </ul>
        )}
      </ConfigCard>
    </div>
  );
});

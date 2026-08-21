"use client";

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
  onColorChange: (colorId: string) => void;
  onStorageChange: (storage: string) => void;
  onConditionChange?: (condition: ConditionId) => void;
  onTaxChange: (accepted: boolean) => void;
  onAddToCart: () => void;
  hidePrice?: boolean;
  compact?: boolean;
}

const TRUST_ITEMS = [
  "Kostenloser Versand",
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

export function PurchaseBox({
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
  const buttonLabel = isUnavailable
    ? "Ausverkauft"
    : isPresale && outOfStock
      ? "Jetzt vorbestellen"
      : "In den Warenkorb";
  const activeConditions = conditionOptions.filter((option) => option.active);

  return (
    <div className="space-y-3 md:space-y-3.5">
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

      {colors.length > 1 && (
        <ConfigCard>
          <ColorSelector
            colors={colors}
            selectedColorId={selectedColorId}
            colorAvailability={colorAvailability}
            onChange={onColorChange}
          />
        </ConfigCard>
      )}

      {storageOptions.length > 1 && (
        <ConfigCard>
          <StorageSelector
            options={storageOptions}
            selectedStorage={selectedStorage}
            storageAvailability={storageAvailability}
            onChange={onStorageChange}
          />
        </ConfigCard>
      )}

      {activeConditions.length > 0 && selectedCondition && onConditionChange && (
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
}

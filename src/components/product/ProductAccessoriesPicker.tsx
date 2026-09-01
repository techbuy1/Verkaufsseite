"use client";

import {
  CASE_FOIL_COMBO_PRICE,
  DEVICE_ACCESSORY,
  SILICONE_CASE_COLORS,
  emptyDeviceAddonSelection,
  estimateAddonListTotal,
  productSupportsSiliconeCase,
  type DeviceAddonSelection,
  type ScreenProtectorChoice,
} from "@/data/deviceAccessories";
import { formatPrice } from "@/data/products";
import type { PremiumProduct } from "@/types/product";

interface ProductAccessoriesPickerProps {
  product: PremiumProduct;
  selection: DeviceAddonSelection;
  onChange: (next: DeviceAddonSelection) => void;
}

const SCREEN_OPTIONS: Array<{ id: ScreenProtectorChoice; label: string }> = [
  { id: "none", label: "Ohne" },
  { id: "clear", label: "Klar" },
  { id: "matte", label: "Matt" },
  { id: "privacy", label: "Privacy" },
];

function OptionRow({
  checked,
  title,
  price,
  hint,
  onToggle,
  children,
}: {
  checked: boolean;
  title: string;
  price: string;
  hint?: string;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-[14px] border border-border bg-surface-card px-3.5 py-3">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-3">
            <span className="text-[14px] font-medium text-text-primary">{title}</span>
            <span className="shrink-0 text-[13px] font-semibold text-text-primary">
              {price}
            </span>
          </span>
          {hint ? (
            <span className="mt-0.5 block text-[12px] text-text-secondary">{hint}</span>
          ) : null}
        </span>
      </label>
      {checked && children ? <div className="mt-3 pl-7">{children}</div> : null}
    </div>
  );
}

export function ProductAccessoriesPicker({
  product,
  selection,
  onChange,
}: ProductAccessoriesPickerProps) {
  const showSilicone = productSupportsSiliconeCase(product);
  const addonTotal = estimateAddonListTotal(selection);
  const hasFoil = selection.screenProtector !== "none";
  const showComboHint = hasFoil && selection.clearCase;

  function patch(partial: Partial<DeviceAddonSelection>) {
    onChange({ ...selection, ...partial });
  }

  return (
    <div className="rounded-[16px] border border-border bg-surface-card p-3.5 shadow-[var(--shadow-card)] md:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-text-secondary">Zubehör</p>
          <p className="mt-0.5 text-[12px] text-text-muted">
            Optional · Kombi & Mengenrabatte im Warenkorb
          </p>
        </div>
        {addonTotal > 0 ? (
          <p className="text-[13px] font-semibold text-accent">+{formatPrice(addonTotal)}</p>
        ) : null}
      </div>

      <div className="mt-3 space-y-2.5">
        <div className="rounded-[14px] border border-border px-3.5 py-3">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[14px] font-medium text-text-primary">Panzerfolie</p>
            <p className="text-[13px] font-semibold text-text-primary">
              {formatPrice(DEVICE_ACCESSORY.screenClear.price)}
            </p>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {SCREEN_OPTIONS.map((option) => {
              const active = selection.screenProtector === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => patch({ screenProtector: option.id })}
                  className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    active
                      ? "bg-dark text-white"
                      : "bg-surface-soft text-text-secondary hover:bg-surface-hover"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <OptionRow
          checked={selection.clearCase}
          title={DEVICE_ACCESSORY.caseClear.name}
          price={formatPrice(DEVICE_ACCESSORY.caseClear.price)}
          hint={
            showComboHint
              ? `Kombi mit Folie: ${formatPrice(CASE_FOIL_COMBO_PRICE)} statt ${formatPrice(19.98)}`
              : `Mit Folie zusammen ${formatPrice(CASE_FOIL_COMBO_PRICE)}`
          }
          onToggle={() => patch({ clearCase: !selection.clearCase })}
        />

        <OptionRow
          checked={selection.usbCable}
          title={DEVICE_ACCESSORY.cableUsbc.name}
          price={formatPrice(DEVICE_ACCESSORY.cableUsbc.price)}
          onToggle={() => patch({ usbCable: !selection.usbCable })}
        />

        {showSilicone ? (
          <OptionRow
            checked={selection.siliconeCase}
            title={DEVICE_ACCESSORY.caseSiliconeApple.name}
            price={formatPrice(DEVICE_ACCESSORY.caseSiliconeApple.price)}
            onToggle={() => patch({ siliconeCase: !selection.siliconeCase })}
          >
            <div className="flex flex-wrap gap-2">
              {SILICONE_CASE_COLORS.map((color) => {
                const active = selection.siliconeColorId === color.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    title={color.label}
                    aria-label={color.label}
                    onClick={() => patch({ siliconeColorId: color.id })}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      active ? "border-dark" : "border-transparent"
                    }`}
                  >
                    <span
                      className="h-6 w-6 rounded-full border border-black/10"
                      style={{ backgroundColor: color.hex }}
                    />
                  </button>
                );
              })}
            </div>
          </OptionRow>
        ) : null}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-text-muted">
        Mengenrabatt Zubehör: ab 2 Stück −5%, ab 4 −10%, ab 10 −20%. Kostenloser Versand ab 50 €.
      </p>
    </div>
  );
}

export { emptyDeviceAddonSelection };

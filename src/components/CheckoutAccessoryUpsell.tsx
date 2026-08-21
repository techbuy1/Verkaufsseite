"use client";

import {
  UPSELL_BUNDLE_META,
  UPSELL_BUNDLE_PRICES_CENTS,
  UPSELL_ITEM_LABELS,
  UPSELL_ITEM_PRICES_CENTS,
  emptyDeviceUpsellSelection,
  formatUpsellEuroFromCents,
  priceDeviceUpsellSelection,
  type DeviceUpsellSelectionInput,
  type ScreenProtectorVariant,
  type UpsellBundleId,
} from "@/lib/checkoutUpsell";
import type { CartItem } from "@/lib/cart";

interface CheckoutAccessoryUpsellProps {
  devices: Array<{
    lineId: string;
    productId: string;
    productName: string;
    image?: string;
  }>;
  selections: Record<string, DeviceUpsellSelectionInput>;
  onChange: (cartLineId: string, next: DeviceUpsellSelectionInput) => void;
}

function GlassPicker({
  value,
  onChange,
}: {
  value: ScreenProtectorVariant | null | undefined;
  onChange: (value: ScreenProtectorVariant) => void;
}) {
  return (
    <div className="mt-3">
      <p className="text-[12px] font-medium text-text-secondary">
        Welche Folie möchtest du?
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {(
          [
            { id: "normal", label: "Normal" },
            { id: "privacy", label: "Privacy" },
          ] as const
        ).map((option) => {
          const active = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors duration-200 ${
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
  );
}

function BundleCard({
  bundleId,
  selected,
  screenProtector,
  onSelect,
  onGlassChange,
}: {
  bundleId: UpsellBundleId;
  selected: boolean;
  screenProtector: ScreenProtectorVariant | null | undefined;
  onSelect: () => void;
  onGlassChange: (value: ScreenProtectorVariant) => void;
}) {
  const meta = UPSELL_BUNDLE_META[bundleId];
  const price = UPSELL_BUNDLE_PRICES_CENTS[bundleId];
  const save = meta.compareCents - price;
  const isComplete = bundleId === "complete";

  return (
    <div
      className={`relative flex min-w-[240px] flex-1 flex-col rounded-[18px] border bg-white p-4 transition-all duration-250 ${
        selected
          ? "border-accent shadow-[0_0_0_1px_var(--color-accent)]"
          : isComplete
            ? "border-border shadow-[var(--shadow-card)]"
            : "border-border"
      }`}
    >
      {meta.badge ? (
        <span className="absolute -top-2.5 left-4 rounded-full bg-dark px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          {meta.badge}
        </span>
      ) : null}

      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[15px] font-semibold text-text-primary">{meta.title}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">
            {bundleId === "protection" && "Panzerglas + Hülle"}
            {bundleId === "everyday" && "Panzerglas + Hülle + USB-C-Kabel"}
            {bundleId === "complete" &&
              "Panzerglas + Hülle + USB-C-Kabel + 60-W-Netzteil"}
          </p>
        </div>
        {selected ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-1 text-[11px] font-semibold text-accent transition-opacity duration-200">
            ✓ Hinzugefügt
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        <p className="text-[12px] text-text-muted line-through">
          {formatUpsellEuroFromCents(meta.compareCents)}
        </p>
        <p className="text-[22px] font-semibold tracking-tight text-text-primary">
          {formatUpsellEuroFromCents(price)}
        </p>
        <p className="mt-1 text-[12px] font-medium text-accent">
          Du sparst {formatUpsellEuroFromCents(save)}
        </p>
      </div>

      {selected ? (
        <GlassPicker value={screenProtector} onChange={onGlassChange} />
      ) : null}

      <button
        type="button"
        onClick={onSelect}
        className={`mt-4 min-h-[44px] w-full rounded-full text-[13px] font-semibold transition-colors duration-200 ${
          selected
            ? "border border-accent bg-accent-soft text-accent"
            : "btn-techbuy-primary"
        }`}
      >
        {selected ? "Auswahl beibehalten" : "Bundle hinzufügen"}
      </button>
    </div>
  );
}

function SingleToggle({
  label,
  priceLabel,
  checked,
  disabled,
  onToggle,
  children,
}: {
  label: string;
  priceLabel: string;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-[14px] border px-3.5 py-3 transition-colors duration-200 ${
        checked ? "border-accent bg-accent-soft/40" : "border-border bg-white"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={onToggle}
          className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-3">
            <span className="text-[14px] font-medium text-text-primary">{label}</span>
            <span className="shrink-0 text-[13px] font-semibold">{priceLabel}</span>
          </span>
        </span>
      </label>
      {checked ? children : null}
    </div>
  );
}

function DeviceUpsellBlock({
  device,
  selection,
  onChange,
}: {
  device: { lineId: string; productId: string; productName: string };
  selection: DeviceUpsellSelectionInput;
  onChange: (next: DeviceUpsellSelectionInput) => void;
}) {
  const priced = priceDeviceUpsellSelection(selection, device);
  const currentTotal =
    priced.ok && priced.priced
      ? formatUpsellEuroFromCents(priced.priced.lineTotalCents)
      : null;

  function selectBundle(bundleId: UpsellBundleId) {
    const already =
      selection.mode === "bundle" && selection.bundleId === bundleId;
    if (already) {
      onChange(emptyDeviceUpsellSelection(device.lineId));
      return;
    }
    onChange({
      cartLineId: device.lineId,
      mode: "bundle",
      bundleId,
      screenProtector: selection.screenProtector ?? "normal",
      transparentCase: false,
      usbCCable: false,
      charger60w: false,
    });
  }

  function patchSingles(partial: Partial<DeviceUpsellSelectionInput>) {
    const next: DeviceUpsellSelectionInput = {
      ...emptyDeviceUpsellSelection(device.lineId),
      ...selection,
      mode: "singles",
      bundleId: null,
      ...partial,
    };
    const hasAny =
      Boolean(next.screenProtector) ||
      Boolean(next.transparentCase) ||
      Boolean(next.usbCCable) ||
      Boolean(next.charger60w);
    onChange(hasAny ? next : emptyDeviceUpsellSelection(device.lineId));
  }

  const bundleLocksSingles = selection.mode === "bundle";

  return (
    <section className="rounded-[22px] border border-border bg-[#fafafa] p-4 md:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
            Für {device.productName}
          </p>
          <h3 className="mt-1 text-[18px] font-semibold tracking-tight text-text-primary">
            Passendes Zubehör für dein Gerät
          </h3>
          <p className="mt-1 text-[13px] text-text-secondary">
            Schütze dein neues Gerät und spare im Bundle.
          </p>
        </div>
        {currentTotal ? (
          <p className="text-[13px] font-semibold text-accent">+{currentTotal}</p>
        ) : null}
      </div>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-3 md:overflow-visible">
        {(["protection", "everyday", "complete"] as UpsellBundleId[]).map(
          (bundleId) => (
            <BundleCard
              key={bundleId}
              bundleId={bundleId}
              selected={
                selection.mode === "bundle" && selection.bundleId === bundleId
              }
              screenProtector={selection.screenProtector}
              onSelect={() => selectBundle(bundleId)}
              onGlassChange={(value) =>
                onChange({
                  ...selection,
                  mode: "bundle",
                  bundleId,
                  screenProtector: value,
                })
              }
            />
          ),
        )}
      </div>

      <div className="mt-5">
        <p className="text-[13px] font-medium text-text-secondary">
          Oder einzeln wählen
        </p>
        <p className="mt-0.5 text-[12px] text-text-muted">
          Bundle und Einzelartikel schließen sich gegenseitig aus.
        </p>
        <div className="mt-3 space-y-2.5">
          <SingleToggle
            label={`Panzerglas für ${device.productName}`}
            priceLabel={formatUpsellEuroFromCents(
              UPSELL_ITEM_PRICES_CENTS.screen_protector,
            )}
            checked={Boolean(selection.screenProtector) && selection.mode === "singles"}
            disabled={bundleLocksSingles}
            onToggle={() =>
              patchSingles({
                screenProtector: selection.screenProtector ? null : "normal",
              })
            }
          >
            <div className="mt-2 pl-7">
              <GlassPicker
                value={selection.screenProtector}
                onChange={(value) => patchSingles({ screenProtector: value })}
              />
            </div>
          </SingleToggle>

          <SingleToggle
            label={`Transparente Schutzhülle für ${device.productName}`}
            priceLabel={formatUpsellEuroFromCents(
              UPSELL_ITEM_PRICES_CENTS.transparent_case,
            )}
            checked={Boolean(selection.transparentCase) && selection.mode === "singles"}
            disabled={bundleLocksSingles}
            onToggle={() =>
              patchSingles({ transparentCase: !selection.transparentCase })
            }
          />

          <SingleToggle
            label={UPSELL_ITEM_LABELS.usb_c_cable}
            priceLabel={formatUpsellEuroFromCents(
              UPSELL_ITEM_PRICES_CENTS.usb_c_cable,
            )}
            checked={Boolean(selection.usbCCable) && selection.mode === "singles"}
            disabled={bundleLocksSingles}
            onToggle={() => patchSingles({ usbCCable: !selection.usbCCable })}
          />

          <SingleToggle
            label={UPSELL_ITEM_LABELS.charger_60w}
            priceLabel={formatUpsellEuroFromCents(
              UPSELL_ITEM_PRICES_CENTS.charger_60w,
            )}
            checked={Boolean(selection.charger60w) && selection.mode === "singles"}
            disabled={bundleLocksSingles}
            onToggle={() => patchSingles({ charger60w: !selection.charger60w })}
          />
        </div>
      </div>
    </section>
  );
}

export function CheckoutAccessoryUpsell({
  devices,
  selections,
  onChange,
}: CheckoutAccessoryUpsellProps) {
  if (devices.length === 0) return null;

  return (
    <div className="space-y-5">
      {devices.map((device) => (
        <DeviceUpsellBlock
          key={device.lineId}
          device={device}
          selection={
            selections[device.lineId] ?? emptyDeviceUpsellSelection(device.lineId)
          }
          onChange={(next) => onChange(device.lineId, next)}
        />
      ))}
    </div>
  );
}

export function getSmartphoneUpsellDevices(
  cartItems: CartItem[],
  resolveCategory: (productId: string) => string | undefined,
): Array<{
  lineId: string;
  productId: string;
  productName: string;
  image?: string;
}> {
  return cartItems
    .filter(
      (item) =>
        item.lineId && resolveCategory(item.productId) === "smartphones",
    )
    .map((item) => ({
      lineId: item.lineId,
      productId: item.productId,
      productName: item.name,
      image: item.image,
    }));
}

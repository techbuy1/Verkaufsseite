"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type {
  AdminProductSpecs,
  BundleOffer,
  ConditionId,
  ConditionOption,
  PremiumProduct,
  ProductVariant,
  StorageOption,
} from "@/types/product";
import { useProductStore } from "@/context/ProductStoreContext";
import { formatPrice } from "@/data/products";
import { getAllCrossSellOptions } from "@/lib/crossSell";
import {
  applyConditionPatch,
  CONDITION_IDS,
  ensureStorageConditions,
} from "@/lib/conditions";
import {
  getAdminStatusLabel,
  getTotalStock,
  isProductVisibleInShop,
} from "@/lib/productAvailability";
import { specsToLegacy } from "@/lib/productStore";
import { slugifyColorId, syncProductVariants, validateVariantPrices, normalizeStoragePrice } from "@/lib/productVariants";
import { validateVariantImagePaths, isPlaceholderImagePath } from "@/lib/validateVariantImages";
import { RichTextEditor } from "./RichTextEditor";

interface AdminProductEditorProps {
  productId: string;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-medium text-[#6e6e73]">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "field-input rounded-[12px] border-[#d2d2d7]/60 bg-white text-[14px] text-[#1d1d1f]";

const compactInputClass =
  "field-input rounded-[10px] border-[#d2d2d7]/60 bg-white px-3 py-2 text-[13px] text-[#1d1d1f]";

export function AdminProductEditor({ productId }: AdminProductEditorProps) {
  const { getProductById, updateProduct, products } = useProductStore();
  const source = getProductById(productId);
  const [draft, setDraft] = useState<PremiumProduct | null>(source ?? null);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const next = getProductById(productId);
    if (next) setDraft(next);
  }, [productId, products, getProductById]);

  const previewColor = useMemo(
    () => draft?.images[0],
    [draft?.images],
  );

  const hasMissingImages = useMemo(() => {
    if (!draft) return false;
    return (draft.variants ?? draft.images ?? []).some(
      (variant) => variant.imageMissing || isPlaceholderImagePath(variant.image),
    );
  }, [draft]);

  const crossSellOptions = useMemo(() => getAllCrossSellOptions(), []);

  if (!draft) {
    return (
      <div className="rounded-[18px] bg-white p-8 text-center shadow-sm">
        <p className="text-[16px] text-[#6e6e73]">Produkt nicht gefunden.</p>
        <Link href="/admin/products" className="mt-4 inline-block text-accent hover:underline">
          Zurück zur Liste
        </Link>
      </div>
    );
  }

  function patch(partial: Partial<PremiumProduct>) {
    setDraft((current) => (current ? { ...current, ...partial } : current));
    setSaved(false);
    setSaveError(null);
  }

  function patchSpecs(partial: Partial<AdminProductSpecs>) {
    setDraft((current) =>
      current
        ? {
            ...current,
            adminSpecs: { ...current.adminSpecs, ...partial },
            specifications: specsToLegacy({ ...current.adminSpecs, ...partial }),
          }
        : current,
    );
    setSaved(false);
  }

  function updateVariant(index: number, partial: Partial<ProductVariant>) {
    setDraft((current) => {
      if (!current?.variants?.length) return current;
      const variants = current.variants.map((variant, i) => {
        if (i !== index) return variant;
        const next = { ...variant, ...partial };
        if (partial.colorName) {
          next.id = slugifyColorId(partial.colorName);
        }
        return next;
      });
      return syncProductVariants({ ...current, variants });
    });
    setSaved(false);
  }

  function updateVariantStorage(
    variantIndex: number,
    storageIndex: number,
    partial: Partial<StorageOption>,
  ) {
    setDraft((current) => {
      if (!current?.variants?.length) return current;
      const variants = current.variants.map((variant, i) => {
        if (i !== variantIndex) return variant;
        return {
          ...variant,
          storageOptions: variant.storageOptions.map((option, j) =>
            j === storageIndex
              ? ensureStorageConditions({ ...option, ...partial })
              : option,
          ),
        };
      });
      return syncProductVariants({ ...current, variants });
    });
    setSaved(false);
  }

  function updateVariantCondition(
    variantIndex: number,
    storageIndex: number,
    condition: ConditionId,
    patch: Partial<Pick<ConditionOption, "price" | "stock" | "active" | "note" | "sku">>,
  ) {
    setDraft((current) => {
      if (!current?.variants?.length) return current;
      const variants = current.variants.map((variant, i) => {
        if (i !== variantIndex) return variant;
        return {
          ...variant,
          storageOptions: variant.storageOptions.map((option, j) =>
            j === storageIndex ? applyConditionPatch(option, condition, patch) : option,
          ),
        };
      });
      return syncProductVariants({ ...current, variants });
    });
    setSaved(false);
  }

  function addVariantStorage(variantIndex: number) {
    setDraft((current) => {
      if (!current?.variants?.length) return current;
      const variants = current.variants.map((variant, i) => {
        if (i !== variantIndex) return variant;
        return {
          ...variant,
          storageOptions: [
            ...variant.storageOptions,
            ensureStorageConditions({ storage: "", price: 0, stock: 0 }),
          ],
        };
      });
      return syncProductVariants({ ...current, variants });
    });
    setSaved(false);
  }

  function removeVariantStorage(variantIndex: number, storageIndex: number) {
    setDraft((current) => {
      if (!current?.variants?.length) return current;
      const variants = current.variants.map((variant, i) => {
        if (i !== variantIndex || variant.storageOptions.length <= 1) return variant;
        return {
          ...variant,
          storageOptions: variant.storageOptions.filter((_, j) => j !== storageIndex),
        };
      });
      return syncProductVariants({ ...current, variants });
    });
    setSaved(false);
  }

  function addVariant() {
    setDraft((current) => {
      if (!current) return current;
      const templateStorage =
        current.variants?.[0]?.storageOptions ??
        current.storageOptions.map((option) => ({ ...option }));
      const id = slugifyColorId(`neue-farbe-${Date.now()}`);
      const variants = [
        ...(current.variants ?? []),
        {
          id,
          colorName: "Neue Farbe",
          colorCode: "#d2d2d7",
          image: current.mainImage ?? current.images[0]?.image ?? "",
          storageOptions: templateStorage.map((option) =>
            ensureStorageConditions({ ...option }),
          ),
        },
      ];
      return syncProductVariants({ ...current, variants });
    });
    setSaved(false);
  }

  function removeVariant(index: number) {
    setDraft((current) => {
      if (!current?.variants || current.variants.length <= 1) return current;
      const variants = current.variants.filter((_, i) => i !== index);
      return syncProductVariants({ ...current, variants });
    });
    setSaved(false);
  }

  function updateListItem(
    key: "highlights" | "deliveryContent",
    index: number,
    value: string,
  ) {
    setDraft((current) => {
      if (!current) return current;
      const list = [...current[key]];
      list[index] = value;
      return { ...current, [key]: list };
    });
    setSaved(false);
  }

  function addListItem(key: "highlights" | "deliveryContent") {
    setDraft((current) => {
      if (!current) return current;
      return { ...current, [key]: [...current[key], "Neuer Eintrag"] };
    });
  }

  function removeListItem(key: "highlights" | "deliveryContent", index: number) {
    setDraft((current) => {
      if (!current) return current;
      return { ...current, [key]: current[key].filter((_, i) => i !== index) };
    });
  }

  function toggleCrossSellItem(
    key: "recommendedAccessories" | "similarProducts",
    productId: string,
  ) {
    setDraft((current) => {
      if (!current) return current;
      const list = current[key] ?? [];
      const next = list.includes(productId)
        ? list.filter((id) => id !== productId)
        : [...list, productId];
      return { ...current, [key]: next };
    });
    setSaved(false);
  }

  function addBundleOffer() {
    setDraft((current) => {
      if (!current) return current;
      const bundle: BundleOffer = {
        id: `bundle-${Date.now()}`,
        title: "Neues Bundle",
        productIds: [],
        discountLabel: "-10%",
      };
      return { ...current, bundleOffers: [...(current.bundleOffers ?? []), bundle] };
    });
    setSaved(false);
  }

  function updateBundleOffer(index: number, partial: Partial<BundleOffer>) {
    setDraft((current) => {
      if (!current) return current;
      const bundleOffers = (current.bundleOffers ?? []).map((bundle, i) =>
        i === index ? { ...bundle, ...partial } : bundle,
      );
      return { ...current, bundleOffers };
    });
    setSaved(false);
  }

  function removeBundleOffer(index: number) {
    setDraft((current) => {
      if (!current) return current;
      return {
        ...current,
        bundleOffers: (current.bundleOffers ?? []).filter((_, i) => i !== index),
      };
    });
    setSaved(false);
  }

  function toggleBundleProduct(bundleIndex: number, productId: string) {
    setDraft((current) => {
      if (!current) return current;
      const bundleOffers = (current.bundleOffers ?? []).map((bundle, i) => {
        if (i !== bundleIndex) return bundle;
        const nextIds = bundle.productIds.includes(productId)
          ? bundle.productIds.filter((id) => id !== productId)
          : [...bundle.productIds, productId];
        return { ...bundle, productIds: nextIds };
      });
      return { ...current, bundleOffers };
    });
    setSaved(false);
  }

  function handleSave() {
    if (!draft) return;

    const synced = syncProductVariants({
      ...draft,
      description: draft.shortDescription,
      features: draft.highlights,
      boxContents: draft.deliveryContent,
      specifications: specsToLegacy(draft.adminSpecs),
      stock: getTotalStock(draft),
    });

    const priceErrors = validateVariantPrices(synced);
    const imageErrors = validateVariantImagePaths(synced);

    // Duplicate SKUs and placeholder images are data-quality issues, not
    // reasons to throw away a price edit — both already surface their own
    // persistent warning elsewhere (the SKU under each condition row, the
    // "Produktbild fehlt" banner above). Only genuinely broken pricing
    // (missing storage, no active condition, price <= 0) blocks the save.
    const blockingErrors = priceErrors.filter((error) => !error.startsWith("Doppelte SKU:"));
    const warnings = [
      ...priceErrors.filter((error) => error.startsWith("Doppelte SKU:")),
      ...imageErrors,
    ];

    if (blockingErrors.length > 0) {
      setSaveError(blockingErrors.join(" "));
      setSaveWarning(null);
      setSaved(false);
      return;
    }

    updateProduct(synced);
    setSaveError(null);
    setSaveWarning(warnings.length > 0 ? warnings.join(" ") : null);
    setSaved(true);
  }

  const variants = draft.variants ?? [];
  const totalStock = getTotalStock(draft);
  const adminStatus = getAdminStatusLabel(draft);
  const shopVisible = isProductVisibleInShop(draft);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/admin/products" className="text-[13px] text-[#6e6e73] hover:text-[#1d1d1f]">
            ← Produkte
          </Link>
          <h1 className="admin-page-title">
            {draft.brand} {draft.name}
          </h1>
          <p className="admin-page-subtitle">Produkt bearbeiten</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/products/${draft.slug}`}
            target="_blank"
            className="btn-techbuy-secondary px-5 py-2.5 text-[14px]"
          >
            Vorschau
          </Link>
          <button
            type="button"
            onClick={handleSave}
            className="btn-techbuy-primary px-5 py-2.5 text-[14px]"
          >
            Speichern
          </button>
        </div>
      </div>

      {saveError && <div className="admin-alert-error">{saveError}</div>}

      {hasMissingImages && (
        <div className="admin-alert-warning">
          <p className="font-medium">⚠ Produktbild fehlt</p>
          <p className="mt-1">
            Mindestens eine Farbvariante nutzt noch den Platzhalter. Bitte in „Farben & Bilder“ einen
            korrekten Pfad hinterlegen („Bild hinzufügen“).
          </p>
        </div>
      )}

      {saved && (
        <div className="admin-alert-success">Änderungen gespeichert — sichtbar im Shop nach Reload.</div>
      )}

      {saveWarning && <div className="admin-alert-warning">{saveWarning}</div>}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="rounded-[18px] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
            <h2 className="mb-5 text-[18px] font-semibold text-[#1d1d1f]">Basisinformationen</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Marke">
                <input
                  className={inputClass}
                  value={draft.brand}
                  onChange={(e) => patch({ brand: e.target.value })}
                />
              </Field>
              <Field label="Modellname">
                <input
                  className={inputClass}
                  value={draft.name}
                  onChange={(e) => patch({ name: e.target.value })}
                />
              </Field>
              <Field label="Modell">
                <input
                  className={inputClass}
                  value={draft.model}
                  onChange={(e) =>
                    patch({ model: e.target.value, name: e.target.value })
                  }
                />
              </Field>
              <Field label="Generation">
                <input
                  className={inputClass}
                  value={draft.generation}
                  onChange={(e) => patch({ generation: e.target.value })}
                />
              </Field>
              <Field label="Kurzbeschreibung">
                <input
                  className={inputClass}
                  value={draft.shortDescription}
                  onChange={(e) =>
                    patch({ shortDescription: e.target.value, tagline: e.target.value })
                  }
                />
              </Field>
              <Field label="Bestand & Sichtbarkeit">
                <div className="space-y-3 rounded-[12px] border border-[#d2d2d7]/50 bg-[#f5f5f7]/60 p-4">
                  <p className="text-[14px] font-medium text-[#1d1d1f]">
                    {adminStatus.emoji} {adminStatus.label}
                  </p>
                  <p className="text-[13px] text-[#6e6e73]">
                    Bestand gesamt: {totalStock}
                  </p>
                  <p className="text-[13px] text-[#6e6e73]">
                    Im Shop: {shopVisible ? "sichtbar" : "ausgeblendet"}
                  </p>
                  <label className="flex items-center gap-2 text-[13px] text-[#1d1d1f]">
                    <input
                      type="checkbox"
                      checked={Boolean(draft.manualArchive)}
                      onChange={(e) => patch({ manualArchive: e.target.checked })}
                      className="h-4 w-4 rounded border-[#d2d2d7] accent-accent"
                    />
                    Produkt manuell archivieren
                  </label>
                  <label className="flex items-center gap-2 text-[13px] text-[#1d1d1f]">
                    <input
                      type="checkbox"
                      checked={draft.saleMode === "presale"}
                      onChange={(e) =>
                        patch({
                          saleMode: e.target.checked ? "presale" : "standard",
                        })
                      }
                      className="h-4 w-4 rounded border-[#d2d2d7] accent-accent"
                    />
                    Vorverkauf aktivieren (auch ohne Bestand im Shop sichtbar)
                  </label>
                  {draft.saleMode === "presale" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="text-[12px] text-[#1d1d1f]">
                        <span className="mb-1 block font-medium">Lieferhinweis</span>
                        <input
                          className={inputClass}
                          value={draft.presaleShipLabel ?? ""}
                          onChange={(e) => patch({ presaleShipLabel: e.target.value })}
                          placeholder="z. B. Versand ab Ende März"
                        />
                      </label>
                      <label className="text-[12px] text-[#1d1d1f]">
                        <span className="mb-1 block font-medium">Erwartetes Datum</span>
                        <input
                          type="date"
                          className={inputClass}
                          value={draft.presaleShipDate ?? ""}
                          onChange={(e) => patch({ presaleShipDate: e.target.value })}
                        />
                      </label>
                    </div>
                  )}
                  <p className="text-[12px] text-[#86868b]">
                    Ohne Bestand und ohne Vorverkauf erscheint das Produkt nicht im Shop.
                    Bestand pro Zustand unten bei Speicher & Zustände pflegen.
                  </p>
                </div>
              </Field>
            </div>
            <div className="mt-5">
              <Field label="Ausführliche Beschreibung">
                <RichTextEditor
                  value={draft.longDescription}
                  onChange={(html) => patch({ longDescription: html })}
                  placeholder="Produktbeschreibung eingeben…"
                />
              </Field>
            </div>
          </section>

          <section className="rounded-[18px] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
            <h2 className="mb-2 text-[18px] font-semibold text-[#1d1d1f]">Varianten</h2>
            <p className="mb-5 text-[13px] text-[#6e6e73]">
              Farbe → Speicher → Zustand mit eigenem Preis und Bestand. Deaktivierte Zustände bleiben
              gespeichert, erscheinen aber nicht im Shop.
            </p>
            <Link
              href="/admin/bulk"
              className="mb-5 inline-block text-[13px] font-medium text-accent hover:underline"
            >
              Zur Massenbearbeitung →
            </Link>
            <Field label="Hauptbild URL (Fallback)">
              <input
                className={inputClass}
                value={draft.mainImage ?? ""}
                onChange={(e) => patch({ mainImage: e.target.value })}
              />
            </Field>
            {previewColor && (
              <div className="relative mt-4 h-40 w-40 overflow-hidden rounded-[16px] bg-[#f5f5f7]">
                <Image
                  src={previewColor.image}
                  alt={previewColor.colorName}
                  fill
                  className="object-contain p-3"
                />
              </div>
            )}
            <div className="mt-6 space-y-6">
              {variants.map((variant, variantIndex) => (
                <div
                  key={variant.id}
                  className="rounded-[14px] border border-[#d2d2d7]/40 p-4"
                >
                  <div className="grid gap-3 md:grid-cols-[80px_1fr_auto]">
                    <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-background-secondary">
                      <Image
                        src={variant.image}
                        alt={variant.colorName}
                        fill
                        className="object-contain p-2"
                        onError={() =>
                          setBrokenImages((current) => ({ ...current, [variant.id]: true }))
                        }
                        onLoad={() =>
                          setBrokenImages((current) => {
                            if (!current[variant.id]) return current;
                            const next = { ...current };
                            delete next[variant.id];
                            return next;
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="sm:col-span-3">
                        {(variant.imageMissing || brokenImages[variant.id]) && (
                          <div className="mb-2 rounded-[10px] bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
                            <p className="font-medium">⚠ Produktbild fehlt</p>
                            <p className="mt-1 text-amber-700">
                              Bitte unten einen korrekten Bildpfad für {variant.colorName} hinterlegen
                              („Bild hinzufügen“).
                            </p>
                          </div>
                        )}
                      </div>
                      <input
                        className={inputClass}
                        value={variant.colorName}
                        placeholder="Farbname"
                        onChange={(e) => updateVariant(variantIndex, { colorName: e.target.value })}
                      />
                      <input
                        className={inputClass}
                        value={variant.colorCode}
                        placeholder="#FF6A00"
                        onChange={(e) => updateVariant(variantIndex, { colorCode: e.target.value })}
                      />
                      <input
                        className={inputClass}
                        value={variant.image}
                        placeholder="Bild-URL"
                        onChange={(e) => updateVariant(variantIndex, { image: e.target.value })}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(variantIndex)}
                      className="text-[13px] text-red-600 hover:underline"
                    >
                      Variante entfernen
                    </button>
                  </div>

                  <div className="mt-3 space-y-3">
                    <p className="text-[12px] font-medium text-[#6e6e73]">
                      Speicher & Zustände
                    </p>
                    {variant.storageOptions.map((option, storageIndex) => {
                      const ensured = ensureStorageConditions(option);
                      const conditions = ensured.conditions ?? [];
                      return (
                        <details
                          key={`${variant.id}-${storageIndex}`}
                          className="rounded-[12px] border border-[#d2d2d7]/50 bg-[#fbfbfd] open:bg-white"
                          open={storageIndex === 0}
                        >
                          <summary className="cursor-pointer list-none px-3 py-3 text-[13px] font-medium text-[#1d1d1f] marker:content-none [&::-webkit-details-marker]:hidden">
                            <div className="flex flex-wrap items-center gap-2">
                              <input
                                className={`${compactInputClass} w-[108px]`}
                                value={option.storage}
                                placeholder="128 GB"
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) =>
                                  updateVariantStorage(variantIndex, storageIndex, {
                                    storage: e.target.value,
                                  })
                                }
                              />
                              <span className="text-[12px] text-[#6e6e73]">
                                ab {option.price > 0 ? formatPrice(option.price) : "—"} ·{" "}
                                {option.stock ?? 0} Stück
                              </span>
                              {variant.storageOptions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    removeVariantStorage(variantIndex, storageIndex);
                                  }}
                                  className="ml-auto text-[12px] text-red-600 hover:underline"
                                >
                                  Entfernen
                                </button>
                              )}
                            </div>
                          </summary>

                          <div className="space-y-2 border-t border-[#d2d2d7]/40 px-3 py-3">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-[#86868b]">
                              Zustände
                            </p>
                            {CONDITION_IDS.map((conditionId) => {
                              const entry =
                                conditions.find((c) => c.condition === conditionId) ??
                                ({
                                  condition: conditionId,
                                  label: conditionId,
                                  price: 0,
                                  stock: 0,
                                  active: false,
                                } as ConditionOption);
                              return (
                                <div
                                  key={conditionId}
                                  className="grid gap-2 rounded-[10px] border border-[#d2d2d7]/40 bg-[#f5f5f7]/50 p-2.5 sm:grid-cols-[auto_1fr_auto_auto]"
                                >
                                  <label className="flex items-center gap-2 text-[13px] font-medium text-[#1d1d1f] sm:min-w-[120px]">
                                    <input
                                      type="checkbox"
                                      checked={entry.active}
                                      onChange={(e) =>
                                        updateVariantCondition(
                                          variantIndex,
                                          storageIndex,
                                          conditionId,
                                          { active: e.target.checked },
                                        )
                                      }
                                      className="h-4 w-4 rounded border-[#d2d2d7] accent-accent"
                                    />
                                    {entry.label}
                                  </label>
                                  <div className="relative">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      inputMode="decimal"
                                      className={`${compactInputClass} w-full pr-7`}
                                      value={entry.price || ""}
                                      placeholder="Preis"
                                      onChange={(e) =>
                                        updateVariantCondition(
                                          variantIndex,
                                          storageIndex,
                                          conditionId,
                                          { price: normalizeStoragePrice(e.target.value) },
                                        )
                                      }
                                    />
                                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-[#86868b]">
                                      €
                                    </span>
                                  </div>
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    inputMode="numeric"
                                    className={`${compactInputClass} w-[84px]`}
                                    value={entry.stock}
                                    placeholder="Bestand"
                                    onChange={(e) =>
                                      updateVariantCondition(
                                        variantIndex,
                                        storageIndex,
                                        conditionId,
                                        { stock: Math.max(0, Number(e.target.value) || 0) },
                                      )
                                    }
                                  />
                                  <input
                                    className={`${compactInputClass} w-full sm:col-span-4`}
                                    value={entry.note ?? ""}
                                    placeholder="Optionaler Hinweis (z. B. kleiner Kratzer)"
                                    onChange={(e) =>
                                      updateVariantCondition(
                                        variantIndex,
                                        storageIndex,
                                        conditionId,
                                        { note: e.target.value },
                                      )
                                    }
                                  />
                                  {entry.sku && (
                                    <p className="text-[10px] text-[#86868b] sm:col-span-4">
                                      SKU: {entry.sku}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </details>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => addVariantStorage(variantIndex)}
                      className="text-[12px] font-medium text-accent hover:underline"
                    >
                      + Speicher hinzufügen
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="mt-4 text-[14px] font-medium text-accent hover:underline"
            >
              + Variante hinzufügen
            </button>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[18px] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
            <h2 className="mb-5 text-[18px] font-semibold text-[#1d1d1f]">Highlights</h2>
            <div className="space-y-2">
              {draft.highlights.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    className={inputClass}
                    value={item}
                    onChange={(e) => updateListItem("highlights", index, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem("highlights", index)}
                    className="text-[13px] text-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addListItem("highlights")}
              className="mt-3 text-[14px] font-medium text-accent hover:underline"
            >
              + Highlight
            </button>
          </section>

          <section className="rounded-[18px] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
            <h2 className="mb-5 text-[18px] font-semibold text-[#1d1d1f]">Lieferumfang</h2>
            <div className="space-y-2">
              {draft.deliveryContent.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    className={inputClass}
                    value={item}
                    onChange={(e) => updateListItem("deliveryContent", index, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem("deliveryContent", index)}
                    className="text-[13px] text-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addListItem("deliveryContent")}
              className="mt-3 text-[14px] font-medium text-accent hover:underline"
            >
              + Artikel hinzufügen
            </button>
          </section>

          <section className="rounded-[18px] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
            <h2 className="mb-2 text-[18px] font-semibold text-[#1d1d1f]">
              Cross-Selling & Empfehlungen
            </h2>
            <p className="mb-5 text-[13px] text-[#6e6e73]">
              Steuert die Empfehlungen im Warenkorb für dieses Produkt.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-[15px] font-semibold text-[#1d1d1f]">
                  Empfohlenes Zubehör
                </h3>
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-[12px] border border-[#d2d2d7]/40 p-3">
                  {crossSellOptions.map((option) => (
                    <label
                      key={`acc-${option.id}`}
                      className="flex cursor-pointer items-center gap-3 text-[13px] text-[#1d1d1f]"
                    >
                      <input
                        type="checkbox"
                        checked={(draft.recommendedAccessories ?? []).includes(option.id)}
                        onChange={() => toggleCrossSellItem("recommendedAccessories", option.id)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-[15px] font-semibold text-[#1d1d1f]">
                  Ähnliche Produkte
                </h3>
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-[12px] border border-[#d2d2d7]/40 p-3">
                  {crossSellOptions.map((option) => (
                    <label
                      key={`sim-${option.id}`}
                      className="flex cursor-pointer items-center gap-3 text-[13px] text-[#1d1d1f]"
                    >
                      <input
                        type="checkbox"
                        checked={(draft.similarProducts ?? []).includes(option.id)}
                        onChange={() => toggleCrossSellItem("similarProducts", option.id)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[15px] font-semibold text-[#1d1d1f]">Bundle-Angebote</h3>
                  <button
                    type="button"
                    onClick={addBundleOffer}
                    className="text-[13px] font-medium text-accent hover:underline"
                  >
                    + Bundle hinzufügen
                  </button>
                </div>
                <div className="space-y-4">
                  {(draft.bundleOffers ?? []).map((bundle, index) => (
                    <div
                      key={bundle.id}
                      className="rounded-[14px] border border-[#d2d2d7]/40 p-4"
                    >
                      <div className="grid gap-3 md:grid-cols-2">
                        <input
                          className={inputClass}
                          value={bundle.title}
                          placeholder="Bundle-Titel"
                          onChange={(e) => updateBundleOffer(index, { title: e.target.value })}
                        />
                        <input
                          className={inputClass}
                          value={bundle.discountLabel ?? ""}
                          placeholder="-10%"
                          onChange={(e) =>
                            updateBundleOffer(index, { discountLabel: e.target.value })
                          }
                        />
                      </div>
                      <div className="mt-3 max-h-36 space-y-2 overflow-y-auto">
                        {crossSellOptions.map((option) => (
                          <label
                            key={`${bundle.id}-${option.id}`}
                            className="flex cursor-pointer items-center gap-3 text-[13px]"
                          >
                            <input
                              type="checkbox"
                              checked={bundle.productIds.includes(option.id)}
                              onChange={() => toggleBundleProduct(index, option.id)}
                            />
                            {option.label}
                          </label>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBundleOffer(index)}
                        className="mt-3 text-[13px] text-red-600 hover:underline"
                      >
                        Bundle entfernen
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[18px] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
            <h2 className="mb-5 text-[18px] font-semibold text-[#1d1d1f]">Technische Daten</h2>
            <div className="space-y-3">
              {(
                [
                  ["display", "Display"],
                  ["camera", "Kamera"],
                  ["chip", "Chip"],
                  ["battery", "Akku"],
                  ["storage", "Speicher"],
                  ["protection", "Schutz"],
                  ["operatingSystem", "Betriebssystem"],
                ] as const
              ).map(([key, label]) => (
                <Field key={key} label={label}>
                  <input
                    className={inputClass}
                    value={draft.adminSpecs[key]}
                    onChange={(e) => patchSpecs({ [key]: e.target.value })}
                  />
                </Field>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

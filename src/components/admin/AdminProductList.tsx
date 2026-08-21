"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useProductStore } from "@/context/ProductStoreContext";
import { formatPrice } from "@/data/products";
import { getProductMinPrice } from "@/data/premiumCatalog";
import {
  getAdminStatusLabel,
  getProductAvailabilityStatus,
  getTotalStock,
  isLowStockProduct,
  isProductVisibleInShop,
} from "@/lib/productAvailability";
import { isPlaceholderImagePath } from "@/lib/validateVariantImages";

const BRAND_OPTIONS = ["Alle", "Apple", "Samsung", "Google"] as const;
const CATEGORY_OPTIONS = [
  { id: "all", label: "Alle Kategorien" },
  { id: "smartphones", label: "Smartphones" },
  { id: "tablets", label: "Tablets" },
] as const;
const AVAILABILITY_FILTERS = [
  { id: "all", label: "Alle" },
  { id: "available", label: "Verfügbar" },
  { id: "presale", label: "Vorverkauf" },
  { id: "low_stock", label: "Niedriger Bestand" },
  { id: "out_of_stock", label: "Ausverkauft" },
  { id: "archived", label: "Archiviert" },
] as const;

export function AdminProductList() {
  const { products, updateProduct } = useProductStore();
  const [brandFilter, setBrandFilter] = useState<string>("Alle");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    return products.filter((product) => {
      if (brandFilter !== "Alle" && product.brand !== brandFilter) return false;
      if (categoryFilter !== "all" && product.catalogCategory !== categoryFilter) return false;

      const status = getProductAvailabilityStatus(product);
      if (availabilityFilter === "available" && status !== "available") return false;
      if (availabilityFilter === "presale" && status !== "presale") return false;
      if (availabilityFilter === "archived" && status !== "archived") return false;
      if (availabilityFilter === "low_stock" && !isLowStockProduct(product)) return false;
      if (availabilityFilter === "out_of_stock" && status !== "out_of_stock") return false;

      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        product.name.toLowerCase().includes(q) ||
        product.model.toLowerCase().includes(q) ||
        product.generation.toLowerCase().includes(q) ||
        product.slug.includes(q)
      );
    });
  }, [products, brandFilter, categoryFilter, availabilityFilter, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="admin-page-title">Produkte</h1>
          <p className="admin-page-subtitle">
            {products.length} Geräte im Katalog — Farbe, Speicher, Zustand, Preise und Bestand
            verwalten.
          </p>
        </div>
        <Link href="/admin/bulk" className="btn-techbuy-secondary px-4 py-2.5 text-[13px]">
          Massenbearbeitung
        </Link>
      </div>

      <div className="admin-toolbar grid gap-3 md:grid-cols-5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Modell suchen…"
          className="shop-admin-control"
        />
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="shop-admin-control"
        >
          {BRAND_OPTIONS.map((brand) => (
            <option key={brand} value={brand}>
              {brand === "Alle" ? "Alle Marken" : brand}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="shop-admin-control"
        >
          {CATEGORY_OPTIONS.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
        <select
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value)}
          className="shop-admin-control"
        >
          {AVAILABILITY_FILTERS.map((filter) => (
            <option key={filter.id} value={filter.id}>
              {filter.label}
            </option>
          ))}
        </select>
        <p className="flex items-center text-[14px] text-text-secondary">
          {items.length} Ergebnisse
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((product) => {
          const priceFrom = getProductMinPrice(product);
          const image = product.images[0]?.image ?? product.mainImage ?? "";
          const missingImages = (product.variants ?? product.images ?? []).some(
            (variant) => variant.imageMissing || isPlaceholderImagePath(variant.image),
          );
          const totalStock = getTotalStock(product);
          const adminStatus = getAdminStatusLabel(product);
          const shopVisible = isProductVisibleInShop(product);

          return (
            <article
              key={product.id}
              className="flex gap-4 rounded-[18px] bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[14px] bg-[#f5f5f7]">
                {image && (
                  <Image src={image} alt={product.name} fill className="object-contain p-2" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium uppercase tracking-wide text-[#6e6e73]">
                  {product.brand} · {product.generation}
                </p>
                <h2 className="text-[18px] font-semibold text-[#1d1d1f]">{product.model}</h2>
                <p className="mt-1 text-[12px] font-medium text-[#1d1d1f]">
                  {adminStatus.emoji} {adminStatus.label}
                </p>
                {missingImages && (
                  <p className="mt-1 text-[12px] font-medium text-amber-700">
                    ⚠ Produktbild fehlt —{" "}
                    <Link href={`/admin/products/${product.id}`} className="underline hover:text-accent">
                      Bild hinzufügen
                    </Link>
                  </p>
                )}
                <p className="mt-1 text-[13px] text-[#6e6e73]">
                  {product.images.length} Farben · {product.storageOptions.length} Varianten ·{" "}
                  Bestand gesamt: {totalStock}
                </p>
                <p className="text-[12px] text-[#86868b]">
                  Im Shop: {shopVisible ? "sichtbar" : "ausgeblendet"}
                </p>
                <p className="mt-2 text-[15px] font-semibold text-[#1d1d1f]">
                  ab {formatPrice(priceFrom)}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="btn-techbuy-primary px-4 py-2 text-[13px]"
                  >
                    Bearbeiten
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      updateProduct({
                        ...product,
                        manualArchive: !product.manualArchive,
                      })
                    }
                    className="rounded-xl border border-border bg-white px-3 py-2 text-[12px] font-medium text-text-secondary hover:text-text-primary"
                  >
                    {product.manualArchive ? "Wiederherstellen" : "Archivieren"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

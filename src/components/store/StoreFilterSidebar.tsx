"use client";

import type { StoreFilters } from "@/lib/storeCatalog";
import {
  getAvailableGenerations,
  getAvailableModels,
  getAvailableSeries,
  getAvailableStorages,
  SORT_OPTIONS,
  STORE_CATEGORY_TABS,
} from "@/lib/storeCatalog";
import type { Product } from "@/data/products";
import { BRAND_FILTER_OPTIONS } from "@/lib/filterProducts";

interface StoreFilterSidebarProps {
  filters: StoreFilters;
  products: Product[];
  onChange: (partial: Partial<StoreFilters>) => void;
  className?: string;
}

export function StoreFilterSidebar({
  filters,
  products,
  onChange,
  className = "",
}: StoreFilterSidebarProps) {
  const models = getAvailableModels(products);
  const generations = getAvailableGenerations(products);
  const storages = getAvailableStorages(products);
  const series = getAvailableSeries(products, filters.category);
  const showSeries =
    filters.category === "smartphones" ||
    (filters.category === "all" &&
      products.some((product) => product.catalogCategory === "smartphones"));

  return (
    <aside className={`space-y-6 ${className}`}>
      <div>
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-text-secondary">
          Filter
        </h2>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={filters.availableOnly}
          onChange={(e) => onChange({ availableOnly: e.target.checked })}
          className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
        />
        <span className="text-[13px] font-medium text-text-primary">Nur verfügbare</span>
      </label>

      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-text-primary">Kategorie</span>
        <select
          value={filters.category}
          onChange={(e) =>
            onChange({
              category: e.target.value as StoreFilters["category"],
              series: "all",
            })
          }
          className="shop-filter-control w-full"
        >
          <option value="all">Alle Kategorien</option>
          {STORE_CATEGORY_TABS.filter((tab) => tab.id !== "all").map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-text-primary">Hersteller</span>
        <select
          value={filters.brand}
          onChange={(e) =>
            onChange({ brand: e.target.value as StoreFilters["brand"] })
          }
          className="shop-filter-control w-full"
        >
          {BRAND_FILTER_OPTIONS.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.label === "Alle" ? "Alle Marken" : brand.label}
            </option>
          ))}
        </select>
      </label>

      {showSeries && (
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-text-primary">Serie</span>
          <select
            value={filters.series}
            onChange={(e) => onChange({ series: e.target.value })}
            className="shop-filter-control w-full"
          >
            <option value="all">Alle Serien</option>
            {series.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-text-primary">Modell</span>
        <select
          value={filters.model}
          onChange={(e) => onChange({ model: e.target.value })}
          className="shop-filter-control w-full"
        >
          <option value="all">Alle Modelle</option>
          {models.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-text-primary">Generation</span>
        <select
          value={filters.generation}
          onChange={(e) => onChange({ generation: e.target.value })}
          className="shop-filter-control w-full"
        >
          <option value="all">Alle Generationen</option>
          {generations.map((generation) => (
            <option key={generation} value={generation}>
              {generation}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-text-primary">Speicher</span>
        <select
          value={filters.storage}
          onChange={(e) => onChange({ storage: e.target.value })}
          className="shop-filter-control w-full"
        >
          <option value="all">Alle Speichergrößen</option>
          {storages.map((storage) => (
            <option key={storage} value={storage}>
              {storage}
            </option>
          ))}
        </select>
      </label>

      <div>
        <span className="mb-2 block text-[13px] font-medium text-text-primary">Preis</span>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={filters.minPrice ?? ""}
            onChange={(e) =>
              onChange({
                minPrice: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="shop-filter-input"
          />
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={filters.maxPrice ?? ""}
            onChange={(e) =>
              onChange({
                maxPrice: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="shop-filter-input"
          />
        </div>
      </div>

      <div className="rounded-[16px] border border-border bg-white px-4 py-3">
        <p className="text-[13px] font-medium text-text-primary">Verfügbarkeit</p>
        <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">
          Es werden nur Produkte mit verfügbarem Bestand angezeigt.
        </p>
      </div>
    </aside>
  );
}

export function StoreSortSelect({
  value,
  onChange,
  className = "",
}: {
  value: StoreFilters["sort"];
  onChange: (sort: StoreFilters["sort"]) => void;
  className?: string;
}) {
  return (
    <label className={`flex items-center gap-2 ${className}`}>
      <span className="shrink-0 text-[13px] text-text-secondary">Sortieren nach</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as StoreFilters["sort"])}
        className="shop-filter-control min-h-[44px] min-w-[180px]"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

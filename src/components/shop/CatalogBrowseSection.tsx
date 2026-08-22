"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { CatalogCategoryId } from "@/data/catalogCategories";
import { getCatalogProductsByCategory } from "@/data/catalogProducts";
import { useProductStore } from "@/context/ProductStoreContext";
import { accessoryProducts } from "@/data/accessoryCatalog";
import {
  applyAdvancedProductFilters,
  BRAND_FILTER_OPTIONS,
  DEFAULT_CATALOG_FILTERS,
  getAvailableColors,
  getAvailableGenerations,
  getAvailableModels,
  getAvailableStorages,
  type BrandFilterValue,
  type CatalogFilters,
  type SortOption,
} from "@/lib/filterProducts";
import { getProductsByBrandAndCategory } from "@/lib/catalog";
import { premiumToLegacyProduct } from "@/lib/productAdapters";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ProductCard } from "@/components/ProductCard";
import { BrandFilter } from "@/components/shop/BrandFilter";
import { ManufacturerFilterBar } from "@/components/shop/ManufacturerFilterBar";
import { SortFilterBar } from "@/components/shop/SortFilterBar";
import type { Product } from "@/data/products";

/** Brand sections for the compact smartphone catalogue layout. */
const COMPACT_BRAND_SECTIONS: { brand: string; title: string }[] = [
  { brand: "Apple", title: "Apple / iPhone" },
  { brand: "Samsung", title: "Samsung Smartphones" },
  { brand: "Google", title: "Google Pixel" },
];

const COMPACT_PRODUCT_GRID =
  "grid grid-cols-2 gap-2 min-[480px]:gap-2.5 md:grid-cols-3 lg:grid-cols-4 lg:gap-3";

interface CatalogBrowseSectionProps {
  categoryId?: CatalogCategoryId;
  brand?: string;
  title: string;
  subtitle?: string;
  emptyMessage?: string;
  /** Kompakte Smartphone-Schaufenster mit Herstellerleiste unter der Überschrift */
  compactLayout?: boolean;
  /** Skip fixed-header top padding when a hero already sits above this section. */
  flushTop?: boolean;
}

function ProductGrid({
  products,
  compact,
}: {
  products: Product[];
  compact: boolean;
}) {
  return (
    <div
      className={
        compact
          ? COMPACT_PRODUCT_GRID
          : "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4"
      }
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          variant="dark"
          size={compact ? "compact" : "default"}
          index={index}
        />
      ))}
    </div>
  );
}

export function CatalogBrowseSection({
  categoryId,
  brand,
  title,
  subtitle,
  emptyMessage = "Keine Produkte für diese Auswahl gefunden.",
  compactLayout = false,
  flushTop = false,
}: CatalogBrowseSectionProps) {
  const searchParams = useSearchParams();
  const brandFromUrl = searchParams.get("brand");
  const initialBrand =
    BRAND_FILTER_OPTIONS.find((option) => option.id === brandFromUrl)?.id ??
    (brand === "Apple"
      ? "apple"
      : brand === "Samsung"
        ? "samsung"
        : brand === "Google"
          ? "google"
          : "all");

  const { ref, isVisible } = useScrollAnimation<HTMLElement>();
  const { products: storeProducts, ready } = useProductStore();
  const [filters, setFilters] = useState<CatalogFilters>({
    ...DEFAULT_CATALOG_FILTERS,
    brand: initialBrand as BrandFilterValue,
  });

  const allProducts = useMemo(() => {
    void ready;
    if (storeProducts.length > 0) {
      let devices = storeProducts.map(premiumToLegacyProduct);
      if (categoryId) {
        devices = devices.filter((product) => product.catalogCategory === categoryId);
      }
      const accessories = accessoryProducts.filter((product) =>
        categoryId ? product.catalogCategory === categoryId : true,
      );
      let merged = [...devices, ...accessories];
      if (brand) {
        merged = merged.filter(
          (product) => product.brand.toLowerCase() === brand.toLowerCase(),
        );
      }
      return merged;
    }
    if (categoryId && brand) {
      return getProductsByBrandAndCategory(brand, categoryId);
    }
    if (categoryId) {
      return getCatalogProductsByCategory(categoryId);
    }
    if (brand) {
      return getProductsByBrandAndCategory(brand);
    }
    return getCatalogProductsByCategory("smartphones");
  }, [categoryId, brand, ready, storeProducts]);

  const models = useMemo(() => getAvailableModels(allProducts), [allProducts]);
  const generations = useMemo(() => getAvailableGenerations(allProducts), [allProducts]);
  const storages = useMemo(() => getAvailableStorages(allProducts), [allProducts]);
  const colors = useMemo(() => getAvailableColors(allProducts), [allProducts]);

  const filteredProducts = useMemo(
    () => applyAdvancedProductFilters(allProducts, filters),
    [allProducts, filters],
  );

  const brandSections = useMemo(() => {
    if (!compactLayout) return [];

    const sections = COMPACT_BRAND_SECTIONS.map((section) => ({
      ...section,
      products: filteredProducts.filter(
        (product) => product.brand.toLowerCase() === section.brand.toLowerCase(),
      ),
    })).filter((section) => section.products.length > 0);

    const knownBrands = new Set(
      COMPACT_BRAND_SECTIONS.map((section) => section.brand.toLowerCase()),
    );
    const otherProducts = filteredProducts.filter(
      (product) => !knownBrands.has(product.brand.toLowerCase()),
    );
    if (otherProducts.length > 0) {
      sections.push({
        brand: "Other",
        title: "Weitere Smartphones",
        products: otherProducts,
      });
    }

    return sections;
  }, [compactLayout, filteredProducts]);

  return (
    <section
      ref={ref}
      className={`overflow-x-clip border-t border-border bg-background-secondary text-text-primary ${
        flushTop
          ? "py-5 md:py-7"
          : "py-7 pt-[80px] md:py-10 md:pt-[84px]"
      }`}
    >
      <div
        className={`mx-auto w-full min-w-0 max-w-[1280px] px-5 transition-all duration-700 ease-out md:px-8 lg:px-10 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-[15px] opacity-0"
        }`}
      >
        <div className={`min-w-0 ${compactLayout ? "mb-4" : "mb-6"}`}>
          <h1 className="text-balance text-[28px] font-bold tracking-[-0.03em] md:text-[36px]">{title}</h1>
          {subtitle && <p className="mt-1.5 text-[14px] text-text-secondary md:text-[15px]">{subtitle}</p>}

          {compactLayout && (
            <div className="mt-3">
              <ManufacturerFilterBar
                selectedBrand={filters.brand}
                onBrandChange={(brandValue) =>
                  setFilters((current) => ({ ...current, brand: brandValue }))
                }
              />
            </div>
          )}

          <p className={`${compactLayout ? "mt-3" : "mt-1.5"} text-[13px] text-text-secondary`}>
            {filteredProducts.length} von {allProducts.length} Produkten
          </p>
        </div>

        {!compactLayout && (
          <BrandFilter
            selectedBrand={filters.brand}
            selectedSort={filters.sort}
            onBrandChange={(brandValue) =>
              setFilters((current) => ({ ...current, brand: brandValue }))
            }
            onSortChange={(sort: SortOption) =>
              setFilters((current) => ({ ...current, sort }))
            }
          />
        )}

        <div className={`grid grid-cols-2 gap-3 md:grid-cols-4 ${compactLayout ? "mt-3 lg:grid-cols-6" : "mt-4 lg:grid-cols-6"}`}>
          <label className="block">
            <span className="mb-1.5 block text-[12px] text-text-secondary">Modell</span>
            <select
              value={filters.model}
              onChange={(e) =>
                setFilters((current) => ({ ...current, model: e.target.value }))
              }
              className="shop-filter-control"
            >
              <option value="all">Alle</option>
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] text-text-secondary">Generation</span>
            <select
              value={filters.generation}
              onChange={(e) =>
                setFilters((current) => ({ ...current, generation: e.target.value }))
              }
              className="shop-filter-control"
            >
              <option value="all">Alle</option>
              {generations.map((generation) => (
                <option key={generation} value={generation}>
                  {generation}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[12px] text-text-secondary">Speicher</span>
            <select
              value={filters.storage}
              onChange={(e) =>
                setFilters((current) => ({ ...current, storage: e.target.value }))
              }
              className="shop-filter-control"
            >
              <option value="all">Alle</option>
              {storages.map((storage) => (
                <option key={storage} value={storage}>
                  {storage}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[12px] text-text-secondary">Farbe</span>
            <select
              value={filters.color}
              onChange={(e) =>
                setFilters((current) => ({ ...current, color: e.target.value }))
              }
              className="shop-filter-control"
            >
              <option value="all">Alle</option>
              {colors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[12px] text-text-secondary">Min. Preis</span>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={filters.minPrice ?? ""}
              onChange={(e) =>
                setFilters((current) => ({
                  ...current,
                  minPrice: e.target.value ? Number(e.target.value) : null,
                }))
              }
              className="shop-filter-input"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[12px] text-text-secondary">Max. Preis</span>
            <input
              type="number"
              min={0}
              placeholder="2000"
              value={filters.maxPrice ?? ""}
              onChange={(e) =>
                setFilters((current) => ({
                  ...current,
                  maxPrice: e.target.value ? Number(e.target.value) : null,
                }))
              }
              className="shop-filter-input"
            />
          </label>
        </div>

        {compactLayout && (
          <div className="mt-3">
            <SortFilterBar
              selectedSort={filters.sort}
              onSortChange={(sort) => setFilters((current) => ({ ...current, sort }))}
            />
          </div>
        )}

        {filteredProducts.length > 0 ? (
          compactLayout ? (
            <div className="mt-5 space-y-6 md:space-y-7">
              {brandSections.map((section) => (
                <div key={section.brand}>
                  <h2 className="mb-2.5 text-[17px] font-semibold tracking-tight text-text-primary md:mb-3 md:text-[19px]">
                    {section.title}
                  </h2>
                  <ProductGrid products={section.products} compact />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-10">
              <ProductGrid products={filteredProducts} compact={false} />
            </div>
          )
        ) : (
          <p className="mt-10 rounded-[20px] border border-border bg-surface-card px-6 py-10 text-center text-[15px] text-text-secondary">
            {emptyMessage}
          </p>
        )}
      </div>
    </section>
  );
}

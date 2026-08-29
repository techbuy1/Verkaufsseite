"use client";

import type { Product } from "@/data/products";
import {
  applyStoreFilters,
  getStoreCategoryLabel,
  groupStoreProductsForDisplay,
  hasActiveStoreFilters,
  type StoreCategoryFilter,
  type StoreFilters,
} from "@/lib/storeCatalog";
import { sortProducts } from "@/lib/filterProducts";
import { StoreProductGridStatic } from "./StoreProductGridStatic";

interface StoreProductGridViewProps {
  filters: StoreFilters;
  allProducts: Product[];
  onResetFilters: () => void;
  onCategorySelect: (categoryId: StoreCategoryFilter) => void;
}

export function StoreProductGridView({
  filters,
  allProducts,
  onResetFilters,
  onCategorySelect,
}: StoreProductGridViewProps) {
  const filtered = applyStoreFilters(allProducts, filters);
  const showGrouped =
    filters.category === "all" && !hasActiveStoreFilters(filters);

  if (filtered.length === 0) {
    return (
      <div className="rounded-[24px] border border-border bg-white px-6 py-12 text-center shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <p className="text-[18px] font-semibold text-text-primary">
          Keine passenden Produkte gefunden.
        </p>
        <p className="mt-2 text-[14px] text-text-secondary">
          Passe deine Suche oder Filter an, um mehr Ergebnisse zu sehen.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="btn-techbuy-primary mt-6 inline-flex min-h-[44px] items-center px-6 text-[14px]"
        >
          Filter zurücksetzen
        </button>
      </div>
    );
  }

  if (showGrouped) {
    const grouped = groupStoreProductsForDisplay(filtered).map((group) => ({
      ...group,
      products: sortProducts(group.products, filters.sort),
    }));

    return (
      <div className="space-y-12">
        {grouped.map((group) => (
          <section key={group.categoryId}>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-[24px] font-bold tracking-[-0.02em] text-text-primary md:text-[28px]">
                  {group.label}
                </h2>
                <p className="mt-1 text-[13px] text-text-secondary">
                  {group.products.length} Produkte
                </p>
              </div>
              <button
                type="button"
                onClick={() => onCategorySelect(group.categoryId)}
                className="text-[13px] font-medium text-accent hover:underline"
              >
                Nur {getStoreCategoryLabel(group.categoryId)}
              </button>
            </div>
            <StoreProductGridStatic products={group.products} />
          </section>
        ))}
      </div>
    );
  }

  return (
    <StoreProductGridStatic products={sortProducts(filtered, filters.sort)} />
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getCatalogProducts } from "@/data/catalogProducts";
import { catalogCategories } from "@/data/catalogCategories";
import type { Product } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { ManufacturerFilterBar } from "@/components/shop/ManufacturerFilterBar";
import { useProductStore } from "@/context/ProductStoreContext";
import { accessoryProducts } from "@/data/accessoryCatalog";
import { sortProducts } from "@/lib/filterProducts";
import { premiumToLegacyProduct } from "@/lib/productAdapters";
import {
  applyStoreFilters,
  buildStoreSearchParams,
  DEFAULT_STORE_FILTERS,
  groupStoreProductsByCategory,
  hasActiveStoreFilters,
  parseStoreFilters,
  STORE_CATEGORY_TABS,
  type StoreFilters,
} from "@/lib/storeCatalog";
import {
  getCategoryLabel,
  StoreFilterSidebar,
  StoreSortSelect,
} from "./StoreFilterSidebar";
import { StoreMobileFilterSheet } from "./StoreMobileFilterSheet";

function StoreProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 justify-items-center gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} size="compact" />
      ))}
    </div>
  );
}

export function StorePageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { products: storeProducts, ready } = useProductStore();

  const filtersFromUrl = useMemo(
    () => parseStoreFilters(searchParams),
    [searchParams],
  );

  const [draftFilters, setDraftFilters] = useState<StoreFilters>(filtersFromUrl);
  const [searchInput, setSearchInput] = useState(filtersFromUrl.search);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setDraftFilters(filtersFromUrl);
    setSearchInput(filtersFromUrl.search);
  }, [filtersFromUrl]);

  const allProducts = useMemo(() => {
    void ready;
    if (storeProducts.length > 0) {
      return [...storeProducts.map(premiumToLegacyProduct), ...accessoryProducts];
    }
    return getCatalogProducts();
  }, [ready, storeProducts]);

  const filteredProducts = useMemo(
    () => applyStoreFilters(allProducts, filtersFromUrl),
    [allProducts, filtersFromUrl],
  );

  const groupedProducts = useMemo(
    () =>
      groupStoreProductsByCategory(filteredProducts).map((group) => ({
        ...group,
        products: sortProducts(group.products, filtersFromUrl.sort),
      })),
    [filteredProducts, filtersFromUrl.sort],
  );

  const showGroupedSections =
    filtersFromUrl.category === "all" && !hasActiveStoreFilters(filtersFromUrl);

  const updateUrl = useCallback(
    (nextFilters: StoreFilters) => {
      const params = buildStoreSearchParams(nextFilters);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const applyFilters = useCallback(
    (partial: Partial<StoreFilters>) => {
      const next = { ...draftFilters, ...partial };
      setDraftFilters(next);
      updateUrl(next);
    },
    [draftFilters, updateUrl],
  );

  const handleSearchSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      applyFilters({ search: searchInput.trim() });
    },
    [applyFilters, searchInput],
  );

  const resetFilters = useCallback(() => {
    setSearchInput("");
    setDraftFilters(DEFAULT_STORE_FILTERS);
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  return (
    <div className="min-h-screen bg-background-secondary pb-16 pt-[72px] text-text-primary">
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-[1280px] px-5 py-10 md:px-8 md:py-12 lg:px-10">
          <h1 className="text-balance text-[34px] font-bold tracking-[-0.03em] md:text-[44px]">
            TechBuy Store
          </h1>
          <p className="mt-3 max-w-[720px] text-[15px] leading-relaxed text-text-secondary md:text-[17px]">
            Entdecke unsere gesamte Auswahl an Smartphones, Tablets, Computern, Audio und
            Zubehör.
          </p>

          <form onSubmit={handleSearchSubmit} className="mt-8 max-w-[720px]">
            <label className="sr-only" htmlFor="store-search">
              Produkte durchsuchen
            </label>
            <div className="relative">
              <input
                id="store-search"
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Produkte durchsuchen"
                className="shop-filter-input min-h-[52px] w-full rounded-[18px] px-5 text-[15px] shadow-[0_2px_16px_rgba(0,0,0,0.04)]"
              />
              <button
                type="submit"
                className="btn-techbuy-primary absolute right-2 top-1/2 min-h-[40px] -translate-y-1/2 px-5 text-[13px]"
              >
                Suchen
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-[1280px] px-5 md:px-8 lg:px-10">
          <div className="-mx-1 overflow-x-auto px-1 pb-1 pt-4 scrollbar-hide">
            <div
              className="flex w-max min-w-full gap-2 pb-3"
              role="tablist"
              aria-label="Kategorien"
            >
              {STORE_CATEGORY_TABS.map((tab) => {
                const isActive = filtersFromUrl.category === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() =>
                      applyFilters({
                        category: tab.id,
                        series: "all",
                      })
                    }
                    className={`min-h-[44px] shrink-0 rounded-full px-4 text-[14px] font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-accent text-white"
                        : "border border-border bg-white text-text-primary hover:border-accent/40"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background-secondary py-4">
        <div className="mx-auto max-w-[1280px] px-5 md:px-8 lg:px-10">
          <ManufacturerFilterBar
            selectedBrand={filtersFromUrl.brand}
            onBrandChange={(brand) => applyFilters({ brand })}
          />
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-5 py-8 md:px-8 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8 lg:px-10 lg:py-10">
        <StoreFilterSidebar
          filters={filtersFromUrl}
          products={allProducts}
          onChange={applyFilters}
          className="hidden lg:block"
        />

        <div className="min-w-0">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[14px] text-text-secondary">
              {filteredProducts.length} von {allProducts.length} Produkten
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="btn-techbuy-secondary min-h-[44px] px-4 text-[14px] lg:hidden"
              >
                Filter
              </button>
              <StoreSortSelect
                value={filtersFromUrl.sort}
                onChange={(sort) => applyFilters({ sort })}
              />
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            showGroupedSections ? (
              <div className="space-y-12">
                {groupedProducts.map((group) => (
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
                        onClick={() =>
                          applyFilters({ category: group.categoryId, series: "all" })
                        }
                        className="text-[13px] font-medium text-accent hover:underline"
                      >
                        Nur {getCategoryLabel(group.categoryId)}
                      </button>
                    </div>
                    <StoreProductGrid products={group.products} />
                  </section>
                ))}
              </div>
            ) : (
              <StoreProductGrid products={filteredProducts} />
            )
          ) : (
            <div className="rounded-[24px] border border-border bg-white px-6 py-12 text-center shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
              <p className="text-[18px] font-semibold text-text-primary">
                Keine passenden Produkte gefunden.
              </p>
              <p className="mt-2 text-[14px] text-text-secondary">
                Passe deine Suche oder Filter an, um mehr Ergebnisse zu sehen.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="btn-techbuy-primary mt-6 min-h-[44px] px-6 text-[14px]"
              >
                Filter zurücksetzen
              </button>
            </div>
          )}
        </div>
      </div>

      <StoreMobileFilterSheet
        open={mobileFiltersOpen}
        filters={draftFilters}
        products={allProducts}
        onChange={(partial) => setDraftFilters((current) => ({ ...current, ...partial }))}
        onClose={() => {
          setDraftFilters(filtersFromUrl);
          setMobileFiltersOpen(false);
        }}
        onApply={() => {
          updateUrl(draftFilters);
          setMobileFiltersOpen(false);
        }}
      />
    </div>
  );
}

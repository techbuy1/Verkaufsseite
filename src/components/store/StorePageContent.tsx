"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/data/products";
import { useProductStore } from "@/context/ProductStoreContext";
import { summaryToLegacyProduct } from "@/lib/catalogSummary";
import { getAccessoryProducts } from "@/lib/catalog";
import { ManufacturerFilterBar } from "@/components/shop/ManufacturerFilterBar";
import {
  applyStoreFilters,
  buildStoreSearchParams,
  DEFAULT_STORE_FILTERS,
  hasActiveStoreFilters,
  parseStoreFilters,
  STORE_CATEGORY_TABS,
  type StoreFilters,
} from "@/lib/storeCatalog";
import { StoreFilterSidebar, StoreSortSelect } from "./StoreFilterSidebar";
import { StoreMobileFilterSheet } from "./StoreMobileFilterSheet";
import { StoreProductGridView } from "./StoreProductGridView";

interface StorePageContentProps {
  initialProducts: Product[];
}

export function StorePageContent({ initialProducts }: StorePageContentProps) {
  const { products: summaries, ready } = useProductStore();
  const catalogProducts = useMemo(() => {
    if (!ready || summaries.length === 0) return initialProducts;
    return [
      ...summaries.map(summaryToLegacyProduct),
      ...getAccessoryProducts().filter((product) => !product.hiddenFromListing),
    ];
  }, [initialProducts, ready, summaries]);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startFilterTransition] = useTransition();

  const filters = useMemo(
    () => parseStoreFilters(searchParams),
    [searchParams],
  );

  const [draftFilters, setDraftFilters] = useState<StoreFilters>(filters);
  const [searchInput, setSearchInput] = useState(filters.search);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setDraftFilters(filters);
    setSearchInput(filters.search);
  }, [filters]);

  const filteredCount = useMemo(
    () => applyStoreFilters(catalogProducts, filters).length,
    [catalogProducts, filters],
  );

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
      const next = { ...filters, ...partial };
      setDraftFilters(next);
      if ("search" in partial) {
        setSearchInput(next.search);
      }
      startFilterTransition(() => {
        updateUrl(next);
      });
    },
    [filters, updateUrl],
  );

  const resetFilters = useCallback(() => {
    setDraftFilters(DEFAULT_STORE_FILTERS);
    setSearchInput("");
    startFilterTransition(() => {
      updateUrl(DEFAULT_STORE_FILTERS);
    });
  }, [updateUrl]);

  const handleSearchSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      applyFilters({ search: searchInput.trim() });
    },
    [applyFilters, searchInput],
  );

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
                const isActive = filters.category === tab.id;
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
            selectedBrand={filters.brand}
            onBrandChange={(brand) => applyFilters({ brand })}
          />
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-5 py-8 md:px-8 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8 lg:px-10 lg:py-10">
        <StoreFilterSidebar
          filters={filters}
          products={catalogProducts}
          onChange={applyFilters}
          className="hidden lg:block"
        />

        <div className="min-w-0">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[14px] text-text-secondary">
              {filteredCount} von {catalogProducts.length} Produkten
              {hasActiveStoreFilters(filters) ? " (gefiltert)" : ""}
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
                value={filters.sort}
                onChange={(sort) => applyFilters({ sort })}
              />
            </div>
          </div>

          <div
            className={`transition-opacity duration-200 motion-reduce:transition-none ${
              isPending ? "opacity-70" : "opacity-100"
            }`}
          >
            <StoreProductGridView
              filters={filters}
              allProducts={catalogProducts}
              onResetFilters={resetFilters}
              onCategorySelect={(category) =>
                applyFilters({ category, series: "all" })
              }
            />
          </div>
        </div>
      </div>

      <StoreMobileFilterSheet
        open={mobileFiltersOpen}
        filters={draftFilters}
        products={catalogProducts}
        onChange={(partial) => setDraftFilters((current) => ({ ...current, ...partial }))}
        onClose={() => {
          setDraftFilters(filters);
          setMobileFiltersOpen(false);
        }}
        onApply={() => {
          startFilterTransition(() => {
            updateUrl(draftFilters);
          });
          setMobileFiltersOpen(false);
        }}
      />
    </div>
  );
}

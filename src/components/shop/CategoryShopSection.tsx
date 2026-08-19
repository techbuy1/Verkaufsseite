"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { CatalogCategoryId } from "@/data/catalogCategories";
import {
  getCatalogProductsByCategory,
  getProductById,
} from "@/data/products";
import {
  applyProductFilters,
  BRAND_FILTER_OPTIONS,
  type BrandFilterValue,
  type SortOption,
} from "@/lib/filterProducts";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ProductCard } from "@/components/ProductCard";
import { BrandFilter } from "@/components/shop/BrandFilter";

interface CategoryShopSectionProps {
  categoryId: CatalogCategoryId;
  title: string;
  emptyMessage?: string;
}

export function CategoryShopSection({
  categoryId,
  title,
  emptyMessage = "Keine Produkte für diese Auswahl gefunden.",
}: CategoryShopSectionProps) {
  const searchParams = useSearchParams();
  const brandFromUrl = searchParams.get("brand");
  const initialBrand =
    BRAND_FILTER_OPTIONS.find((option) => option.id === brandFromUrl)?.id ?? "all";

  const { ref, isVisible } = useScrollAnimation<HTMLElement>();
  const [selectedBrand, setSelectedBrand] = useState<BrandFilterValue>(initialBrand);
  const [selectedSort, setSelectedSort] = useState<SortOption>("newest");

  const allProducts = useMemo(
    () =>
      getCatalogProductsByCategory(categoryId).map(
        (product) => getProductById(product.id) ?? product,
      ),
    [categoryId],
  );

  const filteredProducts = useMemo(
    () => applyProductFilters(allProducts, selectedBrand, selectedSort),
    [allProducts, selectedBrand, selectedSort],
  );

  return (
    <section
      ref={ref}
      className="border-t border-white/[0.06] bg-[#000000] py-12 text-white md:py-16"
    >
      <div
        className={`mx-auto max-w-[1200px] px-6 transition-all duration-700 ease-out md:px-10 lg:px-12 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-[15px] opacity-0"
        }`}
      >
        <BrandFilter
          selectedBrand={selectedBrand}
          selectedSort={selectedSort}
          onBrandChange={setSelectedBrand}
          onSortChange={setSelectedSort}
        />

        <h2 className="mb-8 mt-10 text-[28px] font-bold tracking-[-0.02em] md:mb-10 md:text-[36px]">
          {title}
        </h2>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} variant="dark" />
            ))}
          </div>
        ) : (
          <p className="rounded-[20px] border border-white/10 bg-white/[0.04] px-6 py-10 text-center text-[15px] text-white/55">
            {emptyMessage}
          </p>
        )}
      </div>
    </section>
  );
}

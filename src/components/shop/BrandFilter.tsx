"use client";

import Image from "next/image";
import { BRAND_LOGO_PATHS } from "@/data/brandLogos";
import type { BrandFilterValue, SortOption } from "@/lib/filterProducts";
import { BRAND_FILTER_OPTIONS, SORT_OPTIONS } from "@/lib/filterProducts";

interface BrandFilterProps {
  selectedBrand: BrandFilterValue;
  selectedSort: SortOption;
  onBrandChange: (brand: BrandFilterValue) => void;
  onSortChange: (sort: SortOption) => void;
}

export function BrandFilter({
  selectedBrand,
  selectedSort,
  onBrandChange,
  onSortChange,
}: BrandFilterProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-[13px] font-medium uppercase tracking-[0.08em] text-text-secondary">
          Marke auswählen
        </p>
        <div className="-mx-1 overflow-x-auto px-1 pb-1 scrollbar-hide">
          <div className="flex w-max min-w-full flex-nowrap gap-2 lg:flex-wrap lg:w-auto">
            {BRAND_FILTER_OPTIONS.map((brand) => {
              const isActive = selectedBrand === brand.id;
              const logo =
                brand.id !== "all" && brand.id in BRAND_LOGO_PATHS
                  ? BRAND_LOGO_PATHS[brand.id as keyof typeof BRAND_LOGO_PATHS]
                  : undefined;
              return (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => onBrandChange(brand.id)}
                  aria-pressed={isActive}
                  className={`brand-chip ${isActive ? "brand-chip-active" : ""}`}
                >
                  {logo && (
                    <span className="relative flex h-5 w-5 items-center justify-center">
                      <Image
                        src={logo}
                        alt=""
                        width={20}
                        height={20}
                        className="h-4 w-4 object-contain"
                      />
                    </span>
                  )}
                  {brand.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <p className="mb-3 text-[13px] font-medium uppercase tracking-[0.08em] text-text-secondary">
          Sortieren
        </p>
        <div className="-mx-1 overflow-x-auto px-1 pb-1 scrollbar-hide">
          <div className="flex w-max min-w-full flex-nowrap gap-2 lg:flex-wrap lg:w-auto">
            {SORT_OPTIONS.map((option) => {
              const isActive = selectedSort === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSortChange(option.id)}
                  aria-pressed={isActive}
                  className={`brand-chip ${isActive ? "brand-chip-active" : ""}`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export type { BrandFilterValue, SortOption };

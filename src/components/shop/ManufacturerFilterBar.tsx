"use client";

import Image from "next/image";
import type { BrandFilterValue } from "@/lib/filterProducts";
import { BRAND_FILTER_OPTIONS } from "@/lib/filterProducts";
import { BRAND_LOGO_PATHS } from "@/data/brandLogos";

interface ManufacturerFilterBarProps {
  selectedBrand: BrandFilterValue;
  onBrandChange: (brand: BrandFilterValue) => void;
}

export function ManufacturerFilterBar({
  selectedBrand,
  onBrandChange,
}: ManufacturerFilterBarProps) {
  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1 scrollbar-hide">
      <div
        className="flex w-max min-w-full flex-nowrap gap-2"
        role="tablist"
        aria-label="Hersteller filtern"
      >
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
              role="tab"
              aria-selected={isActive}
              onClick={() => onBrandChange(brand.id)}
              className={`brand-chip ${isActive ? "brand-chip-active" : ""}`}
            >
              {logo && (
                <span className="relative flex h-[18px] w-[18px] shrink-0 items-center justify-center">
                  <Image
                    src={logo}
                    alt=""
                    width={18}
                    height={18}
                    className="h-[18px] w-[18px] object-contain"
                  />
                </span>
              )}
              {brand.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

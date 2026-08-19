"use client";

import type { StoreFilters } from "@/lib/storeCatalog";
import { StoreFilterSidebar } from "./StoreFilterSidebar";
import type { Product } from "@/data/products";

interface StoreMobileFilterSheetProps {
  open: boolean;
  filters: StoreFilters;
  products: Product[];
  onChange: (partial: Partial<StoreFilters>) => void;
  onClose: () => void;
  onApply: () => void;
}

export function StoreMobileFilterSheet({
  open,
  filters,
  products,
  onChange,
  onClose,
  onApply,
}: StoreMobileFilterSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        aria-label="Filter schließen"
        onClick={onClose}
      />

      <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-[24px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-[18px] font-semibold text-text-primary">Filter</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-2 text-[14px] font-medium text-text-secondary hover:bg-background-secondary"
          >
            Schließen
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          <StoreFilterSidebar filters={filters} products={products} onChange={onChange} />
        </div>

        <div className="border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onApply}
            className="btn-techbuy-primary min-h-[48px] w-full text-[15px]"
          >
            Filter anwenden
          </button>
        </div>
      </div>
    </div>
  );
}

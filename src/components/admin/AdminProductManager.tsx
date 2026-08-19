"use client";

import { premiumProducts } from "@/data/premiumCatalog";
import { formatPrice } from "@/data/products";

export function AdminProductManager() {
  return (
    <section className="mt-10 rounded-[20px] border border-[#d2d2d7]/50 bg-white p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-semibold text-[#1d1d1f]">Premium-Produktverwaltung</h2>
          <p className="mt-1 text-[14px] text-[#6e6e73]">
            Farbvarianten, Speicher und Bestand für die Flagship-Produkte.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {premiumProducts.map((product) => (
          <div
            key={product.id}
            className="rounded-[16px] border border-[#d2d2d7]/40 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[12px] uppercase tracking-wide text-[#6e6e73]">
                  {product.brand}
                </p>
                <h3 className="text-[18px] font-semibold text-[#1d1d1f]">{product.name}</h3>
                <p className="mt-1 text-[14px] text-[#6e6e73]">
                  {product.images.length} Farben · {product.storageOptions.length} Speicher · Bestand{" "}
                  {product.stock ?? 0}
                </p>
              </div>
              <p className="text-[16px] font-semibold text-[#1d1d1f]">
                ab {formatPrice(product.storageOptions[0]?.price ?? 0)}
              </p>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {product.storageOptions.map((option) => (
                <div
                  key={option.storage}
                  className="flex items-center justify-between rounded-[12px] bg-[#f5f5f7] px-4 py-3 text-[14px]"
                >
                  <span>
                    {product.name} · {option.storage}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d2d2d7] text-[#1d1d1f]"
                      aria-label="Bestand reduzieren"
                    >
                      −
                    </button>
                    <span className="min-w-[28px] text-center font-medium">{product.stock ?? 0}</span>
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d2d2d7] text-[#1d1d1f]"
                      aria-label="Bestand erhöhen"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import type { ProductModelVariant } from "@/types/product";
import { formatPrice } from "@/data/products";

interface ProductModelSelectorProps {
  variants: ProductModelVariant[];
  activeSlug: string;
}

export function ProductModelSelector({ variants, activeSlug }: ProductModelSelectorProps) {
  if (variants.length <= 1) return null;

  return (
    <section className="py-10 md:py-14">
      <h2 className="mb-6 text-center text-[24px] font-bold tracking-[-0.03em] text-[#1d1d1f] md:text-[28px]">
        Welches Modell passt zu dir?
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {variants.map((variant) => {
          const isActive = variant.slug === activeSlug;

          const card = (
            <div
              className={`rounded-[20px] px-5 py-5 transition-all duration-200 md:px-6 md:py-6 ${
                isActive
                  ? "bg-white shadow-[0_8px_28px_rgba(0,0,0,0.08)] ring-2 ring-[#1d1d1f]"
                  : "bg-white/70 hover:bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
              }`}
            >
              <p className="text-[17px] font-semibold text-[#1d1d1f]">{variant.name}</p>
              <p className="mt-2 text-[14px] text-[#6e6e73]">
                {variant.displaySize} Display
              </p>
              <p className="mt-1 text-[14px] text-[#6e6e73]">{variant.storageRange}</p>
              <p className="mt-3 text-[15px] font-semibold text-[#1d1d1f]">
                Ab {formatPrice(variant.priceFrom)}
              </p>
            </div>
          );

          if (isActive) {
            return <div key={variant.id}>{card}</div>;
          }

          return (
            <Link key={variant.id} href={`/products/${variant.slug}`} className="block">
              {card}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

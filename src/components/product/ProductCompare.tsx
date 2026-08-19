"use client";

import Link from "next/link";
import { formatPrice } from "@/data/products";
import {
  getPremiumProductBySlug,
  getStorageOption,
  getDefaultStorage,
} from "@/data/premiumCatalog";
import type { PremiumProduct } from "@/types/product";

interface ProductCompareProps {
  productA: PremiumProduct;
  productB: PremiumProduct;
}

function CompareRow({
  label,
  valueA,
  valueB,
}: {
  label: string;
  valueA: string;
  valueB: string;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr_1fr] gap-4 border-b border-white/[0.08] py-4 text-[14px] md:grid-cols-[180px_1fr_1fr]">
      <div className="font-medium text-[#a1a1a6]">{label}</div>
      <div className="text-white">{valueA}</div>
      <div className="text-white">{valueB}</div>
    </div>
  );
}

export function ProductCompare({ productA, productB }: ProductCompareProps) {
  const priceA = getDefaultStorage(productA).price;
  const priceB = getDefaultStorage(productB).price;

  return (
    <section className="bg-[#000000] pt-24 pb-16 text-white md:pt-28 md:pb-24">
      <div className="mx-auto max-w-[1100px] px-6 md:px-10">
        <h1 className="text-[32px] font-bold tracking-[-0.03em] md:text-[44px]">
          Produktvergleich
        </h1>
        <p className="mt-3 text-[16px] text-[#a1a1a6]">
          {productA.name} gegen {productB.name}
        </p>

        <div className="mt-10 overflow-x-auto">
          <div className="min-w-[680px]">
            <div className="grid grid-cols-[140px_1fr_1fr] gap-4 border-b border-white/[0.08] pb-4 md:grid-cols-[180px_1fr_1fr]">
              <div />
              <Link href={`/products/${productA.slug}`} className="text-[18px] font-semibold hover:underline">
                {productA.name}
              </Link>
              <Link href={`/products/${productB.slug}`} className="text-[18px] font-semibold hover:underline">
                {productB.name}
              </Link>
            </div>

            <CompareRow label="Display" valueA={productA.specifications.display[0]?.value ?? "—"} valueB={productB.specifications.display[0]?.value ?? "—"} />
            <CompareRow label="Kamera" valueA={productA.specifications.camera[0]?.value ?? "—"} valueB={productB.specifications.camera[0]?.value ?? "—"} />
            <CompareRow label="Akku" valueA={productA.specifications.battery[0]?.value ?? "—"} valueB={productB.specifications.battery[0]?.value ?? "—"} />
            <CompareRow label="Chip" valueA={productA.specifications.performance[0]?.value ?? "—"} valueB={productB.specifications.performance[0]?.value ?? "—"} />
            <CompareRow
              label="Speicher"
              valueA={getStorageOption(productA, getDefaultStorage(productA).storage).storage}
              valueB={getStorageOption(productB, getDefaultStorage(productB).storage).storage}
            />
            <CompareRow label="Preis" valueA={formatPrice(priceA)} valueB={formatPrice(priceB)} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function resolveCompareProducts(slugA: string, slugB: string) {
  const productA = getPremiumProductBySlug(slugA);
  const productB = getPremiumProductBySlug(slugB);
  return { productA, productB };
}

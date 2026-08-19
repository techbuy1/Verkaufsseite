"use client";

import { useSearchParams } from "next/navigation";
import { ProductCompare, resolveCompareProducts } from "@/components/product/ProductCompare";

function CompareContent() {
  const searchParams = useSearchParams();
  const slugA = searchParams.get("a") ?? "iphone-17-pro";
  const slugB = searchParams.get("b") ?? "galaxy-s26-ultra";
  const { productA, productB } = resolveCompareProducts(slugA, slugB);

  if (!productA || !productB) {
    return (
      <section className="bg-[#000000] px-6 py-32 text-center text-white">
        <p>Produkte für den Vergleich konnten nicht geladen werden.</p>
      </section>
    );
  }

  return <ProductCompare productA={productA} productB={productB} />;
}

export default CompareContent;

"use client";

import { useMemo } from "react";
import { useProductStore } from "@/context/ProductStoreContext";
import { summaryToLegacyProduct } from "@/lib/catalogSummary";
import { buildHomeProductSections } from "@/lib/productMerchandising";
import { ProductRail } from "./ProductRail";

export function HomeProductSections() {
  const { products, ready } = useProductStore();
  const sections = useMemo(() => {
    if (!ready) return [];
    return buildHomeProductSections(products.filter((product) => product.inStock).map(summaryToLegacyProduct));
  }, [products, ready]);

  if (sections.length === 0) return null;

  return (
    <div className="bg-background-secondary text-text-primary">
      {sections.map((section) => (
        <ProductRail
          key={section.id}
          id={section.id}
          title={section.title}
          subtitle={section.subtitle}
          href={section.href}
          products={section.products}
        />
      ))}
    </div>
  );
}

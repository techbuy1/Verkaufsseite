"use client";

import { notFound } from "next/navigation";
import { useProductStore } from "@/context/ProductStoreContext";
import { resolvePremiumProductBySlug } from "@/lib/catalog";
import { getPremiumProductBySlug } from "@/data/premiumCatalog";
import { isProductVisibleInShop } from "@/lib/productAvailability";
import { ProductDetailView } from "./ProductDetailView";

interface ProductDetailPageClientProps {
  slug: string;
}

export function ProductDetailPageClient({ slug }: ProductDetailPageClientProps) {
  const { getProductBySlug, ready } = useProductStore();
  const product = getProductBySlug(slug) ?? resolvePremiumProductBySlug(slug) ?? getPremiumProductBySlug(slug);

  if (!ready && !product) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#f5f5f7]">
        <p className="text-[15px] text-[#6e6e73]">Produkt wird geladen…</p>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  if (!isProductVisibleInShop(product)) {
    notFound();
  }

  return <ProductDetailView product={product} />;
}

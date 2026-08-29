"use client";

import { notFound } from "next/navigation";
import type { Product } from "@/data/products";
import type { PremiumProduct } from "@/types/product";
import { useProductStore } from "@/context/ProductStoreContext";
import { getCatalogProductBySlug, resolvePremiumProductBySlug } from "@/lib/catalog";
import { getPremiumProductBySlug } from "@/data/premiumCatalog";
import { isProductPageReachable } from "@/lib/productAvailability";
import { isAccessoryCatalogProduct } from "@/lib/accessoryDetail";
import { setActivePromotions, type Promotion } from "@/lib/promotions";
import { AccessoryDetailView } from "./AccessoryDetailView";
import { ProductDetailView } from "./ProductDetailView";

interface ProductDetailPageClientProps {
  slug: string;
  initialProduct?: PremiumProduct;
  initialAccessory?: Product;
  /**
   * Server-resolved active promotions for this request. Client Components run
   * in a separate module-instance layer from the Server Component that reads
   * `.data/promotions.json` — a shared module-level cache set there isn't
   * visible here, so the array is threaded through as a prop instead and
   * applied to this layer's copy of the same cache before any price renders.
   */
  promotions?: Promotion[];
}

export function ProductDetailPageClient({
  slug,
  initialProduct,
  initialAccessory,
  promotions = [],
}: ProductDetailPageClientProps) {
  const { getProductBySlug, ready } = useProductStore();
  setActivePromotions(promotions);

  if (initialAccessory && isAccessoryCatalogProduct(initialAccessory)) {
    return <AccessoryDetailView product={initialAccessory} />;
  }

  // Before the product store has hydrated from the server, its context still
  // holds the static zero-stock seed catalog — trusting it over the
  // server-resolved `initialProduct` here would 404 every in-stock device on
  // first render. Once hydrated (`ready`), the live store wins so later
  // stock/price changes still show up without a full reload.
  const product =
    (ready ? getProductBySlug(slug) : undefined) ??
    initialProduct ??
    resolvePremiumProductBySlug(slug) ??
    getPremiumProductBySlug(slug);

  if (!ready && !product) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#f5f5f7]">
        <p className="text-[15px] text-[#6e6e73]">Produkt wird geladen…</p>
      </div>
    );
  }

  if (!product) {
    const accessory = getCatalogProductBySlug(slug);
    if (accessory && isAccessoryCatalogProduct(accessory)) {
      return <AccessoryDetailView product={accessory} />;
    }
    notFound();
  }

  if (!isProductPageReachable(product)) {
    notFound();
  }

  return <ProductDetailView product={product} />;
}

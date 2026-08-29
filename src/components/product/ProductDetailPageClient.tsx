"use client";

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import type { Product } from "@/data/products";
import type { PremiumProduct } from "@/types/product";
import { getCatalogProductBySlug } from "@/lib/catalog";
import { isProductPageReachable } from "@/lib/productAvailability";
import { isAccessoryCatalogProduct } from "@/lib/accessoryDetail";
import { setActivePromotions, type Promotion } from "@/lib/promotions";
import { AccessoryDetailView } from "./AccessoryDetailView";
import { ProductDetailView } from "./ProductDetailView";

interface ProductDetailPageClientProps {
  slug: string;
  initialProduct?: PremiumProduct;
  initialAccessory?: Product;
  promotions?: Promotion[];
}

export function ProductDetailPageClient({
  slug,
  initialProduct,
  initialAccessory,
  promotions = [],
}: ProductDetailPageClientProps) {
  const [product, setProduct] = useState<PremiumProduct | undefined>(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);

  setActivePromotions(promotions);

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      setLoading(false);
      return;
    }
    if (initialAccessory) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function loadOne() {
      try {
        const response = await fetch(`/api/catalog/products/${encodeURIComponent(slug)}`, {
          credentials: "same-origin",
        });
        if (!response.ok) {
          if (!cancelled) setLoading(false);
          return;
        }
        const data = (await response.json()) as { product?: PremiumProduct };
        if (!cancelled && data.product) {
          setProduct(data.product);
        }
      } catch {
        // Fall through to notFound below.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadOne();
    return () => {
      cancelled = true;
    };
  }, [slug, initialProduct, initialAccessory]);

  if (initialAccessory && isAccessoryCatalogProduct(initialAccessory)) {
    return <AccessoryDetailView product={initialAccessory} />;
  }

  if (loading && !product) {
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

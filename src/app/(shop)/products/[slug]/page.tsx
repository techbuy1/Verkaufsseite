import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Product } from "@/data/products";
import { getPremiumProductBySlug } from "@/data/premiumCatalog";
import { getCatalogProductBySlug, resolvePremiumProductBySlug } from "@/lib/catalog";
import { getProductMinAvailablePrice, isProductVisibleInShop } from "@/lib/productAvailability";
import { isProductPageReachable } from "@/lib/productAvailability";
import { premiumToLegacyProduct } from "@/lib/productAdapters";
import { getProductPageRecommendations } from "@/lib/productRecommendations";
import { buildProductJsonLd, buildProductMetadata } from "@/lib/productSeo";
import { isAccessoryCatalogProduct } from "@/lib/accessoryDetail";
import { buildAccessoryJsonLd, buildAccessoryMetadata } from "@/lib/accessorySeo";
import { readServerProducts } from "@/lib/serverProductCatalog";
import { readServerPromotions } from "@/lib/serverPromotions";
import { readServerGadgetPriceOverrides } from "@/lib/serverGadgetPricing";
import type { Promotion } from "@/lib/promotions";
import { ProductDetailPageClient } from "@/components/product/ProductDetailPageClient";
import { ProductRecommendations } from "@/components/product/ProductRecommendations";
import type { PremiumProduct } from "@/types/product";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

type ResolvedProductPage =
  | { kind: "premium"; product: PremiumProduct; promotions: Promotion[] }
  | { kind: "accessory"; product: Product; promotions: Promotion[] };

async function resolveProductPage(slug: string): Promise<ResolvedProductPage | null> {
  // Server-persisted (admin-managed) catalog is the source of truth for real
  // stock — the static seed catalog always has zero stock, so resolving
  // against it alone incorrectly 404s every in-stock device.
  const promotions = await readServerPromotions();
  await readServerGadgetPriceOverrides();
  const { products: serverProducts } = await readServerProducts();
  const premium =
    serverProducts.find((product) => product.slug === slug) ??
    resolvePremiumProductBySlug(slug) ??
    getPremiumProductBySlug(slug);
  if (premium && isProductPageReachable(premium)) {
    return { kind: "premium", product: premium, promotions };
  }

  const accessory = getCatalogProductBySlug(slug);
  if (accessory && isAccessoryCatalogProduct(accessory)) {
    return { kind: "accessory", product: accessory, promotions };
  }

  return null;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolveProductPage(slug);
  if (!resolved) {
    return { title: "Produkt nicht gefunden | TechBuy" };
  }

  if (resolved.kind === "premium") {
    return buildProductMetadata(resolved.product);
  }

  return buildAccessoryMetadata(resolved.product);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const resolved = await resolveProductPage(slug);

  if (!resolved) {
    notFound();
  }

  if (resolved.kind === "accessory") {
    const jsonLd = buildAccessoryJsonLd(resolved.product);

    return (
      <>
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
        <ProductDetailPageClient
          slug={slug}
          initialAccessory={resolved.product}
          promotions={resolved.promotions}
        />
      </>
    );
  }

  const product = resolved.product;
  const price = getProductMinAvailablePrice(product);
  const { products: serverProducts } = await readServerProducts();
  const recommendations = getProductPageRecommendations(
    product,
    price,
    serverProducts.filter(isProductVisibleInShop).map(premiumToLegacyProduct),
  );
  const jsonLd = buildProductJsonLd(product);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailPageClient
        slug={slug}
        initialProduct={product}
        promotions={resolved.promotions}
      />
      <ProductRecommendations sections={recommendations} />
    </>
  );
}

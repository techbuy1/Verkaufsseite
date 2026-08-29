import type { Metadata } from "next";
import type { PremiumProduct } from "@/types/product";
import { getProductMinAvailablePrice } from "@/lib/productAvailability";
import { getSiteUrlFromEnv } from "@/lib/siteUrl";
import { isProductInStock } from "@/lib/productAvailability";

const SITE_NAME = "TechBuy";

export function getProductPageTitle(product: PremiumProduct): string {
  const storageHint = product.storageOptions[0]?.storage?.split(" · ")[0];
  const parts = [product.brand, product.name, storageHint ? storageHint : null, "kaufen", SITE_NAME].filter(
    Boolean,
  );
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function getProductPageDescription(product: PremiumProduct): string {
  const price = getProductMinAvailablePrice(product);
  const inStock = isProductInStock(product);
  const base =
    product.shortDescription?.trim() ||
    product.description?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 140) ||
    `${product.brand} ${product.name} bei TechBuy.`;

  const priceLine = inStock
    ? `Ab ${price.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}.`
    : "Derzeit ausverkauft.";

  return `${base} ${priceLine} Kostenloser Versand, sichere Zahlung, 30 Tage Rückgabe.`.slice(
    0,
    160,
  );
}

export function buildProductMetadata(product: PremiumProduct): Metadata {
  const siteUrl = getSiteUrlFromEnv();
  const url = `${siteUrl}/products/${product.slug}`;
  const title = getProductPageTitle(product);
  const description = getProductPageDescription(product);
  const image = product.images[0]?.image;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "de_DE",
      url,
      siteName: SITE_NAME,
      title,
      description,
      ...(image ? { images: [{ url: image.startsWith("http") ? image : `${siteUrl}${image}` }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image.startsWith("http") ? image : `${siteUrl}${image}`] } : {}),
    },
  };
}

export function buildProductJsonLd(product: PremiumProduct) {
  const siteUrl = getSiteUrlFromEnv();
  const url = `${siteUrl}/products/${product.slug}`;
  const price = getProductMinAvailablePrice(product);
  const inStock = isProductInStock(product);
  const image = product.images[0]?.image;
  const sku = product.id;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: `${product.brand} ${product.name}`,
        image: image ? (image.startsWith("http") ? image : `${siteUrl}${image}`) : undefined,
        brand: { "@type": "Brand", name: product.brand },
        sku,
        description:
          product.shortDescription ||
          product.description?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
        offers: {
          "@type": "Offer",
          url,
          priceCurrency: "EUR",
          price: price.toFixed(2),
          availability: inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Start", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: product.category,
            item: `${siteUrl}/${product.catalogCategory ?? "store"}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: product.name,
            item: url,
          },
        ],
      },
    ],
  };
}

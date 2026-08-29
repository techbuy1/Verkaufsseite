import type { Metadata } from "next";
import type { Product } from "@/data/products";
import { getSiteUrlFromEnv } from "@/lib/siteUrl";
import {
  getAccessoryShortDescription,
  isAccessoryCatalogProduct,
} from "@/lib/accessoryDetail";

const SITE_NAME = "TechBuy";

export function buildAccessoryMetadata(product: Product): Metadata {
  const siteUrl = getSiteUrlFromEnv();
  const url = `${siteUrl}/products/${product.slug}`;
  const title = `${product.brand} ${product.name} kaufen | ${SITE_NAME}`;
  const description = `${getAccessoryShortDescription(product)} ${product.price.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  })}. Kostenloser Versand ab 50 €.`;
  const image = product.imageSrc;

  return {
    title,
    description: description.slice(0, 160),
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "de_DE",
      url,
      siteName: SITE_NAME,
      title,
      description,
      ...(image
        ? { images: [{ url: image.startsWith("http") ? image : `${siteUrl}${image}` }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image
        ? { images: [image.startsWith("http") ? image : `${siteUrl}${image}`] }
        : {}),
    },
  };
}

export function buildAccessoryJsonLd(product: Product) {
  if (!isAccessoryCatalogProduct(product)) return null;

  const siteUrl = getSiteUrlFromEnv();
  const url = `${siteUrl}/products/${product.slug}`;
  const image = product.imageSrc;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.brand} ${product.name}`,
    image: image ? (image.startsWith("http") ? image : `${siteUrl}${image}`) : undefined,
    brand: { "@type": "Brand", name: product.brand },
    sku: product.id,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "EUR",
      price: product.price,
      availability: "https://schema.org/InStock",
    },
  };
}

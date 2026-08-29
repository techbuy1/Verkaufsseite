import type { MetadataRoute } from "next";
import { catalogCategories } from "@/data/catalogCategories";
import { accessoryProducts } from "@/data/accessoryCatalog";
import { isAccessoryCatalogProduct } from "@/lib/accessoryDetail";
import { getShopPremiumProducts } from "@/lib/catalog";
import { getSiteUrlFromEnv } from "@/lib/siteUrl";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrlFromEnv();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/store`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/widerruf`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = catalogCategories.map((category) => ({
    url: `${siteUrl}/${category.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = [
    ...getShopPremiumProducts().map((product) => ({
      url: `${siteUrl}/products/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...accessoryProducts
      .filter(isAccessoryCatalogProduct)
      .map((product) => ({
        url: `${siteUrl}/products/${product.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.65,
      })),
  ];

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}

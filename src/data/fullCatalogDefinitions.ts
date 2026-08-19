import {
  buildProductFromDefinition,
  ipadDef,
  IPAD_11_COLORS,
  IPAD_AIR_M2_COLORS,
  IPAD_AIR_M3_COLORS,
  IPAD_PRO_COLORS,
  iphoneDef,
  laptopDef,
  pixelDef,
  type ProductDefinition,
} from "./productFactory";
import { buildSamsungCatalog } from "./samsungCatalog";
import { syncProductVariants } from "@/lib/productVariants";
import type { PremiumProduct } from "@/types/product";

/** IDs with hand-crafted assets in premiumCatalog.ts — not regenerated */
export const DETAILED_PRODUCT_IDS = new Set([
  "offer-iphone",
  "offer-iphone-max",
  "offer-iphone-17",
  "offer-pixel-10",
]);

export const catalogDefinitions: ProductDefinition[] = [
  // ── Apple iPhone (new generation) ──
  iphoneDef("iPhone 17 Air", "2025", 1099, {
    id: "apple-iphone-17-air",
    slug: "iphone-17-air",
    badge: "Neu",
  }),

  // ── Apple iPhone 16 ──
  iphoneDef("iPhone 16 Pro", "2024", 1199, { badge: "Neu" }),
  iphoneDef("iPhone 16 Pro Max", "2024", 1299, { badge: "Neu" }),
  iphoneDef("iPhone 16", "2024", 949),
  iphoneDef("iPhone 16 Plus", "2024", 1049),
  iphoneDef("iPhone 16e", "2024", 699, {
    id: "apple-iphone-16e",
    slug: "iphone-16e",
  }),

  // ── Apple iPhone 15 ──
  iphoneDef("iPhone 15 Pro", "2023", 1099),
  iphoneDef("iPhone 15 Pro Max", "2023", 1199),
  iphoneDef("iPhone 15", "2023", 849),
  iphoneDef("iPhone 15 Plus", "2023", 949),

  // ── Apple iPhone 14 ──
  iphoneDef("iPhone 14 Pro", "2022", 999),
  iphoneDef("iPhone 14 Pro Max", "2022", 1099),
  iphoneDef("iPhone 14", "2022", 749),
  iphoneDef("iPhone 14 Plus", "2022", 849),

  // ── Apple iPad ──
  ipadDef("iPad Pro M5", "2025", 1199, { badge: "Neu", colors: IPAD_PRO_COLORS }),
  ipadDef("iPad Pro M4", "2024", 1099, { badge: "Neu", colors: IPAD_PRO_COLORS }),
  ipadDef("iPad Air M3", "2025", 749, { badge: "Neu", colors: IPAD_AIR_M3_COLORS }),
  ipadDef("iPad Air M2", "2024", 699, { colors: IPAD_AIR_M2_COLORS }),
  ipadDef("iPad 11. Generation", "2025", 449, {
    id: "apple-ipad-11-generation",
    slug: "ipad-11-generation",
    colors: IPAD_11_COLORS,
  }),
  ipadDef("iPad 10. Generation", "2022", 399, {
    id: "apple-ipad-10-generation",
    slug: "ipad-10-generation",
  }),
  ipadDef("iPad mini", "2024", 549, {
    id: "apple-ipad-mini",
    slug: "ipad-mini",
    storages: ["128 GB", "256 GB", "512 GB"],
  }),

  // ── Apple MacBook ──
  laptopDef("Apple", "MacBook Pro 16 M5", "2025", 2399, {
    id: "apple-macbook-pro-16-m5",
    slug: "macbook-pro-16-m5",
    badge: "Neu",
    chip: "Apple M5 Pro",
    display: "16″ Liquid Retina XDR Display",
  }),
  laptopDef("Apple", "MacBook Pro 14 M5", "2025", 1799, {
    id: "apple-macbook-pro-14-m5",
    slug: "macbook-pro-14-m5",
    badge: "Neu",
    chip: "Apple M5",
    display: "14″ Liquid Retina XDR Display",
  }),
  laptopDef("Apple", "MacBook Air 15 M4", "2025", 1299, {
    id: "apple-macbook-air-15-m4",
    slug: "macbook-air-15-m4",
    badge: "Neu",
    chip: "Apple M4",
    display: "15″ Liquid Retina Display",
  }),
  laptopDef("Apple", "MacBook Air 13 M4", "2025", 1099, {
    id: "apple-macbook-air-13-m4",
    slug: "macbook-air-13-m4",
    badge: "Neu",
    chip: "Apple M4",
    display: "13″ Liquid Retina Display",
  }),

  // ── Laptops (Windows) ──
  laptopDef("Dell", "Dell XPS 14", "2025", 1499, {
    chip: "Intel Core Ultra 9",
    display: "14,5″ OLED Touch Display",
  }),
  laptopDef("Lenovo", "Lenovo ThinkPad X1 Carbon", "2025", 1399, {
    chip: "Intel Core Ultra 7",
    display: "14″ WUXGA Display",
  }),
  laptopDef("ASUS", "ASUS ROG Zephyrus G14", "2025", 1699, {
    badge: "Neu",
    chip: "AMD Ryzen AI 9",
    display: "14″ QHD+ 120 Hz Display",
  }),

  // ── Google Pixel (new) ──
  pixelDef("Pixel 10 Pro XL", "Pixel 10", 1199, {
    id: "google-pixel-10-pro-xl",
    slug: "google-pixel-10-pro-xl",
    badge: "Neu",
  }),
  pixelDef("Pixel 10 Pro", "Pixel 10", 999, {
    id: "google-pixel-10-pro",
    slug: "google-pixel-10-pro",
    badge: "Neu",
  }),
  pixelDef("Pixel 10a", "Pixel 10", 499, {
    id: "google-pixel-10a",
    slug: "google-pixel-10a",
    badge: "Neu",
  }),

  // ── Google Pixel 9 ──
  pixelDef("Pixel 9 Pro XL", "Pixel 9", 1099, {
    id: "google-pixel-9-pro-xl",
    slug: "google-pixel-9-pro-xl",
  }),
  pixelDef("Pixel 9 Pro", "Pixel 9", 899, {
    id: "google-pixel-9-pro",
    slug: "google-pixel-9-pro",
  }),
  pixelDef("Pixel 9", "Pixel 9", 749),

  // ── Google Pixel 8 ──
  pixelDef("Pixel 8 Pro", "Pixel 8", 799),
  pixelDef("Pixel 8", "Pixel 8", 599),
];

export function buildGeneratedCatalog(): PremiumProduct[] {
  return catalogDefinitions.map(buildProductFromDefinition);
}

export function mergeCatalog(
  detailedProducts: PremiumProduct[],
  generated: PremiumProduct[],
): PremiumProduct[] {
  const detailedIds = new Set(detailedProducts.map((product) => product.id));
  const merged: PremiumProduct[] = detailedProducts.map((product) =>
    syncProductVariants({
      ...product,
      model: product.model ?? product.name,
      generation: product.generation ?? "2025",
      keywords: product.keywords ?? [
        product.brand.toLowerCase(),
        product.name.toLowerCase(),
        product.slug.replace(/-/g, " "),
      ],
    }),
  );

  const samsungCatalog = buildSamsungCatalog();

  for (const product of [...generated, ...samsungCatalog]) {
    if (!detailedIds.has(product.id)) {
      merged.push(
        syncProductVariants({
          ...product,
          model: product.model ?? product.name,
          generation: product.generation ?? "2025",
          keywords: product.keywords ?? [
            product.brand.toLowerCase(),
            product.name.toLowerCase(),
            product.slug.replace(/-/g, " "),
          ],
        }),
      );
    }
  }

  return merged;
}

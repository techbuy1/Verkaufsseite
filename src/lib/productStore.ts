import { premiumProducts as SEED_PRODUCTS } from "@/data/premiumCatalog";
import { reduceVariantStock, type CheckoutLineItem } from "@/lib/productAvailability";
import { isConditionId } from "@/lib/conditions";
import { syncProductVariants } from "@/lib/productVariants";
import type {
  AdminProductSpecs,
  PremiumProduct,
  ProductSpecifications,
  StorageOption,
} from "@/types/product";

const STORAGE_KEY = "techbuy-admin-products-v7";
const LEGACY_STORAGE_KEYS = [
  "techbuy-admin-products-v6",
  "techbuy-admin-products-v5",
  "techbuy-admin-products-v4",
  "techbuy-admin-products-v3",
];

/** Setzt Produkt-, Speicher- und Zustandsbestand auf 0 (Admin pflegt manuell). */
function zeroStorageStock(option: StorageOption): StorageOption {
  return {
    ...option,
    stock: 0,
    conditions: option.conditions?.map((entry) => ({ ...entry, stock: 0 })),
  };
}

function zeroProductStock(product: PremiumProduct): PremiumProduct {
  return {
    ...product,
    stock: 0,
    storageOptions: (product.storageOptions ?? []).map(zeroStorageStock),
    variants: (product.variants ?? []).map((variant) => ({
      ...variant,
      storageOptions: variant.storageOptions.map(zeroStorageStock),
    })),
  };
}

function deriveAdminSpecs(product: PremiumProduct): AdminProductSpecs {
  const specs = product.specifications;
  return {
    display: specs.display.map((row) => row.value).join(" · ") || "—",
    camera: specs.camera[0]?.value ?? "—",
    chip: specs.performance[0]?.value ?? "—",
    battery: specs.battery[0]?.value ?? "—",
    storage:
      product.storageOptions.map((option) => option.storage).join(" · ") || "—",
    protection:
      product.features.find((feature) => /titanium|ceramic|glas/i.test(feature)) ??
      "Premium Schutz",
    operatingSystem: product.operatingSystem ?? product.adminSpecs?.operatingSystem ?? "—",
  };
}

export function normalizeProduct(raw: PremiumProduct): PremiumProduct {
  const shortDescription = raw.shortDescription || raw.tagline || raw.description;
  const longDescription =
    raw.longDescription ||
    (raw.description ? `<p>${raw.description}</p>` : `<p>${shortDescription}</p>`);
  const highlights = raw.highlights?.length ? raw.highlights : raw.features ?? [];
  const deliveryContent =
    raw.deliveryContent?.length ? raw.deliveryContent : raw.boxContents ?? [];
  const adminSpecs = raw.adminSpecs?.display
    ? raw.adminSpecs
    : deriveAdminSpecs({ ...raw, adminSpecs: raw.adminSpecs ?? deriveAdminSpecs(raw) });

  return syncProductVariants({
    ...raw,
    tagline: raw.tagline || shortDescription,
    shortDescription,
    longDescription,
    description: raw.description || shortDescription,
    mainImage: raw.mainImage || raw.images[0]?.image,
    galleryImages: raw.galleryImages ?? raw.images.map((image) => image.image),
    highlights,
    deliveryContent,
    adminSpecs,
    boxContents: deliveryContent,
    recommendedAccessories: raw.recommendedAccessories ?? [],
    similarProducts: raw.similarProducts ?? raw.compareWith ?? [],
    bundleOffers: raw.bundleOffers ?? [],
    model: raw.model ?? raw.name,
    generation: raw.generation ?? "2025",
    keywords: raw.keywords ?? [],
  });
}

export function getSeedProducts(): PremiumProduct[] {
  return SEED_PRODUCTS.map(normalizeProduct);
}

function parseProductsJson(raw: string | null): PremiumProduct[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PremiumProduct[];
    return Array.isArray(parsed) ? parsed.map(normalizeProduct) : null;
  } catch {
    return null;
  }
}

function readStoredRaw(): PremiumProduct[] | null {
  if (typeof window === "undefined") return null;

  const current = parseProductsJson(localStorage.getItem(STORAGE_KEY));
  if (current) return current;

  for (const legacyKey of LEGACY_STORAGE_KEYS) {
    const legacy = parseProductsJson(localStorage.getItem(legacyKey));
    if (legacy) {
      // Einmalige Migration: Fake-/Demo-Bestand auf 0, damit du selbst pflegen kannst.
      const zeroed = legacy.map((product) => normalizeProduct(zeroProductStock(product)));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(zeroed));
      return zeroed;
    }
  }

  return null;
}

export function loadProducts(): PremiumProduct[] {
  const stored = readStoredRaw();
  if (!stored) return getSeedProducts();

  // Append catalog seed products that are missing from localStorage
  // (e.g. newly added Samsung models) without overwriting admin edits.
  const ids = new Set(stored.map((product) => product.id));
  const slugs = new Set(stored.map((product) => product.slug));
  const missing = getSeedProducts().filter(
    (seed) => !ids.has(seed.id) && !slugs.has(seed.slug),
  );

  if (missing.length === 0) return stored;

  const merged = [...stored, ...missing];
  saveProducts(merged);
  return merged;
}

export function saveProducts(products: PremiumProduct[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products.map(normalizeProduct)));
}

export function getProductById(id: string): PremiumProduct | undefined {
  return loadProducts().find((product) => product.id === id);
}

export function getProductBySlug(slug: string): PremiumProduct | undefined {
  return loadProducts().find((product) => product.slug === slug);
}

export function updateProduct(updated: PremiumProduct): PremiumProduct[] {
  const normalized = normalizeProduct(updated);
  const products = loadProducts().map((product) =>
    product.id === normalized.id ? normalized : product,
  );
  saveProducts(products);
  return products;
}

export function updateProducts(updatedList: PremiumProduct[]): PremiumProduct[] {
  const byId = new Map(updatedList.map((product) => [product.id, normalizeProduct(product)]));
  const products = loadProducts().map((product) => byId.get(product.id) ?? product);
  for (const [id, product] of byId) {
    if (!products.some((entry) => entry.id === id)) {
      products.push(product);
    }
  }
  saveProducts(products);
  return products;
}

export function deductStockForOrder(items: CheckoutLineItem[]): PremiumProduct[] {
  let products = loadProducts();

  for (const item of items) {
    products = products.map((product) => {
      if (product.id !== item.productId) return product;
      const colorRef = item.colorId ?? item.color ?? item.colorName;
      const colorId =
        (colorRef
          ? product.images.find(
              (image) => image.id === colorRef || image.colorName === colorRef,
            )?.id
          : undefined) ?? product.images[0]?.id;

      return reduceVariantStock(
        product,
        colorId,
        item.storage,
        item.quantity,
        isConditionId(item.condition) ? item.condition : undefined,
      );
    });
  }

  saveProducts(products);
  return products;
}

export function resetProductsToSeed(): PremiumProduct[] {
  const seed = getSeedProducts();
  saveProducts(seed);
  return seed;
}

export function specsToLegacy(adminSpecs: AdminProductSpecs): ProductSpecifications {
  return {
    display: [{ label: "Display", value: adminSpecs.display }],
    camera: [{ label: "Kamera", value: adminSpecs.camera }],
    performance: [{ label: "Chip", value: adminSpecs.chip }],
    battery: [{ label: "Akku", value: adminSpecs.battery }],
    connectivity: [
      { label: "Speicher", value: adminSpecs.storage },
      { label: "Schutz", value: adminSpecs.protection },
      { label: "Betriebssystem", value: adminSpecs.operatingSystem },
    ],
  };
}

export { STORAGE_KEY };

/**
 * CLI-Helfer: baut eBay-Produkte ohne @/ Alias (für node --experimental-strip-types).
 */
export { EBAY_INVENTORY } from "../../src/data/ebayInventory.ts";
export {
  calculateTechBuyPrice,
  calculateDiscountedPrice,
  roundToNearest99Price,
} from "../../src/lib/ebayPricing.ts";

import { EBAY_INVENTORY } from "../../src/data/ebayInventory.ts";
import { calculateTechBuyPrice } from "../../src/lib/ebayPricing.ts";
import { VARIANT_IMAGE_PLACEHOLDER } from "../../src/data/productImageRegistry.ts";
import type { PremiumProduct } from "../../src/types/product.ts";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function buildMinimalEbayCatalog(): PremiumProduct[] {
  return EBAY_INVENTORY.map((row) => {
    const pricing = calculateTechBuyPrice(row.ebay_price);
    const slug = slugify(`${row.title}-${row.ebay_item_id}`) || `ebay-${row.ebay_item_id}`;
    const storageMatch = row.title.match(/(\d+)\s*GB/i);
    const storage = storageMatch ? `${storageMatch[1]} GB` : "Standard";

    return {
      id: `ebay-${row.ebay_item_id}`,
      slug,
      brand: row.title.split(" ")[0] ?? "TechBuy",
      name: row.title,
      model: row.title,
      generation: "",
      category: "Smartphones",
      catalogCategory: "smartphones",
      tagline: row.title,
      shortDescription: row.title,
      longDescription: `<p>${row.title}</p>`,
      description: row.title,
      mainImage: VARIANT_IMAGE_PLACEHOLDER,
      galleryImages: [VARIANT_IMAGE_PLACEHOLDER],
      images: [
        {
          id: "standard",
          colorName: "Standard",
          colorCode: "#e8e8ed",
          image: VARIANT_IMAGE_PLACEHOLDER,
          imageMissing: true,
        },
      ],
      storageOptions: [
        {
          storage,
          price: pricing.techbuy_price,
          stock: row.quantity,
          conditions: [
            {
              condition: "very_good",
              label: "Verfügbar",
              price: pricing.techbuy_price,
              stock: row.quantity,
              active: row.quantity > 0,
              sku: `EBAY-${row.ebay_item_id}`,
              ebayItemId: row.ebay_item_id,
              ebayPrice: pricing.ebay_price,
              calculatedPrice: pricing.calculated_price,
            },
          ],
        },
      ],
      specifications: {
        display: [],
        camera: [],
        performance: [],
        battery: [],
        connectivity: [],
      },
      adminSpecs: {
        display: "—",
        camera: "—",
        chip: "—",
        battery: "—",
        storage,
        protection: "—",
        operatingSystem: "—",
      },
      highlights: [],
      deliveryContent: ["Artikel laut Beschreibung"],
      features: [],
      stock: row.quantity,
      ebayItemId: row.ebay_item_id,
      ebayTitle: row.title,
      ebayPrice: pricing.ebay_price,
      calculatedPrice: pricing.calculated_price,
      techbuyPrice: pricing.techbuy_price,
      manualArchive: row.quantity <= 0,
      stockArchived: row.quantity <= 0,
    };
  });
}

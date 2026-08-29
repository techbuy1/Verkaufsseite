import { getColorDefinitionsForSlug } from "@/data/productImageMap";
import { slugifyColorId } from "@/lib/productVariants";
import type { PremiumProduct, ProductImageVariant, ProductVariant } from "@/types/product";

function colorLookupKey(id: string, name?: string): string[] {
  return [id, slugifyColorId(id), name ? slugifyColorId(name) : ""]
    .filter(Boolean);
}

/**
 * Overlay verified front/back photos from the image registry onto a catalog
 * product. Prices, stock, IDs and variant names stay untouched — only
 * `image` / `angles` are filled in for the product detail gallery.
 */
export function attachVerifiedDisplayImages(product: PremiumProduct): PremiumProduct {
  const defs = getColorDefinitionsForSlug(product.slug);
  if (!defs?.length) return product;

  const lookup = new Map<string, (typeof defs)[number]>();
  for (const def of defs) {
    for (const key of colorLookupKey(def.id, def.name)) {
      lookup.set(key, def);
    }
  }

  function matchDef(id: string, name: string) {
    for (const key of colorLookupKey(id, name)) {
      const found = lookup.get(key);
      if (found) return found;
    }
    return undefined;
  }

  const nextVariants = product.variants?.map((variant) => {
    const match = matchDef(variant.id, variant.colorName);
    if (!match) return variant;
    return applyVisuals(variant, match.image, match.angles, match.imageMissing);
  });

  const sourceImages = nextVariants?.length
    ? nextVariants.map(variantToImage)
    : product.images.map((image) => {
        const match = matchDef(image.id, image.colorName);
        if (!match) return image;
        return applyVisuals(image, match.image, match.angles, match.imageMissing);
      });

  return {
    ...product,
    variants: nextVariants,
    images: sourceImages,
    mainImage: sourceImages[0]?.image ?? product.mainImage,
  };
}

function applyVisuals<T extends { image: string; angles?: string[]; imageMissing?: boolean }>(
  entry: T,
  image: string,
  angles: string[] | undefined,
  imageMissing?: boolean,
): T {
  return {
    ...entry,
    image,
    angles: angles?.length ? angles : entry.angles,
    imageMissing: imageMissing ?? entry.imageMissing,
  };
}

function variantToImage(variant: ProductVariant): ProductImageVariant {
  return {
    id: variant.id,
    colorName: variant.colorName,
    colorCode: variant.colorCode,
    image: variant.image,
    imageMissing: variant.imageMissing ?? false,
    angles: variant.angles,
  };
}

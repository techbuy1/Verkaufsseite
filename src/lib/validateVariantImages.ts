import type { PremiumProduct } from "@/types/product";
import { VARIANT_IMAGE_PLACEHOLDER } from "@/data/productImageRegistry";
import { syncProductVariants } from "@/lib/productVariants";

export function isPlaceholderImagePath(path: string): boolean {
  return (
    !path.trim() ||
    path.includes("variant-missing") ||
    path.includes("placeholders/")
  );
}

export function validateVariantImagePaths(product: PremiumProduct): string[] {
  const synced = syncProductVariants(product);
  const errors: string[] = [];

  for (const variant of synced.variants ?? []) {
    if (!variant.image.trim()) {
      errors.push(`Bildpfad fehlt für „${variant.colorName}".`);
      continue;
    }

    if (isPlaceholderImagePath(variant.image)) {
      errors.push(
        `Kein Produktbild für „${variant.colorName}" – bitte korrekten Bildpfad hinterlegen.`,
      );
    }
  }

  return errors;
}

export { VARIANT_IMAGE_PLACEHOLDER };

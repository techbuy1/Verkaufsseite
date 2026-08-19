import { Suspense } from "react";
import { CatalogBrowseSection } from "@/components/shop/CatalogBrowseSection";

function GooglePixelContent() {
  return (
    <CatalogBrowseSection
      categoryId="smartphones"
      brand="Google"
      title="Google Pixel"
      subtitle="Pixel Smartphones von Pixel 8 bis Pixel 10."
    />
  );
}

export default function GooglePixelPage() {
  return (
    <Suspense fallback={null}>
      <GooglePixelContent />
    </Suspense>
  );
}

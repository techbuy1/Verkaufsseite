import { Suspense } from "react";
import { CatalogBrowseSection } from "@/components/shop/CatalogBrowseSection";

function IphoneContent() {
  return (
    <CatalogBrowseSection
      categoryId="smartphones"
      brand="Apple"
      title="iPhone"
      subtitle="Von iPhone 14 bis iPhone 17 — alle Modelle und Generationen."
    />
  );
}

export default function IphonePage() {
  return (
    <Suspense fallback={null}>
      <IphoneContent />
    </Suspense>
  );
}

import { Suspense } from "react";
import { CatalogBrowseSection } from "@/components/shop/CatalogBrowseSection";

function LaptopsContent() {
  return (
    <CatalogBrowseSection
      categoryId="laptops"
      title="Alle Laptops"
      subtitle="Leistungsstarke Laptops für Arbeit, Kreativität und Mobilität."
      compactLayout
    />
  );
}

export default function LaptopsPage() {
  return (
    <Suspense fallback={null}>
      <LaptopsContent />
    </Suspense>
  );
}

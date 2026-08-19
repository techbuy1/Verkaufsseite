import { Suspense } from "react";
import { CatalogBrowseSection } from "@/components/shop/CatalogBrowseSection";

function SamsungContent() {
  return (
    <CatalogBrowseSection
      categoryId="smartphones"
      brand="Samsung"
      title="Samsung Galaxy"
      subtitle="Galaxy S und Galaxy A — Premium und Alltags-Smartphones."
    />
  );
}

export default function SamsungPage() {
  return (
    <Suspense fallback={null}>
      <SamsungContent />
    </Suspense>
  );
}

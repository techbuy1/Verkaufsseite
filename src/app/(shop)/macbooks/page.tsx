import { Suspense } from "react";
import { CatalogBrowseSection } from "@/components/shop/CatalogBrowseSection";

function MacBooksContent() {
  return (
    <CatalogBrowseSection
      categoryId="macbooks"
      title="Alle MacBooks"
      subtitle="Leistung, die mit dir geht — für Arbeit, Kreativität und unterwegs."
      compactLayout
    />
  );
}

export default function MacBooksPage() {
  return (
    <Suspense fallback={null}>
      <MacBooksContent />
    </Suspense>
  );
}

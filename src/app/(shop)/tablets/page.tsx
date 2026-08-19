import { Suspense } from "react";
import { CatalogBrowseSection } from "@/components/shop/CatalogBrowseSection";

function TabletsContent() {
  return (
    <CatalogBrowseSection
      categoryId="tablets"
      title="Alle Tablets"
      subtitle="iPad und Tablet-Modelle für Arbeit, Kreativität und Entertainment."
      compactLayout
    />
  );
}

export default function TabletsPage() {
  return (
    <Suspense fallback={null}>
      <TabletsContent />
    </Suspense>
  );
}

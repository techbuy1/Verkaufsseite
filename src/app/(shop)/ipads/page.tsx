import { Suspense } from "react";
import { CatalogBrowseSection } from "@/components/shop/CatalogBrowseSection";

function IpadsContent() {
  return (
    <CatalogBrowseSection
      categoryId="tablets"
      brand="Apple"
      title="iPad"
      subtitle="iPad Pro, iPad Air, iPad und iPad mini — alle Generationen."
    />
  );
}

export default function IpadsPage() {
  return (
    <Suspense fallback={null}>
      <IpadsContent />
    </Suspense>
  );
}

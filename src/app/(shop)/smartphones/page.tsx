import { Suspense } from "react";
import { CatalogBrowseSection } from "@/components/shop/CatalogBrowseSection";
import { GalaxyA57Hero } from "@/components/shop/GalaxyA57Hero";

function SmartphonesContent() {
  return (
    <>
      <GalaxyA57Hero />
      <CatalogBrowseSection
        categoryId="smartphones"
        title="Alle Smartphones"
        subtitle="Welches wird deins?"
        compactLayout
        flushTop
      />
    </>
  );
}

export default function SmartphonesPage() {
  return (
    <Suspense fallback={null}>
      <SmartphonesContent />
    </Suspense>
  );
}

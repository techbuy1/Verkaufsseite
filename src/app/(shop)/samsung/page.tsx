import { Suspense } from "react";
import { CatalogBrowseSection } from "@/components/shop/CatalogBrowseSection";
import { BrandHero3DCarousel } from "@/components/hero/BrandHero3DCarousel";
import { SAMSUNG_HERO_CANDIDATES } from "@/data/brandHeroDevices";

function SamsungContent() {
  return (
    <CatalogBrowseSection
      categoryId="smartphones"
      brand="Samsung"
      title="Samsung Galaxy"
      subtitle="Galaxy S und Galaxy A — Premium und Alltags-Smartphones."
      flushTop
    />
  );
}

export default function SamsungPage() {
  return (
    <>
      <BrandHero3DCarousel
        eyebrow="Galaxy"
        headline="Ultra Leistung. Ultra smart."
        subheadline="Vom Alltags-Allrounder Galaxy A57 bis zum Galaxy S26 Ultra — Premium-Kamera und Galaxy AI."
        ctaHref="/products/galaxy-s26-ultra"
        ctaLabel="Galaxy entdecken"
        candidates={SAMSUNG_HERO_CANDIDATES}
      />
      <Suspense fallback={null}>
        <SamsungContent />
      </Suspense>
    </>
  );
}

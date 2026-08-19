import { Suspense } from "react";
import { CatalogBrowseSection } from "@/components/shop/CatalogBrowseSection";
import { BrandHero3DCarousel } from "@/components/hero/BrandHero3DCarousel";
import { IPHONE_HERO_CANDIDATES } from "@/data/brandHeroDevices";

function IphoneContent() {
  return (
    <CatalogBrowseSection
      categoryId="smartphones"
      brand="Apple"
      title="iPhone"
      subtitle="Von iPhone 14 bis iPhone 17 — alle Modelle und Generationen."
      flushTop
    />
  );
}

export default function IphonePage() {
  return (
    <>
      <BrandHero3DCarousel
        eyebrow="iPhone 17 Pro"
        headline="Pro. In jeder Perspektive."
        subheadline="Titan-Gehäuse, A19 Pro Chip und das stärkste iPhone Kamerasystem — jetzt bei TechBuy."
        ctaHref="/products/iphone-17-pro"
        ctaLabel="iPhone 17 Pro entdecken"
        candidates={IPHONE_HERO_CANDIDATES}
      />
      <Suspense fallback={null}>
        <IphoneContent />
      </Suspense>
    </>
  );
}

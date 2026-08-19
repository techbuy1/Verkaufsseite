"use client";

import { CatalogBridgeSection } from "@/components/CatalogBridgeSection";
import { CategoryProductSection } from "@/components/CategoryProductSection";
import { FeaturedHighlights } from "@/components/highlights/FeaturedHighlights";
import { PhoneShowcaseHero } from "@/components/hero/PhoneShowcaseHero";
import { TechBuyServicesSection } from "@/components/services/TechBuyServicesSection";
import { TopDealSection } from "@/components/TopDealSection";
import { TrustBar } from "@/components/TrustBar";

export default function HomePage() {
  return (
    <>
      <section className="text-text-primary">
        <PhoneShowcaseHero />
        <TrustBar />
      </section>

      <FeaturedHighlights />

      <TopDealSection />

      <CatalogBridgeSection />

      <section className="bg-background-secondary text-text-primary">
        <CategoryProductSection />
      </section>

      <TechBuyServicesSection />
    </>
  );
}

"use client";

import { FeaturedHighlights } from "@/components/highlights/FeaturedHighlights";
import { ShopSortimentBanner } from "@/components/ShopSortimentBanner";
import { TechBuyServicesSection } from "@/components/services/TechBuyServicesSection";
import { TopDealSection } from "@/components/TopDealSection";

export function HomePageBelowOffers() {
  return (
    <>
      <ShopSortimentBanner />

      <TopDealSection />

      <FeaturedHighlights />

      <TechBuyServicesSection />
    </>
  );
}

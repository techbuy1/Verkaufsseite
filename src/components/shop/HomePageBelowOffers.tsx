"use client";

import { ShopSortimentBanner } from "@/components/ShopSortimentBanner";
import { TechBuyServicesSection } from "@/components/services/TechBuyServicesSection";
import { TopDealSection } from "@/components/TopDealSection";

export function HomePageBelowOffers() {
  return (
    <>
      <ShopSortimentBanner />

      <TopDealSection />

      <TechBuyServicesSection />
    </>
  );
}

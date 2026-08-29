"use client";

import { SellHeroCarousel } from "@/components/hero/SellHeroCarousel";
import { TrustBar } from "@/components/TrustBar";

export function HomeHeroSection() {
  return (
    <section className="text-text-primary">
      <SellHeroCarousel />
      <TrustBar />
    </section>
  );
}

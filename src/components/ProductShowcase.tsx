"use client";

import type { HeroProduct as HeroProductType } from "@/types/hero";
import { CampaignHeroRow } from "./CampaignHeroRow";

interface ProductShowcaseProps {
  product: HeroProductType;
  onBuy?: () => void;
}

export function ProductShowcase({ product, onBuy }: ProductShowcaseProps) {
  return (
    <CampaignHeroRow
      product={product}
      onBuy={onBuy}
      imagePosition="left"
    />
  );
}

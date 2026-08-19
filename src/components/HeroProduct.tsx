"use client";

import type { HeroProduct as HeroProductType } from "@/types/hero";
import { CampaignHeroRow } from "./CampaignHeroRow";

interface HeroProductProps {
  product: HeroProductType;
  onBuy?: () => void;
}

export function HeroProduct({ product, onBuy }: HeroProductProps) {
  return (
    <CampaignHeroRow
      product={product}
      onBuy={onBuy}
      imagePosition="right"
      priority
    />
  );
}

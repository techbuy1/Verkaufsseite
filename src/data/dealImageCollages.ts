import { assetPath } from "@/lib/assetPath";

export interface DealImageCollage {
  front: string;
  angles: string[];
}

/**
 * Pre-rendered front/back(/side) stills for the Top Deal section's device
 * visual, keyed by `${productId}:${colorId}`. Any product/colour combo an
 * admin picks that isn't listed here just falls back to the existing single
 * marketing photo — no missing-asset errors, just a plainer (front-only)
 * visual until a collage is rendered for that combo.
 */
export const DEAL_IMAGE_COLLAGES: Record<string, DealImageCollage> = {
  "samsung-galaxy-a57:icy-blue": {
    front: assetPath("images/hero/collage/galaxy-a57-icy-blue/front.png"),
    angles: [assetPath("images/hero/collage/galaxy-a57-icy-blue/back.png")],
  },
  "offer-iphone:cosmic-orange": {
    front: assetPath("images/hero/collage/iphone-17-pro-cosmic-orange/front.png"),
    angles: [
      assetPath("images/hero/collage/iphone-17-pro-cosmic-orange/back.png"),
      assetPath("images/hero/collage/iphone-17-pro-cosmic-orange/side.png"),
    ],
  },
};

export function getDealImageCollage(
  productId: string,
  colorId: string,
): DealImageCollage | undefined {
  return DEAL_IMAGE_COLLAGES[`${productId}:${colorId}`];
}

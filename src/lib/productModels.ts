import {
  GALAXY_A57_MODEL_PATH,
  GALAXY_S26_ULTRA_MODEL_PATH,
  IPAD_PRO_13_MODEL_PATH,
  IPHONE_17_PRO_MODEL_PATH,
} from "@/components/product3d/constants";

/** Known product-page GLB paths — only real files under `/public/models`. */
const PRODUCT_MODEL_PATHS: Record<string, string> = {
  "iphone-17-pro": IPHONE_17_PRO_MODEL_PATH,
  "galaxy-s26-ultra": GALAXY_S26_ULTRA_MODEL_PATH,
  "galaxy-a57": GALAXY_A57_MODEL_PATH,
  // Every iPad shares the one real iPad Pro 13 GLB for its 360° view — same
  // pattern as the smartphones above, just one model standing in for the line.
  "ipad-pro-m5": IPAD_PRO_13_MODEL_PATH,
  "ipad-pro-m4": IPAD_PRO_13_MODEL_PATH,
  "ipad-air-m3": IPAD_PRO_13_MODEL_PATH,
  "ipad-air-m2": IPAD_PRO_13_MODEL_PATH,
  "ipad-11-generation": IPAD_PRO_13_MODEL_PATH,
  "ipad-10-generation": IPAD_PRO_13_MODEL_PATH,
  "ipad-mini": IPAD_PRO_13_MODEL_PATH,
};

export function getProductModelPath(slug: string): string | undefined {
  return PRODUCT_MODEL_PATHS[slug];
}

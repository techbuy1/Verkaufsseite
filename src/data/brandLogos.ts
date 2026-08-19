/** Bestehende Logo-Dateien — keine Duplikate unter /images/brands/ */
export const BRAND_LOGO_PATHS = {
  apple: "/images/categories/Apple_Logo.svg",
  samsung: "/images/categories/samsung_logo_icon.webp",
  google: "/images/categories/Google_logo.png",
} as const;

export type BrandLogoId = keyof typeof BRAND_LOGO_PATHS;

/** Bilder auf der Festplatte ohne verifiziertes Registry-Mapping — manuell prüfen. */
export const UNASSIGNED_PRODUCT_IMAGES = [
  "images/products/Google Pixel /Google Pixel 10 Pro XL /GooglePixel_10_Pro_Fold_Jadegreen.png",
  "images/products/Google Pixel /Google Pixel 10 Pro XL /GooglePixel_10_Pro_Fold_Moonstone_Grau.png",
  "images/products/Samsung /Samsung Galaxy Handy /Samsung Galaxy A Series /Samsung_Galaxy_A37_Awesome Graygreen..png",
  "images/products/Samsung /Samsung Galaxy Handy /Samsung Galaxy A Series /Samsung_Galaxy_A37_AwesomeWhite.png",
  "images/products/Samsung /Samsung Galaxy Handy /Samsung Galaxy A Series /Samsung_Galaxy_A37_Graygren.png",
] as const;

/** iPhone 15 Serie wurde inzwischen im Registry verknüpft — siehe productImageRegistry.ts */

export const UNASSIGNED_PRODUCT_IMAGE_NOTES: Record<(typeof UNASSIGNED_PRODUCT_IMAGES)[number], string> = {
  "images/products/Google Pixel /Google Pixel 10 Pro XL /GooglePixel_10_Pro_Fold_Jadegreen.png":
    "Pixel Fold — nicht Pixel 10 Pro XL. Nicht automatisch zugeordnet.",
  "images/products/Google Pixel /Google Pixel 10 Pro XL /GooglePixel_10_Pro_Fold_Moonstone_Grau.png":
    "Pixel Fold — nicht Pixel 10 Pro XL. Nicht automatisch zugeordnet.",
  "images/products/Samsung /Samsung Galaxy Handy /Samsung Galaxy A Series /Samsung_Galaxy_A37_Awesome Graygreen..png":
    "Keine exakte Farbe im Katalog (Awesome Graygreen).",
  "images/products/Samsung /Samsung Galaxy Handy /Samsung Galaxy A Series /Samsung_Galaxy_A37_AwesomeWhite.png":
    "Keine exakte Farbe im Katalog (Awesome White).",
  "images/products/Samsung /Samsung Galaxy Handy /Samsung Galaxy A Series /Samsung_Galaxy_A37_Graygren.png":
    "Dateiname uneindeutig — nicht automatisch zugeordnet.",
};

import { assetPath } from "@/lib/assetPath";

const ZUBEHOER_DIR = "images/products/Zubehör";

function zubehoerImage(file: string): string {
  return assetPath(`${ZUBEHOER_DIR}/${file}`);
}

export const ACCESSORY_IMAGE_SETS = {
  panzerfolieKlar: {
    primary: zubehoerImage("panzer_vorderansicht.png"),
    gallery: [
      zubehoerImage("panzer_vorderansicht.png"),
      zubehoerImage("panzer_schraegansicht.png"),
      zubehoerImage("panzer_detailansicht_kante.png"),
      zubehoerImage("panzer_anwendungsansicht_neutrales_geraet (3).png"),
    ],
  },
  panzerfolieMatt: {
    primary: zubehoerImage("matte_folie_vorderansicht.png"),
    gallery: [
      zubehoerImage("matte_folie_vorderansicht.png"),
      zubehoerImage("matte_folie_schraegansicht.png"),
      zubehoerImage("matte_folie_detailansicht_kante.png"),
      zubehoerImage("matte_folie_anwendungsansicht_iphone.png"),
    ],
  },
  panzerfoliePrivacy: {
    primary: zubehoerImage("privacy_folie_vorderansicht.png"),
    gallery: [
      zubehoerImage("privacy_folie_vorderansicht.png"),
      zubehoerImage("privacy_folie_schraegansicht.png"),
      zubehoerImage("privacy_folie_detailansicht_kante.png"),
      zubehoerImage("privacy_folie_anwendungsansicht_iphone.png"),
    ],
  },
  huelleTransparent: {
    primary: zubehoerImage("silikonhuelle_transparent_iphone_17_pro_vorne.png"),
    gallery: [
      zubehoerImage("silikonhuelle_transparent_iphone_17_pro_vorne.png"),
      zubehoerImage("silikonhuelle_transparent_iphone_17_pro_hinten.png"),
      zubehoerImage("silikonhuelle_transparent_samsung_s26_ultra_vorne.png"),
      zubehoerImage("silikonhuelle_transparent_samsung_s26_ultra_hinten.png"),
    ],
  },
  silikonhuelleWeiss: {
    primary: zubehoerImage("weisse_silikonhuelle_iphone_17_pro_vorne.png"),
    gallery: [
      zubehoerImage("weisse_silikonhuelle_iphone_17_pro_vorne.png"),
      zubehoerImage("weisse_silikonhuelle_iphone_17_pro_hinten.png"),
      zubehoerImage("weisse_silikonhuelle_samsung_s26_ultra_vorne.png"),
      zubehoerImage("weisse_silikonhuelle_samsung_s26_ultra_hinten.png"),
    ],
  },
  usbCKabel: {
    primary: zubehoerImage("USB-C Kabel .png"),
    gallery: [
      zubehoerImage("USB-C Kabel .png"),
      zubehoerImage("USB-C Kabel 2.png"),
      zubehoerImage("USB-C Kabel Anschlüsse.png"),
    ],
  },
} as const;

export const ACCESSORY_IMAGE_BY_ID: Record<string, string> = {
  "acc-screen-protector-clear": ACCESSORY_IMAGE_SETS.panzerfolieKlar.primary,
  "acc-screen-protector-matte": ACCESSORY_IMAGE_SETS.panzerfolieMatt.primary,
  "acc-screen-protector-privacy": ACCESSORY_IMAGE_SETS.panzerfoliePrivacy.primary,
  "acc-case-clear": ACCESSORY_IMAGE_SETS.huelleTransparent.primary,
  "acc-case-silicone-apple": ACCESSORY_IMAGE_SETS.silikonhuelleWeiss.primary,
  "acc-cable-usbc": ACCESSORY_IMAGE_SETS.usbCKabel.primary,
  "catalog-screen-protector": ACCESSORY_IMAGE_SETS.panzerfolieKlar.primary,
  "catalog-cases": ACCESSORY_IMAGE_SETS.huelleTransparent.primary,
  "catalog-cables": ACCESSORY_IMAGE_SETS.usbCKabel.primary,
};

export function getAccessoryImageSrc(productId: string): string | undefined {
  return ACCESSORY_IMAGE_BY_ID[productId];
}

const ACCESSORY_GALLERY_BY_ID: Record<string, readonly string[]> = {
  "acc-screen-protector-clear": ACCESSORY_IMAGE_SETS.panzerfolieKlar.gallery,
  "acc-screen-protector-matte": ACCESSORY_IMAGE_SETS.panzerfolieMatt.gallery,
  "acc-screen-protector-privacy": ACCESSORY_IMAGE_SETS.panzerfoliePrivacy.gallery,
  "acc-case-clear": ACCESSORY_IMAGE_SETS.huelleTransparent.gallery,
  "acc-case-silicone-apple": ACCESSORY_IMAGE_SETS.silikonhuelleWeiss.gallery,
  "acc-cable-usbc": ACCESSORY_IMAGE_SETS.usbCKabel.gallery,
  "catalog-screen-protector": ACCESSORY_IMAGE_SETS.panzerfolieKlar.gallery,
  "catalog-cases": ACCESSORY_IMAGE_SETS.huelleTransparent.gallery,
  "catalog-cables": ACCESSORY_IMAGE_SETS.usbCKabel.gallery,
};

export function getAccessoryGalleryImages(productId: string, fallbackSrc?: string): string[] {
  const gallery = ACCESSORY_GALLERY_BY_ID[productId];
  if (gallery?.length) return [...gallery];
  if (fallbackSrc) return [fallbackSrc];
  return [];
}

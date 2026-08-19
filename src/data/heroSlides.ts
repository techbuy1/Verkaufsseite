import type { HeroProduct } from "@/types/hero";
import { heroImageDimensions, heroImagePath, SHOP_SURFACE } from "./heroImageAssets";

/** Zentral gepflegte Hero-Slides – Bilder stammen ausschließlich aus /public/images/hero/. */
export interface HeroSlide {
  id: string;
  brand: "Apple" | "Samsung" | "Google";
  model: string;
  title: string;
  subtitle: string;
  eyebrow?: string;
  image: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  href: string;
  slug: string;
  cartProductId: string;
  themeBackground?: string;
  themeMode?: "light" | "dark";
}

export const HERO_SLIDE_INTERVAL_MS = 6000;

function heroSlideImage(key: Parameters<typeof heroImagePath>[0]) {
  const dimensions = heroImageDimensions(key);
  return {
    image: heroImagePath(key),
    imageWidth: dimensions.width,
    imageHeight: dimensions.height,
  };
}

export const heroSlides: HeroSlide[] = [
  {
    id: "iphone-17-pro",
    brand: "Apple",
    model: "iPhone 17 Pro",
    eyebrow: "Neu",
    title: "Pro. Auf einem neuen Level.",
    subtitle:
      "Erlebe die neueste iPhone Generation mit Premium-Performance, starkem Kamerasystem und hochwertigem Design.",
    ...heroSlideImage("iphone17ProLineup"),
    imageAlt: "iPhone 17 Pro",
    href: "/products/iphone-17-pro",
    slug: "iphone-17-pro",
    cartProductId: "offer-iphone",
    themeBackground: SHOP_SURFACE.hero,
    themeMode: "light",
  },
  {
    id: "iphone-17",
    brand: "Apple",
    model: "iPhone 17",
    eyebrow: "Neu",
    title: "Mehr iPhone. Für jeden Tag.",
    subtitle:
      "Modernes Design, starke Performance und ein brillantes Display für deinen Alltag.",
    ...heroSlideImage("iphone17Lineup"),
    imageAlt: "iPhone 17",
    href: "/products/iphone-17",
    slug: "iphone-17",
    cartProductId: "offer-iphone-17",
    themeBackground: SHOP_SURFACE.hero,
    themeMode: "light",
  },
  {
    id: "galaxy-s26-ultra",
    brand: "Samsung",
    model: "Galaxy S26 Ultra",
    eyebrow: "Neu",
    title: "Ultra Leistung. Ultra smart.",
    subtitle:
      "Premium-Smartphone mit starker Kamera, großem Display und maximaler Performance.",
    ...heroSlideImage("galaxyS26UltraLineup"),
    imageAlt: "Samsung Galaxy S26 Ultra",
    href: "/products/galaxy-s26-ultra",
    slug: "galaxy-s26-ultra",
    cartProductId: "offer-samsung",
    themeBackground: SHOP_SURFACE.hero,
    themeMode: "light",
  },
  {
    id: "google-pixel-10",
    brand: "Google",
    model: "Google Pixel 10",
    eyebrow: "Neu",
    title: "Smart. Klar. Pixel.",
    subtitle:
      "Google Pixel 10 verbindet smarte KI-Funktionen, starke Kamera-Technologie und ein flüssiges Android-Erlebnis in einem modernen Premium-Smartphone.",
    ...heroSlideImage("googlePixelModelle"),
    imageAlt: "Google Pixel 10",
    href: "/products/google-pixel-10",
    slug: "google-pixel-10",
    cartProductId: "offer-pixel-10",
    themeBackground: SHOP_SURFACE.hero,
    themeMode: "light",
  },
];

export function heroSlideToProduct(slide: HeroSlide): HeroProduct {
  return {
    id: slide.id,
    eyebrow: slide.eyebrow,
    name: slide.model,
    tagline: slide.title,
    subheadline: slide.subtitle,
    imageSrc: slide.image,
    imageAlt: slide.imageAlt,
    imageWidth: slide.imageWidth,
    imageHeight: slide.imageHeight,
    slug: slide.slug,
    cartProductId: slide.cartProductId,
    themeBackground: slide.themeBackground,
    themeMode: slide.themeMode,
  };
}

export const heroCarouselProducts: HeroProduct[] = heroSlides.map(heroSlideToProduct);

export const heroProducts: HeroProduct[] = [heroSlideToProduct(heroSlides[0])];

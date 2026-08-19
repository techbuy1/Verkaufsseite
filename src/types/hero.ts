export interface HeroProduct {
  id: string;
  eyebrow?: string;
  name: string;
  tagline: string;
  subheadline: string;
  imageSrc: string;
  imageAlt: string;
  imageWidth?: number;
  imageHeight?: number;
  slug: string;
  cartProductId: string;
  /** Premium slide background — light TechBuy default */
  themeBackground?: string;
  themeMode?: "light" | "dark";
}

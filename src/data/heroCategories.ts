import { heroImagePath } from "./heroImageAssets";

export interface HeroCategory {
  id: string;
  name: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
}

export const heroCategories: HeroCategory[] = [
  {
    id: "hc-smartphones",
    name: "Smartphones",
    href: "/smartphones",
    imageSrc: "/images/categories/images.jpg",
    imageAlt: "Smartphones",
  },
  {
    id: "hc-tablets",
    name: "Tablets",
    href: "/tablets",
    imageSrc: "/images/categories/iPad.jpg",
    imageAlt: "Tablets",
  },
  {
    id: "hc-smartwatches",
    name: "Smartwatches",
    href: "/smartwatches",
    imageSrc: "/images/categories/images-4.jpg",
    imageAlt: "Smartwatches",
  },
  {
    id: "hc-laptops",
    name: "Laptops",
    href: "/laptops",
    imageSrc: "/images/categories/Macbook.jpg",
    imageAlt: "Laptops",
  },
  {
    id: "hc-audio",
    name: "Audio",
    href: "/audio",
    imageSrc: "/images/categories/images-3.jpg",
    imageAlt: "Audio",
  },
  {
    id: "hc-accessories",
    name: "Zubehör",
    href: "/zubehoer",
    imageSrc: "/images/categories/images-5.jpg",
    imageAlt: "Zubehör",
  },
  {
    id: "hc-offers",
    name: "Angebote",
    href: "#angebote",
    imageSrc: heroImagePath("iphone17ProLineup"),
    imageAlt: "Angebote",
  },
];

export interface CategoryCampaign {
  id: string;
  name: string;
  tagline: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  background: "white" | "secondary" | "light-blue" | "dark-neutral";
}

export const categoryCampaigns: CategoryCampaign[] = [
  {
    id: "cat-campaign-smartphones",
    name: "Smartphones",
    tagline: "Die neuesten Modelle. Für jeden Anspruch.",
    href: "/smartphones",
    imageSrc: "/images/categories/images.jpg",
    imageAlt: "Smartphones",
    background: "secondary",
  },
  {
    id: "cat-campaign-tablets",
    name: "Tablets",
    tagline: "Flexibel. Leistungsstark. Überall dabei.",
    href: "/tablets",
    imageSrc: "/images/categories/iPad.jpg",
    imageAlt: "Tablets",
    background: "white",
  },
  {
    id: "cat-campaign-smartwatches",
    name: "Smartwatches",
    tagline: "Dein Alltag. Direkt am Handgelenk.",
    href: "/smartwatches",
    imageSrc: "/images/categories/images-4.jpg",
    imageAlt: "Smartwatches",
    background: "light-blue",
  },
  {
    id: "cat-campaign-laptops",
    name: "Laptops & Performance",
    tagline: "Power für Arbeit, Gaming und Kreativität.",
    href: "/laptops",
    imageSrc: "/images/categories/Macbook.jpg",
    imageAlt: "Laptops & Performance",
    background: "dark-neutral",
  },
];

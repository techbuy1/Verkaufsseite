export interface Category {
  id: string;
  name: string;
  imageSrc: string;
  imageAlt: string;
  href: string;
}

export const categories: Category[] = [
  {
    id: "cat-smartphones",
    name: "Smartphones",
    imageSrc: "/images/categories/images.jpg",
    imageAlt: "Smartphones",
    href: "#smartphones",
  },
  {
    id: "cat-tablets",
    name: "Tablets",
    imageSrc: "/images/categories/iPad.jpg",
    imageAlt: "Tablets",
    href: "#tablets",
  },
  {
    id: "cat-macbooks",
    name: "MacBooks",
    imageSrc: "/images/categories/Macbook.jpg",
    imageAlt: "MacBooks",
    href: "#macbooks",
  },
  {
    id: "cat-laptops",
    name: "Laptops",
    imageSrc: "/images/categories/Macbook.jpg",
    imageAlt: "Laptops",
    href: "#laptops",
  },
  {
    id: "cat-headphones",
    name: "Kopfhörer",
    imageSrc: "/images/categories/images-3.jpg",
    imageAlt: "Kopfhörer",
    href: "#audio",
  },
  {
    id: "cat-smartwatches",
    name: "Smartwatches",
    imageSrc: "/images/categories/images-4.jpg",
    imageAlt: "Smartwatches",
    href: "#smartwatches",
  },
  {
    id: "cat-accessories",
    name: "Zubehör",
    imageSrc: "/images/categories/images-5.jpg",
    imageAlt: "Zubehör",
    href: "#zubehoer",
  },
];

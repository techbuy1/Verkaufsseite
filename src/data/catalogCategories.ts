export type CatalogCategoryId =
  | "smartphones"
  | "tablets"
  | "macbooks"
  | "laptops"
  | "smartwatches"
  | "audio"
  | "zubehoer";

export interface CatalogCategory {
  id: CatalogCategoryId;
  label: string;
  headline: string;
  subheadline: string;
}

export const catalogCategories: CatalogCategory[] = [
  {
    id: "smartphones",
    label: "Smartphones",
    headline: "Alle Smartphones",
    subheadline: "Welches wird deins?",
  },
  {
    id: "tablets",
    label: "Tablets",
    headline: "Alle Tablets",
    subheadline: "Mehr Platz für Ideen.",
  },
  {
    id: "macbooks",
    label: "MacBooks",
    headline: "Alle MacBooks",
    subheadline: "Leistung, die mit dir geht.",
  },
  {
    id: "laptops",
    label: "Laptops",
    headline: "Alle Laptops",
    subheadline: "Für Arbeit, Gaming und Kreativität.",
  },
  {
    id: "smartwatches",
    label: "Smartwatches",
    headline: "Alle Smartwatches",
    subheadline: "Dein Alltag am Handgelenk.",
  },
  {
    id: "audio",
    label: "Audio",
    headline: "Audio",
    subheadline: "Sound, der zu dir passt.",
  },
  {
    id: "zubehoer",
    label: "Zubehör",
    headline: "Zubehör",
    subheadline: "Alles, was dein Setup komplett macht.",
  },
];

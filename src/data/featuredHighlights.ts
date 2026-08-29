/**
 * Konfiguration für die "Entdecke die Highlights"-Produktbühne auf der Startseite.
 * Preise/Namen/Farben werden bewusst NICHT hier dupliziert, sondern zur Laufzeit
 * aus dem echten Produktkatalog (premiumCatalog/productImageMap) gelesen — diese
 * Datei enthält nur die editorielle Zusatzschicht (Kurz-Highlights, Glow).
 */

export interface HighlightImageAngles {
  front: string;
  back?: string;
  angle?: string;
  side?: string;
}

export interface HighlightHotspot {
  id: string;
  /** Position in Prozent relativ zur Gerätefläche */
  x: number;
  y: number;
  title: string;
  description: string;
}

export interface HighlightStat {
  icon: "camera" | "chip" | "display";
  label: string;
  value: string;
}

export interface HighlightProductConfig {
  /** Echte Produkt-ID aus premiumCatalog/samsungCatalog */
  productId: string;
  /** Echter Produkt-Slug — für Kaufen/Mehr erfahren Links */
  slug: string;
  eyebrow: string;
  headline: string;
  glowColor: string;
  stats: HighlightStat[];
  /** Rendert eine echte 360°-3D-Ansicht (GLB) statt des flachen Produktfotos. */
  use3D?: boolean;
  /** Pfad zur GLB-Datei unter /public — nur relevant wenn use3D true ist. */
  modelPath?: string;
  /** Kurze Spec-Schlagworte für schwebende Pills (z. B. im Premium-Drop-Bereich). */
  pillLabels?: string[];
  /** Rotierende Mini-Claims für das Wörter-Karussell unter den Produkt-Tabs. */
  carouselWords?: string[];
}

export const featuredHighlightProducts: HighlightProductConfig[] = [
  {
    productId: "offer-iphone",
    slug: "iphone-17-pro",
    eyebrow: "iPhone 17 Pro",
    headline: "Pro. In jeder Perspektive.",
    glowColor: "#e8622a",
    use3D: false,
    stats: [
      { icon: "chip", label: "Chip", value: "A19 Pro" },
      { icon: "camera", label: "Kamera", value: "48 MP Fusion" },
      { icon: "display", label: "Display", value: "120 Hz ProMotion" },
    ],
    pillLabels: ["A19 Pro", "48 MP Fusion", "Titanium"],
    carouselWords: [
      "A19 Pro",
      "48 MP Fusion",
      "120 Hz ProMotion",
      "Always-On Display",
      "Titanium Design",
      "Pro Kamera",
      "Apple Intelligence",
      "Ultra Performance",
      "Premium Display",
      "All-Day Battery",
      "Pro. In jeder Perspektive.",
    ],
  },
  {
    productId: "offer-samsung",
    slug: "galaxy-s26-ultra",
    eyebrow: "Galaxy S26 Ultra",
    headline: "Ultra. In jedem Detail.",
    glowColor: "#4a6fa5",
    use3D: false,
    stats: [
      { icon: "chip", label: "Chip", value: "Snapdragon 8 Elite" },
      { icon: "camera", label: "Kamera", value: "50 MP Pro-Kamera" },
      { icon: "display", label: "Display", value: "Dynamic AMOLED 2X" },
    ],
    pillLabels: ["Snapdragon 8 Elite", "50 MP", "Dynamic AMOLED"],
    carouselWords: [
      "Snapdragon 8 Elite",
      "50 MP Pro-Kamera",
      "Dynamic AMOLED 2X",
      "Galaxy AI",
      "S Pen",
      "Ultra Design",
    ],
  },
];

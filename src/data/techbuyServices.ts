import { FREE_SHIPPING_THRESHOLD } from "@/lib/cart";

export type ServiceCardSize = "large" | "small";

export interface TechBuyServiceCard {
  id: string;
  size: ServiceCardSize;
  /** Grid span on md+ (12-col). */
  span: 5 | 6 | 7;
  eyebrow?: string;
  title: string;
  body: string;
  bullets?: string[];
  steps?: string[];
  link?: { label: string; href: string; external?: boolean };
  cta?: { label: string; href: string; external?: boolean };
  visual: "payment" | "quality" | "service" | "tradein" | "price" | "shipping";
}

/**
 * Homepage service cards — copy and claims tied to real TechBuy surfaces only
 * (footer payment list, cart free-shipping threshold, Ankauf URL, support mail).
 * No 0 %-Finanzierung: not implemented in checkout.
 */
export const techBuyServiceCards: TechBuyServiceCard[] = [
  {
    id: "payment",
    size: "large",
    span: 7,
    eyebrow: "Zahlung",
    title: "Technik heute. Flexibel bezahlen.",
    body: "Entdecken Sie Smartphones, Tablets, MacBooks und weiteres Zubehör zu fair kalkulierten Preisen. Je nach verfügbarer Zahlungsart können Sie Ihren Einkauf bequem und flexibel bezahlen — unter anderem per PayPal, Kreditkarte, Klarna oder Apple Pay.",
    link: { label: "Mehr erfahren", href: "#zahlung" },
    visual: "payment",
  },
  {
    id: "quality",
    size: "small",
    span: 5,
    eyebrow: "Qualität",
    title: "Qualität, auf die Sie sich verlassen können.",
    body: "Bei TechBuy stehen transparente Produktinformationen, sorgfältig ausgewählte Geräte und eine klare Kaufabwicklung im Mittelpunkt. Sie sehen vor dem Kauf genau, welche Variante, Farbe und Ausstattung Sie auswählen.",
    bullets: [
      "Transparente Produktdaten",
      "Sichere Kaufabwicklung",
      "Klare Preisangaben",
    ],
    link: { label: "Unsere Qualitätsstandards", href: "#support" },
    visual: "quality",
  },
  {
    id: "service",
    size: "small",
    span: 5,
    eyebrow: "Service",
    title: "Service, wenn Sie ihn brauchen.",
    body: "Auch nach dem Kauf soll Technik unkompliziert bleiben. Unser Service unterstützt Sie bei Fragen zu Bestellung, Versand und Produktinformationen und hilft Ihnen dabei, schnell die passende Lösung zu finden.",
    link: {
      label: "Zum Service",
      href: "mailto:service@tbwebdesigne.de",
    },
    visual: "service",
  },
  {
    id: "tradein",
    size: "large",
    span: 7,
    eyebrow: "Ankauf",
    title: "Weitergeben statt liegen lassen.",
    body: "Verkaufen Sie Ihr gebrauchtes Smartphone einfach an TechBuy und geben Sie Ihrem Gerät eine zweite Chance. Durch die Weiterverwendung geeigneter Geräte werden Ressourcen geschont und Technik länger genutzt.",
    steps: ["Gerät auswählen", "Zustand angeben", "Angebot erhalten"],
    cta: {
      label: "Gerät verkaufen",
      href: "https://www.techbuy-ankauf.de/",
      external: true,
    },
    visual: "tradein",
  },
  {
    id: "price",
    size: "small",
    span: 6,
    eyebrow: "Preise",
    title: "Fair kalkuliert.",
    body: "Wir möchten hochwertige Technik zu nachvollziehbaren Preisen anbieten. Deshalb setzen wir auf transparente Angebote und eine klare Preisstruktur ohne unnötige Ablenkung.",
    visual: "price",
  },
  {
    id: "shipping",
    size: "small",
    span: 6,
    eyebrow: "Versand",
    title: "Schnell bei Ihnen.",
    body: `Ihre Bestellung wird zuverlässig vorbereitet und sicher versendet. Ab ${FREE_SHIPPING_THRESHOLD} € Bestellwert entfällt die Versandpauschale; Lieferzeiten und Sendungsverfolgung werden im Bestellprozess transparent angezeigt.`,
    link: { label: "Mehr zum Versand", href: "#versand" },
    visual: "shipping",
  },
];

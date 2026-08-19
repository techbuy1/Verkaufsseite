export interface Benefit {
  id: string;
  title: string;
  shortDescription: string;
  description: string[];
  icon: "shipping" | "return" | "payment" | "quality" | "price" | "support";
  note?: string;
  cta?: { label: string; href: string };
}

export const whyTechBuyBenefits: Benefit[] = [
  {
    id: "shipping",
    title: "Schneller Versand",
    shortDescription: "In 1–2 Werktagen bei dir.",
    description: [
      "Wir möchten, dass du deine Bestellung so schnell wie möglich erhältst. Verfügbare Produkte werden nach erfolgreicher Bestellung schnellstmöglich für den Versand vorbereitet.",
      "Du erhältst nach dem Versand eine Bestätigung und – sofern verfügbar – eine Sendungsverfolgung.",
      "Die tatsächliche Lieferzeit kann je nach Produktverfügbarkeit, Versanddienstleister und Zieladresse variieren.",
    ],
    note: "Lieferzeiten werden beim jeweiligen Produkt und im Checkout angezeigt.",
    icon: "shipping",
  },
  {
    id: "return",
    title: "30 Tage Rückgabe",
    shortDescription: "Einfach und unkompliziert.",
    description: [
      "Falls ein Produkt doch nicht zu dir passt, soll die Rückgabe möglichst unkompliziert sein.",
      "Innerhalb der geltenden Rückgabefrist kannst du eine Rückgabe anfragen. Nach Prüfung erhältst du die weiteren Informationen zum Rückgabeprozess.",
      "Die konkreten Bedingungen, Ausnahmen und gesetzlichen Rechte findest du in unseren Rückgabeinformationen und AGB.",
    ],
    icon: "return",
  },
  {
    id: "payment",
    title: "Sichere Zahlung",
    shortDescription: "Geschützt und verschlüsselt bezahlen.",
    description: [
      "Beim Bezahlen legen wir großen Wert auf Sicherheit.",
      "Zahlungen werden über etablierte Zahlungsdienstleister verarbeitet. Sensible Zahlungsdaten sollen nicht unnötig auf unseren eigenen Systemen gespeichert werden.",
      "Je nach Checkout können verschiedene sichere Zahlungsmethoden angeboten werden.",
    ],
    icon: "payment",
  },
  {
    id: "quality",
    title: "Geprüfte Qualität",
    shortDescription: "Ausgewählte Produkte und zuverlässige Technik.",
    description: [
      "Wir möchten Produkte anbieten, die unseren Qualitätsansprüchen entsprechen.",
      "Produktinformationen, Varianten und Zustand sollen transparent dargestellt werden, damit du vor dem Kauf weißt, was du erhältst.",
      "Bei unterschiedlichen Produktzuständen oder Varianten müssen diese klar auf der Produktseite gekennzeichnet werden.",
    ],
    icon: "quality",
  },
  {
    id: "price",
    title: "Faire Preise",
    shortDescription: "Starke Technik zu transparenten Preisen.",
    description: [
      "Bei TechBuy sollen Preise klar und nachvollziehbar dargestellt werden.",
      "Der aktuelle Verkaufspreis wird deutlich angezeigt. Zusätzliche Kosten wie Versand oder optionale Leistungen sollen transparent vor Abschluss der Bestellung sichtbar sein.",
      "Wir möchten hochwertige Technik zu wettbewerbsfähigen Konditionen anbieten.",
    ],
    icon: "price",
  },
  {
    id: "support",
    title: "Persönlicher Support",
    shortDescription: "Wir helfen dir vor und nach dem Kauf.",
    description: [
      "Du hast Fragen zu einem Produkt, deiner Bestellung oder dem Versand?",
      "Unser Support soll dir sowohl vor dem Kauf als auch nach deiner Bestellung weiterhelfen.",
      "Kontaktmöglichkeiten sollen einfach auffindbar sein und direkt zu unserem Support führen.",
    ],
    cta: { label: "Support kontaktieren", href: "#support" },
    icon: "support",
  },
];

/** @deprecated Use whyTechBuyBenefits on the homepage */
export const benefits = whyTechBuyBenefits;

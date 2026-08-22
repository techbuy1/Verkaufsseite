import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";
import { ORDER_NUMBER_HINT, SHOP_CONTACT_EMAIL } from "@/lib/shopContact";

export const metadata = { title: "FAQ – TechBuy" };

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "Sind die gebrauchten Geräte geprüft?",
    a: "Ja. Jedes gebrauchte Gerät wird vor dem Verkauf geprüft und mit einem transparenten Zustand (z. B. „Wie neu“, „Sehr gut“, „Gut“) ausgezeichnet, den Sie direkt auf der Produktseite einsehen können.",
  },
  {
    q: "Wie funktioniert der Ankauf meines alten Geräts?",
    a: "Den Ankauf gebrauchter Geräte wickeln wir über unsere Ankauf-Plattform techbuy-ankauf.de ab: Gerät auswählen, Zustand angeben, Angebot erhalten.",
  },
  {
    q: "Welche Zahlungsarten kann ich nutzen?",
    a: "Die zum Zeitpunkt Ihrer Bestellung verfügbaren Zahlungsarten werden Ihnen im Checkout angezeigt.",
  },
  {
    q: "Kann ich meine Bestellung zurückgeben?",
    a: `Als Verbraucher steht Ihnen ein 14-tägiges Widerrufsrecht zu. Details finden Sie auf unserer Widerrufs- und Rückgabeseite. Bitte melden Sie sich unter ${SHOP_CONTACT_EMAIL} und geben Sie stets Ihre Bestellnummer an.`,
  },
  {
    q: "Wie erreiche ich den Support?",
    a: `Am schnellsten per E-Mail an ${SHOP_CONTACT_EMAIL} oder über unsere Kontaktseite. ${ORDER_NUMBER_HINT}`,
  },
];

export default function FaqPage() {
  return (
    <LegalPageLayout eyebrow="Service" title="Häufige Fragen">
      {FAQ_ITEMS.map((item) => (
        <LegalSection key={item.q} title={item.q}>
          <p>{item.a}</p>
        </LegalSection>
      ))}
    </LegalPageLayout>
  );
}

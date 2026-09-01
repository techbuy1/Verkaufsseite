import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";

export const metadata = { title: "Versand – TechBuy" };

export default function VersandPage() {
  return (
    <LegalPageLayout eyebrow="Service" title="Versandinformationen">
      <LegalSection title="Versandart">
        <p>
          Bestellungen werden per DHL versendet. Der Versand erfolgt in der Regel
          innerhalb von 1–2 Werktagen nach Zahlungseingang bzw. Bestellbestätigung.
        </p>
      </LegalSection>
      <LegalSection title="Versandkosten">
        <p>
          Ab einem Bestellwert von 50 € ist der Versand bei TechBuy kostenlos. Bei einem
          Bestellwert unter 50 € berechnen wir eine Versandkostenpauschale von 6,90 €.
        </p>
      </LegalSection>
      <LegalSection title="Verpackung">
        <p>
          Alle Geräte werden sorgfältig und sicher verpackt versendet, um Transportschäden zu
          vermeiden.
        </p>
      </LegalSection>
      <LegalSection title="Weitere Fragen">
        <p>
          Details zu voraussichtlichen Lieferzeiten finden Sie unter{" "}
          <a className="text-accent hover:underline" href="/lieferzeiten">
            Lieferzeiten
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}

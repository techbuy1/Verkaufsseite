import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";

export const metadata = { title: "Lieferzeiten – TechBuy" };

export default function LieferzeitenPage() {
  return (
    <LegalPageLayout eyebrow="Service" title="Lieferzeiten">
      <LegalSection title="Innerhalb Deutschlands">
        <p>
          In der Regel erreicht Sie Ihre Bestellung innerhalb von 1–2 Werktagen nach Versand per
          DHL.
        </p>
      </LegalSection>
      <LegalSection title="Hinweis">
        <p>
          Angegebene Lieferzeiten sind Richtwerte und können sich durch Ereignisse außerhalb
          unseres Einflussbereichs (z. B. beim Versanddienstleister) verändern.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}

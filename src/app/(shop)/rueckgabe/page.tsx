import Link from "next/link";
import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";
import { ORDER_NUMBER_HINT, SHOP_CONTACT_EMAIL } from "@/lib/shopContact";

export const metadata = { title: "Rückgabe – TechBuy" };

export default function RueckgabePage() {
  return (
    <LegalPageLayout
      eyebrow="Service"
      title="Rückgabe"
      intro="Als Verbraucher können Sie eine Bestellung innerhalb von 14 Tagen ohne Angabe von Gründen widerrufen."
    >
      <LegalSection title="So funktioniert die Rückgabe">
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>
            Teilen Sie uns Ihren Widerruf über unsere{" "}
            <Link href="/kontakt" className="text-accent hover:underline">
              Kontaktseite
            </Link>{" "}
            oder per E-Mail an{" "}
            <a className="text-accent hover:underline" href={`mailto:${SHOP_CONTACT_EMAIL}`}>
              {SHOP_CONTACT_EMAIL}
            </a>{" "}
            mit. {ORDER_NUMBER_HINT}
          </li>
          <li>Senden Sie das Gerät gut verpackt an die von uns mitgeteilte Adresse zurück.</li>
          <li>Nach Eingang und Prüfung erstatten wir den Kaufpreis auf dem ursprünglichen Zahlungsweg.</li>
        </ol>
      </LegalSection>
      <LegalSection title="Rechtliche Grundlage">
        <p>
          Die vollständige Widerrufsbelehrung mit allen Fristen und einem Muster-Widerrufsformular
          finden Sie unter{" "}
          <Link href="/widerruf" className="text-accent hover:underline">
            Widerruf
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}

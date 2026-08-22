import Link from "next/link";
import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";
import { ORDER_NUMBER_HINT, SHOP_CONTACT_EMAIL } from "@/lib/shopContact";

export const metadata = { title: "Sendungsverfolgung – TechBuy" };

export default function TrackingPage() {
  return (
    <LegalPageLayout eyebrow="Service" title="Sendungsverfolgung">
      <LegalSection title="Tracking Ihrer Sendung">
        <p>
          Sobald Ihre Bestellung versendet wurde, erhalten Sie die DHL-Sendungsnummer, mit der Sie
          Ihr Paket direkt bei DHL verfolgen können. Eine integrierte Sendungsverfolgung in
          unserem Shop bieten wir aktuell noch nicht an.
        </p>
      </LegalSection>
      <LegalSection title="Keine Sendungsnummer erhalten?">
        <p>
          Kontaktieren Sie uns über unsere{" "}
          <Link href="/kontakt" className="text-accent hover:underline">
            Kontaktseite
          </Link>{" "}
          oder per E-Mail an{" "}
          <a className="text-accent hover:underline" href={`mailto:${SHOP_CONTACT_EMAIL}`}>
            {SHOP_CONTACT_EMAIL}
          </a>
          . {ORDER_NUMBER_HINT} Wir teilen Ihnen den aktuellen Versandstatus gerne mit.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}

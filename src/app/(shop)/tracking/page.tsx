import Link from "next/link";
import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";

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
          mit Ihrer Bestellnummer — wir teilen Ihnen den aktuellen Versandstatus gerne mit.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}

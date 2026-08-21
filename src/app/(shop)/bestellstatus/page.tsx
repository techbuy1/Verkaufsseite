import Link from "next/link";
import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";

export const metadata = { title: "Bestellstatus – TechBuy" };

export default function BestellstatusPage() {
  return (
    <LegalPageLayout eyebrow="Service" title="Bestellstatus">
      <LegalSection title="Status Ihrer Bestellung erfragen">
        <p>
          Eine automatische Online-Sendungsverfolgung bieten wir aktuell noch nicht an. Für den
          aktuellen Status Ihrer Bestellung kontaktieren Sie uns bitte mit Ihrer Bestellnummer
          über unsere{" "}
          <Link href="/kontakt" className="text-accent hover:underline">
            Kontaktseite
          </Link>{" "}
          oder per E-Mail an{" "}
          <a className="text-accent hover:underline" href="mailto:Bill@techbuy-ankauf.de">
            Bill@techbuy-ankauf.de
          </a>
          . Wir melden uns zeitnah mit dem aktuellen Stand zurück.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}

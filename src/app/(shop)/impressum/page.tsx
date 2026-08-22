import Link from "next/link";
import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";
import { companySettings } from "@/lib/companySettings";
import { ORDER_NUMBER_HINT, SHOP_CONTACT_EMAIL } from "@/lib/shopContact";

export const metadata = { title: "Impressum – TechBuy" };

export default function ImpressumPage() {
  return (
    <LegalPageLayout eyebrow="Rechtliches" title="Impressum">
      <LegalSection title="Angaben gemäß § 5 TMG">
        <p>
          {companySettings.companyName}
          <br />
          Inhaber: {companySettings.ownerName}
          <br />
          {companySettings.street}
          <br />
          {companySettings.postalCode} {companySettings.city}
          <br />
          {companySettings.country}
        </p>
      </LegalSection>

      <LegalSection title="Kontakt">
        <p>
          Telefon: {companySettings.phone}
          <br />
          E-Mail:{" "}
          <a className="text-accent hover:underline" href={`mailto:${SHOP_CONTACT_EMAIL}`}>
            {SHOP_CONTACT_EMAIL}
          </a>
        </p>
        <p className="pt-2 text-[14px] text-text-secondary">{ORDER_NUMBER_HINT}</p>
      </LegalSection>

      <LegalSection title="Umsatzsteuer">
        <p>
          Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz: {companySettings.vatId}
          <br />
          Steuernummer: {companySettings.taxNumber}
        </p>
      </LegalSection>

      <LegalSection title="Verantwortlich für den Inhalt">
        <p>
          Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:
          <br />
          {companySettings.ownerName}
          <br />
          {companySettings.street}, {companySettings.postalCode} {companySettings.city}
        </p>
      </LegalSection>

      <LegalSection title="EU-Streitschlichtung">
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit, die Sie unter{" "}
          <a
            className="text-accent hover:underline"
            href="https://ec.europa.eu/consumers/odr/"
            target="_blank"
            rel="noopener noreferrer"
          >
            ec.europa.eu/consumers/odr
          </a>{" "}
          finden. Unsere E-Mail-Adresse finden Sie oben im Impressum.
        </p>
        <p>
          Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </LegalSection>

      <p className="text-[13px] text-text-secondary/70">
        Fragen zu einer Bestellung oder zum Ankauf eines Geräts beantworten wir gern über die{" "}
        <Link href="/kontakt" className="text-accent hover:underline">
          Kontaktseite
        </Link>{" "}
        bzw. per E-Mail an {SHOP_CONTACT_EMAIL}. {ORDER_NUMBER_HINT}
      </p>
    </LegalPageLayout>
  );
}

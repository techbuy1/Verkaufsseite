import Link from "next/link";
import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";

export const metadata = { title: "Impressum – TechBuy" };

export default function ImpressumPage() {
  return (
    <LegalPageLayout eyebrow="Rechtliches" title="Impressum">
      <LegalSection title="Angaben gemäß § 5 TMG">
        <p>
          Techbuy
          <br />
          Inhaber: Ahmad Amir Popal
          <br />
          Krümmelstraße 2
          <br />
          21502 Geesthacht
          <br />
          Deutschland
        </p>
      </LegalSection>

      <LegalSection title="Kontakt">
        <p>
          Telefon: 01630448214
          <br />
          E-Mail:{" "}
          <a className="text-accent hover:underline" href="mailto:Bill@techbuy-ankauf.de">
            Bill@techbuy-ankauf.de
          </a>
        </p>
      </LegalSection>

      <LegalSection title="Umsatzsteuer">
        <p>
          Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz: DE450323348
          <br />
          Steuernummer: 112700620
        </p>
      </LegalSection>

      <LegalSection title="Verantwortlich für den Inhalt">
        <p>
          Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:
          <br />
          Ahmad Amir Popal
          <br />
          Krümmelstraße 2, 21502 Geesthacht
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
        </Link>
        .
      </p>
    </LegalPageLayout>
  );
}

import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";
import { companySettings } from "@/lib/companySettings";
import { SHOP_CONTACT_EMAIL } from "@/lib/shopContact";

export const metadata = { title: "Datenschutzerklärung – TechBuy" };

export default function DatenschutzPage() {
  return (
    <LegalPageLayout
      eyebrow="Rechtliches"
      title="Datenschutzerklärung"
      intro="Wir freuen uns über Ihr Interesse an TechBuy. Der Schutz Ihrer personenbezogenen Daten ist uns wichtig. Nachfolgend informieren wir Sie darüber, welche Daten bei der Nutzung dieser Website verarbeitet werden."
    >
      <LegalSection title="1. Verantwortlicher">
        <p>
          Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:
          <br />
          {companySettings.ownerName}
          <br />
          {companySettings.companyName}
          <br />
          {companySettings.street}
          <br />
          {companySettings.postalCode} {companySettings.city}
          <br />
          {companySettings.country}
          <br />
          E-Mail:{" "}
          <a className="text-accent hover:underline" href={`mailto:${SHOP_CONTACT_EMAIL}`}>
            {SHOP_CONTACT_EMAIL}
          </a>
          <br />
          Telefon: {companySettings.phone}
        </p>
      </LegalSection>

      <LegalSection title="2. Hosting und Server-Logfiles">
        <p>
          Beim Aufruf dieser Website erhebt unser Hosting-Anbieter automatisch technische
          Informationen (sogenannte Server-Logfiles), die Ihr Browser übermittelt, insbesondere
          Browsertyp, verwendetes Betriebssystem, aufgerufene Seite, Datum und Uhrzeit des
          Zugriffs sowie die gekürzte oder vollständige IP-Adresse. Diese Daten dienen der
          technischen Bereitstellung der Website und der Gewährleistung der Systemsicherheit
          (Art. 6 Abs. 1 lit. f DSGVO) und werden nicht mit anderen Datenquellen zusammengeführt.
        </p>
      </LegalSection>

      <LegalSection title="3. Keine Cookies, kein Tracking, keine Analyse-Tools">
        <p>
          Diese Website setzt derzeit keine Cookies zu Analyse-, Marketing- oder
          Tracking-Zwecken ein. Es werden aktuell keine Dienste wie Google Analytics, Meta-/TikTok-
          Pixel oder vergleichbare Trackingtools verwendet.
        </p>
      </LegalSection>

      <LegalSection title="4. Lokale Speicherung im Browser (Local Storage)">
        <p>
          Damit Warenkorb, Wunschliste und die im Shop angezeigten Produktdaten auch nach einem
          Neuladen der Seite erhalten bleiben, speichert diese Website bestimmte Informationen
          lokal in Ihrem Browser (sogenannter „Local Storage“). Diese Daten verlassen Ihr Gerät
          nicht, werden nicht an uns oder Dritte übertragen und dienen ausschließlich der
          Funktionalität des Shops (Art. 6 Abs. 1 lit. f DSGVO, berechtigtes Interesse an einer
          funktionierenden Website). Sie können diese Daten jederzeit über die
          Browsereinstellungen löschen.
        </p>
      </LegalSection>

      <LegalSection title="5. Kontaktaufnahme">
        <p>
          Wenn Sie uns per E-Mail kontaktieren, werden Ihre Angaben (z. B. E-Mail-Adresse, Name,
          Nachrichtentext) zur Bearbeitung Ihrer Anfrage gespeichert und verarbeitet
          (Art. 6 Abs. 1 lit. b bzw. lit. f DSGVO). Diese Daten geben wir nicht ohne Ihre
          Einwilligung weiter.
        </p>
      </LegalSection>

      <LegalSection title="6. Zahlungsdienste und Bestellabwicklung">
        <p>
          Für den Kauf von Geräten über unseren Shop ist derzeit keine Online-Zahlungsabwicklung
          über einen externen Zahlungsdienstleister aktiv geschaltet. Sobald ein
          Zahlungsdienstleister produktiv eingebunden wird, werden wir diese Datenschutzerklärung
          entsprechend um Name, Sitz und Zweck der Datenverarbeitung dieses Anbieters ergänzen.
        </p>
        <p>
          Der Ankauf gebrauchter Geräte erfolgt über unsere separate Ankauf-Plattform unter{" "}
          <a
            className="text-accent hover:underline"
            href="https://www.techbuy-ankauf.de/"
            target="_blank"
            rel="noopener noreferrer"
          >
            techbuy-ankauf.de
          </a>
          . Für die dortige Datenverarbeitung gilt die Datenschutzerklärung dieser Plattform.
        </p>
      </LegalSection>

      <LegalSection title="7. Ihre Rechte">
        <p>Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Auskunft über Ihre gespeicherten personenbezogenen Daten (Art. 15 DSGVO)</li>
          <li>Berichtigung unrichtiger personenbezogener Daten (Art. 16 DSGVO)</li>
          <li>Löschung Ihrer bei uns gespeicherten Daten (Art. 17 DSGVO)</li>
          <li>Einschränkung der Datenverarbeitung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruch gegen die Verarbeitung Ihrer Daten (Art. 21 DSGVO)</li>
        </ul>
        <p>
          Zudem haben Sie das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die
          Verarbeitung Ihrer personenbezogenen Daten durch uns zu beschweren.
        </p>
      </LegalSection>

      <LegalSection title="8. Kontakt bei Datenschutzfragen">
        <p>
          Bei Fragen zur Erhebung, Verarbeitung oder Nutzung Ihrer personenbezogenen Daten
          erreichen Sie uns unter{" "}
          <a className="text-accent hover:underline" href={`mailto:${SHOP_CONTACT_EMAIL}`}>
            {SHOP_CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}

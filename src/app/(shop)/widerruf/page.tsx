import { Suspense } from "react";
import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";
import { WithdrawalForm } from "@/components/legal/WithdrawalForm";
import { companySettings } from "@/lib/companySettings";
import { ORDER_NUMBER_HINT, SHOP_CONTACT_EMAIL } from "@/lib/shopContact";

export const metadata = { title: "Widerruf erklären – TechBuy" };

function WithdrawalFormFallback() {
  return (
    <div
      id="widerruf-formular"
      className="rounded-[16px] border border-border bg-surface-card p-6 text-[14px] text-text-secondary"
    >
      Formular wird geladen …
    </div>
  );
}

export default function WiderrufPage() {
  return (
    <LegalPageLayout
      eyebrow="Rechtliches"
      title="Widerruf erklären"
      intro="Hier kannst du uns deinen Widerruf zu einer Bestellung übermitteln."
    >
      <LegalSection title="Widerruf übermitteln">
        <Suspense fallback={<WithdrawalFormFallback />}>
          <WithdrawalForm />
        </Suspense>
      </LegalSection>

      <div id="widerrufsrecht">
        <LegalSection title="Widerrufsrecht">
          <p>
            Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu
            widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von
            Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen
            haben bzw. hat.
          </p>
          <p>
            Um Ihr Widerrufsrecht auszuüben, müssen Sie uns
            <br />
            {companySettings.companyName}, {companySettings.ownerName}, {companySettings.street},{" "}
            {companySettings.postalCode} {companySettings.city}, E-Mail:{" "}
            <a className="text-accent hover:underline" href={`mailto:${SHOP_CONTACT_EMAIL}`}>
              {SHOP_CONTACT_EMAIL}
            </a>
            , Telefon: {companySettings.phone}
            <br />
            mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine
            E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.{" "}
            {ORDER_NUMBER_HINT} Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung
            über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
          </p>
        </LegalSection>
      </div>

      <LegalSection title="Folgen des Widerrufs">
        <p>
          Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen
          erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten,
          die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns
          angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens
          binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren
          Widerruf dieses Vertrags bei uns eingegangen ist.
        </p>
        <p>
          Wir können die Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben
          oder bis Sie den Nachweis erbracht haben, dass Sie die Waren zurückgesandt haben, je
          nachdem, welches der frühere Zeitpunkt ist.
        </p>
        <p>
          Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab
          dem Tag, an dem Sie uns über den Widerruf dieses Vertrags unterrichten, an uns
          zurückzusenden. Die Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von
          vierzehn Tagen absenden. Sie tragen die unmittelbaren Kosten der Rücksendung der Waren.
        </p>
        <p>
          Sie müssen für einen etwaigen Wertverlust der Waren nur aufkommen, wenn dieser
          Wertverlust auf einen zur Prüfung von Beschaffenheit, Eigenschaften und Funktionsweise
          der Waren nicht notwendigen Umgang mit ihnen zurückzuführen ist.
        </p>
      </LegalSection>

      <LegalSection title="Muster-Widerrufsformular">
        <p>
          (Wenn Sie den Vertrag widerrufen wollen, füllen Sie bitte dieses Formular aus und senden
          Sie es zurück.)
        </p>
        <div className="rounded-[14px] bg-background-secondary p-4 text-[13px] leading-relaxed">
          <p>
            An: {companySettings.companyName}, {companySettings.ownerName}, {companySettings.street},{" "}
            {companySettings.postalCode} {companySettings.city}, {SHOP_CONTACT_EMAIL}
          </p>
          <p className="mt-2">
            Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den
            Kauf der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*):
          </p>
          <p className="mt-2">Bestellt am (*)/erhalten am (*):</p>
          <p>Bestellnummer:</p>
          <p>Name des/der Verbraucher(s):</p>
          <p>Anschrift des/der Verbraucher(s):</p>
          <p>Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)</p>
          <p>Datum</p>
          <p className="mt-2 text-text-secondary/70">(*) Unzutreffendes streichen.</p>
        </div>
      </LegalSection>

      <LegalSection title="Ankauf gebrauchter Geräte durch TechBuy — kein Widerruf über diesen Shop">
        <p>
          Wenn Sie ein gebrauchtes Gerät an TechBuy verkaufen möchten (Ankauf), erfolgt dieser
          Vorgang über unsere separate Plattform{" "}
          <a
            className="text-accent hover:underline"
            href="https://www.techbuy-ankauf.de/"
            target="_blank"
            rel="noopener noreferrer"
          >
            techbuy-ankauf.de
          </a>
          . In diesem Fall sind <strong>Sie</strong> der Verkäufer und TechBuy der Käufer des
          Geräts — die oben stehende Widerrufsbelehrung für Warenkäufe bei TechBuy ist auf diesen
          umgekehrten Fall nicht direkt anwendbar. Angaben zu Widerruf, Rücktritt oder
          Stornierung eines Ankauf-Vorgangs entnehmen Sie bitte den Bedingungen auf
          techbuy-ankauf.de bzw. erfragen Sie direkt bei uns unter {SHOP_CONTACT_EMAIL}.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}

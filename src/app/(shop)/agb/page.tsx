import Link from "next/link";
import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";

export const metadata = { title: "AGB – TechBuy" };

export default function AgbPage() {
  return (
    <LegalPageLayout
      eyebrow="Rechtliches"
      title="Allgemeine Geschäftsbedingungen"
      intro="Diese Allgemeinen Geschäftsbedingungen (AGB) regeln den Verkauf von Waren durch Techbuy an Kunden sowie den Ankauf gebrauchter Geräte durch Techbuy. Bitte lesen Sie diese AGB vor einer Bestellung bzw. einem Verkauf an uns sorgfältig durch."
      updatedAt="20. August 2026 (Entwurfsfassung, siehe Hinweis unten)"
    >
      <div className="rounded-[16px] border border-amber-300/60 bg-amber-50 p-4 text-[13px] leading-relaxed text-amber-900">
        <strong>Hinweis:</strong> Diese AGB sind ein sorgfältig erstellter Entwurf auf Basis der
        aktuellen deutschen Rechtslage. Vor dem produktiven Einsatz sollten sie von einer
        Rechtsanwältin bzw. einem Rechtsanwalt für IT-/Vertragsrecht geprüft und final freigegeben
        werden.
      </div>

      <LegalSection title="§ 1 Geltungsbereich, Anbieter">
        <p>
          (1) Anbieter dieses Onlineshops ist Techbuy, Inhaber Ahmad Amir Popal, Krümmelstraße 2,
          21502 Geesthacht (nachfolgend „TechBuy“; Kontaktdaten siehe{" "}
          <Link className="text-accent hover:underline" href="/impressum">
            Impressum
          </Link>
          ).
        </p>
        <p>
          (2) Diese AGB gelten für (a) den Kauf von Waren durch Kunden über den
          TechBuy-Onlineshop und (b) den Ankauf gebrauchter Smartphones und Elektronikgeräte durch
          TechBuy von Kunden gemäß § 8. Sie gelten sowohl gegenüber Verbrauchern (§ 13 BGB) als
          auch gegenüber Unternehmern (§ 14 BGB); Abweichungen für Unternehmer sind in § 13
          geregelt.
        </p>
        <p>
          (3) Entgegenstehende oder von diesen AGB abweichende Bedingungen des Kunden werden
          nicht anerkannt, es sei denn, TechBuy stimmt ihrer Geltung ausdrücklich schriftlich zu.
        </p>
      </LegalSection>

      <LegalSection title="§ 2 Vertragsgegenstand, Produktzustand">
        <p>
          (1) TechBuy bietet neue und gebrauchte Smartphones, Tablets und weitere Elektronik zum
          Kauf an.
        </p>
        <p>
          (2) Bei gebrauchten Geräten wird der Zustand vor dem Kauf in der Produktbeschreibung
          anhand einer Zustandsstufe ausgewiesen (z. B. „Neu“, „Wie neu“, „Hervorragend“, „Sehr
          gut“, „Gut“, „Stark gebraucht“, „Schlecht“). Diese Zustandsstufe beschreibt den
          allgemeinen kosmetischen und funktionalen Zustand des Geräts zum Zeitpunkt der
          Einstellung und wird Bestandteil der zwischen den Parteien vereinbarten Beschaffenheit
          im Sinne des § 434 BGB. Weitergehende Eigenschaften werden nur zugesichert, soweit sie
          ausdrücklich in der Produktbeschreibung genannt sind.
        </p>
        <p>
          (3) Sofern nicht anders angegeben, werden Geräte ohne SIM-Lock/Netzbetreiberbindung und
          ohne aktivierte Aktivierungssperre (z. B. Apple Activation Lock, Google
          Factory-Reset-Protection) verkauft. Abweichungen hiervon werden in der jeweiligen
          Produktbeschreibung ausdrücklich benannt.
        </p>
        <p>
          (4) Lieferumfang und beigefügtes Zubehör (z. B. Ladekabel, Originalverpackung) ergeben
          sich ausschließlich aus der jeweiligen Produktbeschreibung; ohne entsprechende Angabe
          besteht kein Anspruch auf Originalzubehör oder -verpackung.
        </p>
      </LegalSection>

      <LegalSection title="§ 3 Vertragsschluss">
        <p>
          (1) Die Darstellung der Produkte im Onlineshop stellt kein bindendes Angebot von
          TechBuy dar, sondern eine unverbindliche Aufforderung an den Kunden, seinerseits ein
          Angebot abzugeben (invitatio ad offerendum).
        </p>
        <p>
          (2) Mit dem Absenden einer Bestellung über den Onlineshop gibt der Kunde ein
          verbindliches Angebot zum Abschluss eines Kaufvertrags ab. Der Kaufvertrag kommt erst
          zustande, sobald TechBuy die Bestellung durch eine ausdrückliche Annahmeerklärung (z. B.
          Auftragsbestätigung per E-Mail) bestätigt oder die bestellte Ware tatsächlich versendet
          — je nachdem, welches Ereignis zuerst eintritt. Eine automatische
          Eingangsbestätigung der Bestellung stellt noch keine Annahme des Angebots dar.
        </p>
        <p>
          (3) TechBuy ist berechtigt, ein Bestellangebot ganz oder teilweise abzulehnen,
          insbesondere wenn (a) das bestellte Gerät entgegen einer automatisierten
          Bestandsanzeige tatsächlich nicht mehr verfügbar ist, (b) offensichtliche Irrtümer bei
          Preis-, Zustands- oder Produktangaben (z. B. technisch bedingte Darstellungsfehler,
          Tippfehler) vorliegen, oder (c) begründete Zweifel an der Bonität oder Identität des
          Kunden bestehen. In diesen Fällen wird der Kunde unverzüglich informiert; bereits
          geleistete Zahlungen werden unverzüglich erstattet.
        </p>
      </LegalSection>

      <LegalSection title="§ 4 Preise und Zahlung">
        <p>
          (1) Alle angegebenen Preise verstehen sich in Euro inklusive der jeweils geltenden
          gesetzlichen Umsatzsteuer, soweit nicht anders angegeben. Bei differenzbesteuerten
          Gebrauchtgeräten nach § 25a UStG wird keine Umsatzsteuer gesondert ausgewiesen; ein
          entsprechender Hinweis erfolgt im Bestellprozess.
        </p>
        <p>
          (2) Die im jeweiligen Bestellprozess angebotenen Zahlungsarten werden dem Kunden vor
          Abschluss der Bestellung angezeigt.
        </p>
      </LegalSection>

      <LegalSection title="§ 5 Lieferung">
        <p>
          Die Lieferung erfolgt an die vom Kunden angegebene Lieferadresse; Einzelheiten unter{" "}
          <Link className="text-accent hover:underline" href="/versand">
            Versand
          </Link>{" "}
          und{" "}
          <Link className="text-accent hover:underline" href="/lieferzeiten">
            Lieferzeiten
          </Link>
          . Für Verzögerungen durch höhere Gewalt oder durch von TechBuy nicht zu vertretende
          Umstände (z. B. beim Versanddienstleister) haftet TechBuy nicht, unbeschadet zwingender
          gesetzlicher Regelungen zu Gefahrübergang und Leistungsstörung.
        </p>
      </LegalSection>

      <LegalSection title="§ 6 Widerrufsrecht">
        <p>
          Verbrauchern steht beim Kauf von Waren über diesen Onlineshop ein gesetzliches
          Widerrufsrecht zu. Einzelheiten und das Muster-Widerrufsformular finden Sie in unserer{" "}
          <Link className="text-accent hover:underline" href="/widerruf">
            Widerrufsbelehrung
          </Link>
          . Für den umgekehrten Fall — den Verkauf eines Geräts an TechBuy — gilt § 8 dieser AGB.
        </p>
      </LegalSection>

      <LegalSection title="§ 7 Sachmängelhaftung (Gewährleistung)">
        <p>
          (1) Es gelten die gesetzlichen Vorschriften zur Sachmängelhaftung, soweit nachfolgend
          nichts anderes geregelt ist.
        </p>
        <p>
          (2) Der in der Produktbeschreibung angegebene Zustand des Geräts (§ 2 Abs. 2) ist
          Bestandteil der vereinbarten Beschaffenheit. Dort beschriebene, zustandstypische
          Gebrauchsspuren (z. B. leichte Kratzer bei „Gut“) stellen keinen Sachmangel dar.
        </p>
        <p>
          (3) <strong>Verkürzung der Verjährungsfrist bei gebrauchten Waren.</strong> Beim Kauf
          eines gebrauchten Geräts durch einen Verbraucher wird die gesetzliche Verjährungsfrist
          für Sachmängelansprüche von zwei Jahren auf ein Jahr ab Ablieferung der Ware verkürzt.
          Diese Verkürzung gilt nicht für Schadensersatzansprüche, für Ansprüche wegen Verletzung
          des Lebens, des Körpers, der Gesundheit oder der Freiheit sowie nicht bei Vorsatz oder
          grober Fahrlässigkeit von TechBuy oder bei arglistigem Verschweigen eines Mangels. Die
          Verkürzung wird gegenüber Verbrauchern gemäß § 476 Abs. 2 BGB nur wirksam vereinbart,
          wenn sie dem Kunden im Bestellprozess gesondert (z. B. durch ein separates Ankreuzfeld
          bei gebrauchten Artikeln) zur ausdrücklichen Bestätigung vorgelegt wird; ohne eine
          solche gesonderte Bestätigung verbleibt es bei der gesetzlichen zweijährigen Frist.
        </p>
        <p>
          (4) Bei berechtigten Mängelanzeigen wird zunächst Nacherfüllung geleistet (nach Wahl von
          TechBuy durch Nachbesserung oder Ersatzlieferung, soweit ein vergleichbares Gerät
          verfügbar ist). Schlägt die Nacherfüllung fehl oder ist sie unzumutbar, stehen dem
          Kunden die weiteren gesetzlichen Rechte (Minderung, Rücktritt) zu.
        </p>
        <p>
          (5) Zur zügigen Bearbeitung bittet TechBuy, Mängel unter genauer Beschreibung sowie mit
          Fotodokumentation über die{" "}
          <Link className="text-accent hover:underline" href="/kontakt">
            Kontaktseite
          </Link>{" "}
          anzuzeigen. Verschleiß durch normalen, bestimmungsgemäßen Gebrauch nach Gefahrübergang
          (z. B. übliche alterungsbedingte Akkukapazitätsminderung) stellt keinen Sachmangel dar.
        </p>
      </LegalSection>

      <LegalSection title="§ 8 Ankauf gebrauchter Geräte durch TechBuy">
        <p>
          (1) <strong>Anwendungsbereich.</strong> Möchte ein Kunde TechBuy ein gebrauchtes
          Smartphone oder ein anderes Elektronikgerät verkaufen („Ankauf“), gilt dieser § 8. In
          diesem Fall ist der Kunde Verkäufer und TechBuy Käufer des Geräts. Der Ankaufprozess
          wird über unsere Plattform{" "}
          <a
            className="text-accent hover:underline"
            href="https://www.techbuy-ankauf.de/"
            target="_blank"
            rel="noopener noreferrer"
          >
            techbuy-ankauf.de
          </a>{" "}
          abgewickelt; ergänzend gelten die dort hinterlegten Prozessbedingungen.
        </p>
        <p>
          (2) <strong>Angebot und Bindungswirkung.</strong> Auf Basis der vom Kunden gemachten
          Zustandsangaben erstellt TechBuy ein erstes, unverbindliches Preisangebot. Dieses
          Angebot steht unter dem Vorbehalt der Überprüfung des Geräts nach Eingang bei TechBuy
          und wird erst durch die Auszahlung gemäß Abs. 6 verbindlich angenommen.
        </p>
        <p>
          (3) <strong>Zustandserklärung des Verkäufers.</strong> Der Kunde sichert zu, dass die
          von ihm gemachten Angaben zu Modell, Zustand, Funktionsfähigkeit und Zubehör des Geräts
          wahrheitsgemäß und vollständig sind.
        </p>
        <p>
          (4) <strong>Prüfung und Abweichungen.</strong> Nach Eingang prüft TechBuy das Gerät auf
          Übereinstimmung mit den Angaben des Kunden (u. a. Modell, Zustand, Funktionsfähigkeit,
          Vollständigkeit, IMEI-/Seriennummer, Aktivierungssperren). Weicht der tatsächliche
          Zustand wesentlich von den Angaben des Kunden ab, unterbreitet TechBuy dem Kunden ein
          neues, angepasstes Angebot. Der Kunde kann dieses neue Angebot annehmen oder ablehnen;
          lehnt er ab oder reagiert er nicht innerhalb einer von TechBuy gesetzten angemessenen
          Frist, sendet TechBuy das Gerät auf Kosten des Kunden an die zuletzt bekannte Adresse
          zurück.
        </p>
        <p>
          (5) <strong>Eigentum und Rechtsmängelfreiheit.</strong> Der Kunde sichert zu, dass er
          uneingeschränkter Eigentümer des Geräts ist, dass keine Rechte Dritter (z. B.
          Finanzierung, Leasing, Sicherungsübereignung, Pfandrechte) an dem Gerät bestehen, dass
          das Gerät nicht als gestohlen oder verloren gemeldet ist und dass keine
          Aktivierungssperre oder sonstige Verfügungsbeschränkung besteht, die nicht vor der
          Einsendung entfernt wurde. Bei begründetem Verdacht auf eine rechtswidrige Herkunft des
          Geräts oder auf entgegenstehende Rechte Dritter ist TechBuy berechtigt, den Ankauf
          abzulehnen, die Auszahlung bis zur Klärung zurückzuhalten und — soweit gesetzlich
          zulässig — die zuständigen Behörden zu informieren.
        </p>
        <p>
          (6) <strong>Auszahlung.</strong> Die Auszahlung des (ggf. angepassten) Kaufpreises
          erfolgt nach erfolgreichem Abschluss der Prüfung gemäß Abs. 4 auf das vom Kunden
          angegebene Zahlungskonto. Für Verzögerungen durch fehlerhafte oder unvollständige
          Zahlungsangaben des Kunden ist TechBuy nicht verantwortlich. TechBuy behält die
          Auszahlung nicht länger als für die ordnungsgemäße Prüfung nach Abs. 4 erforderlich
          zurück.
        </p>
        <p>
          (7) <strong>Datenlöschung und Zubehör — Pflichten des Verkäufers.</strong> Der Kunde ist
          verpflichtet, vor Einsendung des Geräts: (a) alle persönlichen Daten zu sichern, (b) das
          Gerät auf Werkseinstellungen zurückzusetzen, (c) sämtliche Konten (u. a. Apple-ID,
          Google-Konto) und Aktivierungssperren zu entfernen, sowie (d) SIM-Karten und
          Speicherkarten aus dem Gerät zu entnehmen. TechBuy übernimmt keine Verantwortung für auf
          dem Gerät verbliebene Daten, SIM-Karten oder Speicherkarten und haftet nicht für
          hierdurch entstehende Schäden, soweit TechBuy dies nicht vorsätzlich oder grob
          fahrlässig zu vertreten hat.
        </p>
        <p>
          (8) <strong>Kein Widerrufsrecht von TechBuy.</strong> Da TechBuy beim Ankauf als
          Unternehmer auftritt, steht TechBuy insoweit kein verbrauchervertragliches
          Widerrufsrecht zu. Rückabwicklungen richten sich nach Abs. 4 sowie den allgemeinen
          gesetzlichen Regelungen.
        </p>
      </LegalSection>

      <LegalSection title="§ 9 Dokumentation">
        <p>
          Zur Nachvollziehbarkeit von Zustand, Vollständigkeit und Versand ist TechBuy berechtigt,
          eingehende und ausgehende Geräte zu fotografieren, Serien-/IMEI-Nummern zu erfassen und
          den Bearbeitungsstand (u. a. Prüfprotokolle, Versand- und Übergabenachweise,
          Kommunikation mit dem Kunden) zu dokumentieren. Diese Dokumentation dient der
          Nachweisführung bei Streitigkeiten über Zustand, Vollständigkeit oder Zeitpunkt des
          Gefahrübergangs und wird im Übrigen gemäß unserer{" "}
          <Link className="text-accent hover:underline" href="/datenschutz">
            Datenschutzerklärung
          </Link>{" "}
          behandelt.
        </p>
      </LegalSection>

      <LegalSection title="§ 10 Missbrauch und Verdachtsfälle">
        <p>
          TechBuy ist berechtigt, eine Bestellung oder einen Ankauf abzulehnen, auszusetzen oder —
          soweit gesetzlich zulässig — rückabzuwickeln, wenn im Einzelfall begründete
          tatsächliche Anhaltspunkte vorliegen für: falsche Zustands-, Identitäts- oder
          Zubehörangaben, manipulierte oder nicht mit den Angaben übereinstimmende
          Seriennummern/IMEI, gestohlene oder als vermisst gemeldete Geräte, nicht entfernte
          Aktivierungssperren, bestehende Finanzierungs- oder Sicherungsrechte Dritter, nicht
          autorisierte Umbauten, manipulierte Software oder den Einsatz nicht originaler
          Bauteile ohne entsprechende Offenlegung. Diese Berechtigung besteht nur nach Prüfung des
          jeweiligen Einzelfalls und stellt keinen pauschalen Ausschluss der Rechte des Kunden
          dar; weitergehende gesetzliche Ansprüche beider Seiten bleiben unberührt.
        </p>
      </LegalSection>

      <LegalSection title="§ 11 Haftung">
        <p>
          (1) TechBuy haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit, für Schäden aus
          der Verletzung des Lebens, des Körpers oder der Gesundheit, nach den Vorschriften des
          Produkthaftungsgesetzes sowie im Umfang einer von TechBuy ausdrücklich abgegebenen
          Garantie.
        </p>
        <p>
          (2) Bei leicht fahrlässiger Verletzung einer wesentlichen Vertragspflicht
          („Kardinalpflicht“ — eine Pflicht, deren Erfüllung die ordnungsgemäße Durchführung des
          Vertrags überhaupt erst ermöglicht und auf deren Einhaltung der Vertragspartner
          regelmäßig vertrauen darf) haftet TechBuy der Höhe nach begrenzt auf den bei
          Vertragsschluss vorhersehbaren, vertragstypischen Schaden.
        </p>
        <p>
          (3) Im Übrigen ist die Haftung von TechBuy für leicht fahrlässige Pflichtverletzungen
          ausgeschlossen. Die Haftung für Erfüllungsgehilfen richtet sich nach den vorstehenden
          Absätzen entsprechend.
        </p>
        <p>
          (4) Eine Beschränkung oder ein Ausschluss der Haftung nach den vorstehenden Absätzen
          gilt nicht, soweit dem zwingende gesetzliche Vorschriften entgegenstehen.
        </p>
      </LegalSection>

      <LegalSection title="§ 12 Rückgabe außerhalb des Widerrufsrechts">
        <p>
          Unabhängig vom gesetzlichen Widerrufsrecht (§ 6) kann TechBuy im Einzelfall eine
          freiwillige Rückgabemöglichkeit anbieten; ein Anspruch hierauf besteht nicht. Nähere
          Angaben hierzu finden Sie unter{" "}
          <Link className="text-accent hover:underline" href="/rueckgabe">
            Rückgabe
          </Link>
          . Widerruf, gesetzliche Gewährleistung, eine etwaige freiwillige Rückgabe und die
          Rückabwicklung eines Ankaufs nach § 8 Abs. 4 sind rechtlich eigenständige Vorgänge mit
          jeweils eigenen Voraussetzungen.
        </p>
      </LegalSection>

      <LegalSection title="§ 13 Geschäfte mit Unternehmern (B2B)">
        <p>
          Handelt der Kunde beim Abschluss des Vertrags in Ausübung seiner gewerblichen oder
          selbständigen beruflichen Tätigkeit (Unternehmer im Sinne des § 14 BGB), gilt
          abweichend von den vorstehenden Regelungen: (a) ein gesetzliches Widerrufsrecht nach § 6
          besteht nicht; (b) die Verjährungsfrist für Sachmängelansprüche bei gebrauchten Waren
          beträgt ein Jahr ab Ablieferung, ohne dass es einer gesonderten Bestätigung nach § 7
          Abs. 3 bedarf; (c) TechBuy haftet für leichte Fahrlässigkeit bei Kardinalpflichten
          gemäß § 11 Abs. 2 nur bis zur Höhe des vorhersehbaren, vertragstypischen Schadens. Die
          Regelungen dieses Absatzes gelten nicht gegenüber Verbrauchern.
        </p>
      </LegalSection>

      <LegalSection title="§ 14 Anwendbares Recht, Verbraucherstreitbeilegung">
        <p>
          (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des
          UN-Kaufrechts (CISG). Bei Verbrauchern gilt dies nur, soweit hierdurch der durch
          zwingende Bestimmungen des Rechts ihres gewöhnlichen Aufenthaltsstaats gewährte Schutz
          nicht entzogen wird.
        </p>
        <p>
          (2) Angaben zur Online-Streitbeilegung sowie zur Teilnahme an
          Verbraucherschlichtungsverfahren finden Sie im{" "}
          <Link className="text-accent hover:underline" href="/impressum">
            Impressum
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="§ 15 Salvatorische Klausel">
        <p>
          Sollte eine Bestimmung dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der
          übrigen Bestimmungen hiervon unberührt. Anstelle der unwirksamen Bestimmung gilt die
          gesetzliche Regelung.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}

import Link from "next/link";
import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";

export const metadata = { title: "Support – TechBuy" };

export default function SupportPage() {
  return (
    <LegalPageLayout eyebrow="Service" title="Support-Anfrage">
      <LegalSection title="Wir helfen gern">
        <p>
          Egal ob Frage zu einer Bestellung, einem Gerät oder dem Ankauf-Prozess — schreiben Sie
          uns über unsere{" "}
          <Link href="/kontakt" className="text-accent hover:underline">
            Kontaktseite
          </Link>{" "}
          oder direkt per E-Mail an{" "}
          <a className="text-accent hover:underline" href="mailto:Bill@techbuy-ankauf.de">
            Bill@techbuy-ankauf.de
          </a>{" "}
          bzw. telefonisch unter{" "}
          <a className="text-accent hover:underline" href="tel:+4901630448214">
            01630448214
          </a>
          .
        </p>
      </LegalSection>
      <LegalSection title="Häufige Themen">
        <p>
          Antworten auf häufige Fragen finden Sie auch in unserem{" "}
          <Link href="/faq" className="text-accent hover:underline">
            FAQ-Bereich
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}

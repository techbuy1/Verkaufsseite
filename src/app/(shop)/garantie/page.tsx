import Link from "next/link";
import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";

export const metadata = { title: "Garantie – TechBuy" };

export default function GarantiePage() {
  return (
    <LegalPageLayout
      eyebrow="Service"
      title="Garantie & Gewährleistung"
      intro="Für alle bei TechBuy gekauften Geräte gelten die gesetzlichen Gewährleistungsrechte."
    >
      <LegalSection title="Gesetzliche Gewährleistung">
        <p>
          Bei neuen Geräten beträgt die gesetzliche Gewährleistungsfrist zwei Jahre ab Übergabe.
          Bei gebrauchten Geräten kann diese Frist vertraglich verkürzt werden; die für Ihr Gerät
          geltende Frist wird Ihnen vor Kaufabschluss in der Produktbeschreibung angezeigt.
        </p>
      </LegalSection>
      <LegalSection title="Zustand gebrauchter Geräte">
        <p>
          Jedes gebrauchte Gerät wird vor dem Verkauf geprüft und mit einem transparenten Zustand
          gekennzeichnet (z. B. „Wie neu“, „Sehr gut“, „Gut“). Dieser Zustand wird Bestandteil der
          vereinbarten Beschaffenheit.
        </p>
      </LegalSection>
      <LegalSection title="Gewährleistungsfall">
        <p>
          Sollte an Ihrem Gerät ein Mangel auftreten, kontaktieren Sie uns bitte über unsere{" "}
          <Link href="/kontakt" className="text-accent hover:underline">
            Kontaktseite
          </Link>{" "}
          mit einer kurzen Beschreibung des Problems. Wir prüfen den Fall und melden uns mit dem
          weiteren Vorgehen bei Ihnen zurück.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}

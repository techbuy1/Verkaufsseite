"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  OPEN_CONSENT_EVENT,
  getStoredConsent,
  saveConsent,
} from "@/lib/cookieConsent";

/**
 * Einwilligungs-Banner (TTDSG § 25 / DSGVO). Erscheint beim ersten Besuch und
 * jederzeit erneut über den Footer-Link „Cookie-Einstellungen".
 *
 * - „Alle akzeptieren" und „Nur notwendige" sind gleichwertige Buttons.
 * - Marketing ist vorab NICHT ausgewählt.
 * - Bis zur Entscheidung wird kein Marketing-Script geladen (siehe GoogleAdsTag).
 */
export function CookieConsentBanner() {
  const [open, setOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) setOpen(true);

    function reopen() {
      const current = getStoredConsent();
      setMarketing(current?.marketing === true);
      setShowDetails(true);
      setOpen(true);
    }
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  if (!open) return null;

  function decide(allowMarketing: boolean) {
    saveConsent(allowMarketing);
    setOpen(false);
    setShowDetails(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie-Einstellungen"
      className="fixed inset-x-0 bottom-0 z-[100] px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div className="mx-auto max-w-[720px] rounded-[20px] border border-border bg-surface-card p-5 shadow-[var(--shadow-card-hover)] sm:p-6">
        <h2 className="text-[15px] font-semibold text-text-primary">
          Datenschutz-Einstellungen
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
          Wir verwenden technisch notwendige Cookies bzw. lokale Speicherung, damit
          der Shop (Warenkorb, Wunschliste, Anmeldung) funktioniert. Mit deiner
          Einwilligung setzen wir zusätzlich Google Ads für Reichweitenmessung und
          Remarketing ein. Du kannst deine Auswahl jederzeit über „Cookie-Einstellungen“
          im Footer ändern. Mehr in unserer{" "}
          <Link href="/datenschutz" className="text-accent hover:underline">
            Datenschutzerklärung
          </Link>{" "}
          und im{" "}
          <Link href="/impressum" className="text-accent hover:underline">
            Impressum
          </Link>
          .
        </p>

        {showDetails && (
          <div className="mt-4 space-y-3 rounded-[14px] border border-border bg-background/60 p-4">
            <label className="flex items-start gap-3 text-[13px]">
              <input
                type="checkbox"
                checked
                disabled
                className="mt-0.5 h-4 w-4 accent-[var(--color-accent)]"
              />
              <span>
                <span className="font-medium text-text-primary">Notwendig</span>
                <span className="block text-text-secondary">
                  Erforderlich für Warenkorb, Bestellung, Anmeldung und Sicherheit.
                  Immer aktiv.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-[13px]">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[var(--color-accent)]"
              />
              <span>
                <span className="font-medium text-text-primary">
                  Marketing (Google Ads)
                </span>
                <span className="block text-text-secondary">
                  Google Ads Remarketing und Conversion-Tracking (Google Ireland
                  Limited). Setzt Cookies erst nach deiner Einwilligung.
                </span>
              </span>
            </label>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {showDetails ? (
            <button
              type="button"
              onClick={() => decide(marketing)}
              className="btn-techbuy-primary flex-1 sm:flex-none"
            >
              Auswahl speichern
            </button>
          ) : (
            <button
              type="button"
              onClick={() => decide(true)}
              className="btn-techbuy-primary flex-1 sm:flex-none"
            >
              Alle akzeptieren
            </button>
          )}
          <button
            type="button"
            onClick={() => decide(false)}
            className="btn-techbuy-secondary flex-1 sm:flex-none"
          >
            Nur notwendige
          </button>
          {!showDetails && (
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="btn-techbuy-secondary flex-1 sm:flex-none"
            >
              Einstellungen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

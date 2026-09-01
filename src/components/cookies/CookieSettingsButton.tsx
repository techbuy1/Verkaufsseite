"use client";

import { openConsentSettings } from "@/lib/cookieConsent";

/**
 * Öffnet das Einwilligungs-Banner erneut. Für den Footer und die
 * Datenschutzerklärung, damit die Einwilligung jederzeit widerrufbar /
 * änderbar ist (DSGVO Art. 7 Abs. 3).
 */
export function CookieSettingsButton({
  className,
  children = "Cookie-Einstellungen",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button type="button" onClick={openConsentSettings} className={className}>
      {children}
    </button>
  );
}

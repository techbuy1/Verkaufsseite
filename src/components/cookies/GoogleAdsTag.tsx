"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import {
  CONSENT_CHANGE_EVENT,
  clearMarketingCookies,
  getStoredConsent,
  type ConsentState,
} from "@/lib/cookieConsent";

/** Google Ads Conversion / Remarketing Tag */
const GOOGLE_ADS_ID = "AW-17657259652";

/**
 * Lädt das Google-Ads-Tag ausschließlich nach erteilter Marketing-Einwilligung
 * (TTDSG § 25 Abs. 1, DSGVO Art. 6 Abs. 1 lit. a). Ohne Einwilligung wird kein
 * Script eingebunden und kein Google-Cookie gesetzt. Beim Widerruf werden die
 * bereits gesetzten Google-Cookies entfernt.
 */
export function GoogleAdsTag() {
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    setMarketing(getStoredConsent()?.marketing === true);

    function onChange(event: Event) {
      const next = (event as CustomEvent<ConsentState>).detail?.marketing === true;
      setMarketing((prev) => {
        if (prev && !next) clearMarketingCookies();
        return next;
      });
    }

    window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
  }, []);

  if (!marketing) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-gtag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GOOGLE_ADS_ID}');
        `}
      </Script>
    </>
  );
}

/**
 * Cookie-/Einwilligungs-Verwaltung (TTDSG § 25 / DSGVO Art. 6 Abs. 1 lit. a).
 *
 * Kategorien:
 *  - "necessary": technisch notwendig (Warenkorb, Session, Admin-Login,
 *    lokale Speicherung der Shop-Daten). Immer aktiv, keine Einwilligung nötig.
 *  - "marketing": Google Ads Remarketing / Conversion-Tracking. Lädt erst
 *    nach ausdrücklicher Einwilligung.
 *
 * Speicherung ausschließlich lokal im Browser (localStorage), keine
 * Server-Übertragung. Änderungen werden per CustomEvent verteilt, damit der
 * Tag-Loader und die „Cookie-Einstellungen" ohne Prop-Drilling reagieren.
 */

export const CONSENT_STORAGE_KEY = "techbuy-cookie-consent";
export const CONSENT_VERSION = 1;

export const CONSENT_CHANGE_EVENT = "techbuy:consent-change";
export const OPEN_CONSENT_EVENT = "techbuy:open-consent-settings";

export interface ConsentState {
  necessary: true;
  marketing: boolean;
  version: number;
  decidedAt: string;
}

export function getStoredConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (parsed.version !== CONSENT_VERSION) return null;
    return {
      necessary: true,
      marketing: parsed.marketing === true,
      version: CONSENT_VERSION,
      decidedAt:
        typeof parsed.decidedAt === "string"
          ? parsed.decidedAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function hasDecidedConsent(): boolean {
  return getStoredConsent() !== null;
}

export function saveConsent(marketing: boolean): ConsentState {
  const state: ConsentState = {
    necessary: true,
    marketing,
    version: CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private-Mode / Storage deaktiviert — Einwilligung gilt dann nur für
    // diesen Seitenaufruf. Kein harter Fehler.
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<ConsentState>(CONSENT_CHANGE_EVENT, { detail: state }),
    );
  }
  return state;
}

/** Öffnet den Einwilligungs-Dialog erneut (Footer-Link „Cookie-Einstellungen"). */
export function openConsentSettings(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
}

/** Von Google (Ads/Analytics) gesetzte Cookies beim Widerruf entfernen. */
export function clearMarketingCookies(): void {
  if (typeof document === "undefined") return;
  const host = window.location.hostname;
  const domains = [host, `.${host}`];
  // Basisdomain zusätzlich (z. B. .techbuyshop.de)
  const parts = host.split(".");
  if (parts.length > 2) domains.push(`.${parts.slice(-2).join(".")}`);

  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (!name) continue;
    if (!/^(_ga|_gid|_gat|_gcl|_gac|__gads|__gpi|IDE|AID|TAID)/.test(name)) {
      continue;
    }
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
    }
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}

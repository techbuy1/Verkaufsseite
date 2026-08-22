import { companySettings } from "@/lib/companySettings";

/** Öffentliche Kontakt-E-Mail des Shops. */
export const SHOP_CONTACT_EMAIL = companySettings.email;

export const SHOP_CONTACT_MAILTO = `mailto:${SHOP_CONTACT_EMAIL}`;

export function shopContactMailto(options?: {
  subject?: string;
  body?: string;
}): string {
  const params = new URLSearchParams();
  if (options?.subject) params.set("subject", options.subject);
  if (options?.body) params.set("body", options.body);
  const query = params.toString();
  return query ? `${SHOP_CONTACT_MAILTO}?${query}` : SHOP_CONTACT_MAILTO;
}

/** Kurzer Hinweis für Anfragen / Widerruf / Support. */
export const ORDER_NUMBER_HINT = companySettings.contactOrderNumberHint;

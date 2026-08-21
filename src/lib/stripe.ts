import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key || key.includes("REPLACE")) return null;

  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      apiVersion: "2025-08-27.basil",
      typescript: true,
    });
  }

  return stripeClient;
}

export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  return Boolean(key && !key.includes("REPLACE"));
}

/** Optional Stripe Price ID for single-product / featured checkout. */
export function getStripePriceId(): string | null {
  const id = process.env.STRIPE_PRICE_ID?.trim();
  return id && id.startsWith("price_") ? id : null;
}

export function getStripeWebhookSecret(): string | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  return secret && secret.startsWith("whsec_") ? secret : null;
}

/**
 * Publishable key — never required server-side for Checkout redirect.
 * Accepts both naming conventions from the brief.
 */
export function getStripePublishableKey(): string | null {
  const key =
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ||
    process.env.STRIPE_PUBLISHABLE_KEY?.trim();
  return key && key.startsWith("pk_") ? key : null;
}

export function getSiteUrl(request?: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (request) {
    const origin = request.headers.get("origin");
    if (origin) return origin.replace(/\/$/, "");
    const host = request.headers.get("host");
    if (host) {
      const proto = request.headers.get("x-forwarded-proto") ?? "http";
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  }

  return "http://localhost:3000";
}

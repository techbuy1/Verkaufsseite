import Stripe from "stripe";
import { isEnvConfigured } from "@/lib/env";

export { getSiteUrl } from "@/lib/siteUrl";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!isEnvConfigured("STRIPE_SECRET_KEY")) return null;
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;

  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      apiVersion: "2025-08-27.basil",
      typescript: true,
    });
  }

  return stripeClient;
}

export function isStripeConfigured(): boolean {
  return isEnvConfigured("STRIPE_SECRET_KEY");
}

/** Optional Stripe Price ID for single-product / featured checkout. */
export function getStripePriceId(): string | null {
  const id = process.env.STRIPE_PRICE_ID?.trim();
  return id && id.startsWith("price_") ? id : null;
}

export function getStripeWebhookSecret(): string | null {
  if (!isEnvConfigured("STRIPE_WEBHOOK_SECRET")) return null;
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


import { isEnvConfigured } from "@/lib/env";
import type { ValidatedCartTotals } from "@/lib/serverCheckout";
import { formatEuroAmount } from "@/lib/serverCheckout";

type PayPalEnv = "sandbox" | "live";

function getPayPalEnv(): PayPalEnv {
  const value = process.env.PAYPAL_ENV?.trim().toLowerCase();
  return value === "live" ? "live" : "sandbox";
}

export function isPayPalConfigured(): boolean {
  return (
    isEnvConfigured("NEXT_PUBLIC_PAYPAL_CLIENT_ID") &&
    isEnvConfigured("PAYPAL_CLIENT_SECRET")
  );
}

export function getPayPalClientId(): string | null {
  if (!isEnvConfigured("NEXT_PUBLIC_PAYPAL_CLIENT_ID")) return null;
  return process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() || null;
}

function getPayPalSecret(): string | null {
  if (!isEnvConfigured("PAYPAL_CLIENT_SECRET")) return null;
  return process.env.PAYPAL_CLIENT_SECRET?.trim() || null;
}

export function getPayPalWebhookId(): string | null {
  if (!isEnvConfigured("PAYPAL_WEBHOOK_ID")) return null;
  return process.env.PAYPAL_WEBHOOK_ID?.trim() || null;
}

function getApiBase(): string {
  return getPayPalEnv() === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

let cachedToken: { value: string; expiresAt: number } | null = null;

export async function getPayPalAccessToken(): Promise<string> {
  const clientId = getPayPalClientId();
  const secret = getPayPalSecret();
  if (!clientId || !secret) {
    throw new Error("PayPal ist nicht konfiguriert.");
  }

  if (cachedToken && Date.now() < cachedToken.expiresAt - 30_000) {
    return cachedToken.value;
  }

  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const response = await fetch(`${getApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal Auth fehlgeschlagen: ${text.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

async function paypalFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = await getPayPalAccessToken();
  const response = await fetch(`${getApiBase()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }

  if (!response.ok) {
    const message =
      typeof json === "object" &&
      json &&
      "message" in json &&
      typeof (json as { message: unknown }).message === "string"
        ? (json as { message: string }).message
        : text.slice(0, 240);
    throw new Error(message || `PayPal HTTP ${response.status}`);
  }

  return json as T;
}

export async function createPayPalOrder(input: {
  cart: ValidatedCartTotals;
  internalOrderId: string;
}): Promise<{ id: string }> {
  const { cart, internalOrderId } = input;
  const itemTotal = formatEuroAmount(cart.subtotal);
  const shipping = formatEuroAmount(cart.shipping);
  const discount = formatEuroAmount(cart.discount);
  const total = formatEuroAmount(cart.total);

  const body = {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: internalOrderId,
        custom_id: internalOrderId,
        description: "TechBuy Bestellung",
        amount: {
          currency_code: "EUR",
          value: total,
          breakdown: {
            item_total: { currency_code: "EUR", value: itemTotal },
            shipping: { currency_code: "EUR", value: shipping },
            ...(cart.discount > 0
              ? {
                  discount: { currency_code: "EUR", value: discount },
                }
              : {}),
          },
        },
        items: cart.lines.map((line) => ({
          name: line.productName.slice(0, 127),
          quantity: String(line.quantity),
          unit_amount: {
            currency_code: "EUR",
            value: formatEuroAmount(line.unitPrice),
          },
          description: [line.colorName, line.storage, line.conditionLabel]
            .filter(Boolean)
            .join(" · ")
            .slice(0, 127),
          category: "PHYSICAL_GOODS",
          sku: line.productId.slice(0, 127),
        })),
      },
    ],
    application_context: {
      shipping_preference: "GET_FROM_FILE",
      user_action: "PAY_NOW",
      brand_name: "TechBuy",
    },
  };

  const order = await paypalFetch<{ id: string }>("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return { id: order.id };
}

export interface PayPalCaptureResult {
  id: string;
  status: string;
  captureId?: string;
  paidAmount?: number;
  currency?: string;
  payerEmail?: string | null;
  customId?: string | null;
}

export async function capturePayPalOrder(
  paypalOrderId: string,
): Promise<PayPalCaptureResult> {
  const order = await paypalFetch<{
    id: string;
    status: string;
    purchase_units?: Array<{
      custom_id?: string;
      payments?: {
        captures?: Array<{
          id: string;
          status: string;
          amount?: { value: string; currency_code: string };
        }>;
      };
    }>;
    payer?: { email_address?: string };
  }>(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
    method: "POST",
    body: "{}",
  });

  const unit = order.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  const paidAmount = capture?.amount?.value
    ? Number.parseFloat(capture.amount.value)
    : undefined;

  return {
    id: order.id,
    status: order.status,
    captureId: capture?.id,
    paidAmount: Number.isFinite(paidAmount) ? paidAmount : undefined,
    currency: capture?.amount?.currency_code,
    payerEmail: order.payer?.email_address ?? null,
    customId: unit?.custom_id ?? null,
  };
}

export async function getPayPalOrder(paypalOrderId: string) {
  return paypalFetch<{
    id: string;
    status: string;
    purchase_units?: Array<{
      custom_id?: string;
      amount?: { value: string; currency_code: string };
    }>;
  }>(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`);
}

export async function verifyPayPalWebhook(input: {
  headers: Headers;
  rawBody: string;
}): Promise<boolean> {
  const webhookId = getPayPalWebhookId();
  if (!webhookId) return false;

  const transmissionId = input.headers.get("paypal-transmission-id");
  const transmissionTime = input.headers.get("paypal-transmission-time");
  const certUrl = input.headers.get("paypal-cert-url");
  const authAlgo = input.headers.get("paypal-auth-algo");
  const transmissionSig = input.headers.get("paypal-transmission-sig");

  if (
    !transmissionId ||
    !transmissionTime ||
    !certUrl ||
    !authAlgo ||
    !transmissionSig
  ) {
    return false;
  }

  let webhookEvent: unknown;
  try {
    webhookEvent = JSON.parse(input.rawBody);
  } catch {
    return false;
  }

  try {
    const result = await paypalFetch<{ verification_status?: string }>(
      "/v1/notifications/verify-webhook-signature",
      {
        method: "POST",
        body: JSON.stringify({
          transmission_id: transmissionId,
          transmission_time: transmissionTime,
          cert_url: certUrl,
          auth_algo: authAlgo,
          transmission_sig: transmissionSig,
          webhook_id: webhookId,
          webhook_event: webhookEvent,
        }),
      },
    );
    return result.verification_status === "SUCCESS";
  } catch (error) {
    console.error("[paypal/webhook-verify]", error);
    return false;
  }
}

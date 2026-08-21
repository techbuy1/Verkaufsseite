import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { fulfillPaidOrder } from "@/lib/fulfillOrder";
import {
  findOrderById,
  findOrderByStripeSessionId,
} from "@/lib/orderStore";
import { getSiteUrl, getStripe, getStripeWebhookSecret } from "@/lib/stripe";
import { recordFulfilledSession } from "@/lib/stripeOrders";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = getStripeWebhookSecret();

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      {
        message:
          "Webhook nicht konfiguriert. STRIPE_SECRET_KEY und STRIPE_WEBHOOK_SECRET setzen.",
      },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ message: "Stripe-Signatur fehlt." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("[stripe/webhook] signature", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Ungültige Stripe-Signatur.",
      },
      { status: 400 },
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      await recordFulfilledSession({
        sessionId: session.id,
        paymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null,
        customerEmail: session.customer_details?.email ?? null,
        amountTotal: session.amount_total,
        currency: session.currency,
        createdAt: new Date().toISOString(),
        rawEventId: event.id,
      });

      const orderId = session.metadata?.orderId;
      const order =
        (orderId ? await findOrderById(orderId) : null) ??
        (await findOrderByStripeSessionId(session.id));

      if (order && (session.payment_status === "paid" || session.status === "complete")) {
        const paidAmount =
          typeof session.amount_total === "number"
            ? session.amount_total / 100
            : order.total;

        await fulfillPaidOrder({
          orderId: order.id,
          paidAmount,
          stripeSessionId: session.id,
          stripePaymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id ?? undefined,
          providerCustomerEmail: session.customer_details?.email ?? null,
          requestOrigin: getSiteUrl(request),
        });
      }
    }
  } catch (error) {
    console.error("[stripe/webhook] handler", error);
    return NextResponse.json(
      { message: "Webhook-Verarbeitung fehlgeschlagen." },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}

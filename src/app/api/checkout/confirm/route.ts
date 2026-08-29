import { NextResponse } from "next/server";
import { fulfillPaidOrder } from "@/lib/fulfillOrder";
import {
  findOrderById,
  findOrderByStripeSessionId,
} from "@/lib/orderStore";
import { logMissingEnv, missingConfigMessage } from "@/lib/env";
import { getSiteUrl } from "@/lib/siteUrl";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    logMissingEnv("stripe/confirm", ["STRIPE_SECRET_KEY"]);
    return NextResponse.json(
      { message: missingConfigMessage("Stripe", ["STRIPE_SECRET_KEY"]) },
      { status: 503 },
    );
  }

  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json(
      { message: "session_id fehlt." },
      { status: 400 },
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json(
        {
          ok: false,
          message: "Zahlung noch nicht abgeschlossen.",
          paymentStatus: session.payment_status,
          status: session.status,
        },
        { status: 402 },
      );
    }

    const orderId = session.metadata?.orderId;
    let order =
      (orderId ? await findOrderById(orderId) : null) ??
      (await findOrderByStripeSessionId(session.id));

    if (order) {
      const paidAmount =
        typeof session.amount_total === "number"
          ? session.amount_total / 100
          : order.total;

      const fulfilled = await fulfillPaidOrder({
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
      order = fulfilled.order;
    }

    return NextResponse.json({
      ok: true,
      sessionId: session.id,
      paymentStatus: session.payment_status,
      customerEmail: order?.customerEmail ?? session.customer_details?.email ?? null,
      amountTotal: session.amount_total,
      currency: session.currency,
      orderId: order?.id ?? null,
      orderNumber: order?.orderNumber ?? null,
      items: order?.items ?? null,
      shippingCost: order?.shippingCost ?? null,
      subtotal: order?.subtotal ?? null,
      total: order?.total ?? null,
    });
  } catch (error) {
    console.error("[stripe/confirm]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Zahlung konnte nicht geprüft werden.",
      },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { verifyPayPalWebhook } from "@/lib/paypal";
import { fulfillPaidOrder } from "@/lib/fulfillOrder";
import {
  findOrderByPayPalCaptureId,
  findOrderByPayPalOrderId,
  updateOrder,
} from "@/lib/orderStore";
import { getSiteUrlFromEnv } from "@/lib/siteUrl";

export const runtime = "nodejs";

interface PayPalWebhookEvent {
  id?: string;
  event_type?: string;
  resource?: {
    id?: string;
    status?: string;
    amount?: { value?: string; currency_code?: string };
    supplementary_data?: {
      related_ids?: { order_id?: string };
    };
    custom_id?: string;
  };
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  const valid = await verifyPayPalWebhook({
    headers: request.headers,
    rawBody,
  });

  if (!valid) {
    return NextResponse.json(
      { message: "PayPal-Webhook-Signatur ungültig." },
      { status: 400 },
    );
  }

  let event: PayPalWebhookEvent;
  try {
    event = JSON.parse(rawBody) as PayPalWebhookEvent;
  } catch {
    return NextResponse.json({ message: "Ungültiger Payload." }, { status: 400 });
  }

  const eventType = event.event_type ?? "";
  const resource = event.resource ?? {};
  const captureId = resource.id;
  const paypalOrderId = resource.supplementary_data?.related_ids?.order_id;
  const amount = resource.amount?.value
    ? Number.parseFloat(resource.amount.value)
    : undefined;

  try {
    const order =
      (paypalOrderId
        ? await findOrderByPayPalOrderId(paypalOrderId)
        : null) ??
      (captureId ? await findOrderByPayPalCaptureId(captureId) : null);

    if (!order) {
      return NextResponse.json({ received: true, matched: false });
    }

    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      await fulfillPaidOrder({
        orderId: order.id,
        paidAmount: Number.isFinite(amount) ? (amount as number) : order.total,
        paypalCaptureId: captureId,
        requestOrigin: getSiteUrlFromEnv(),
      });
    } else if (eventType === "PAYMENT.CAPTURE.PENDING") {
      if (order.paymentStatus !== "paid") {
        await updateOrder(order.id, {
          paymentStatus: "pending_review",
          paypalCaptureId: captureId ?? order.paypalCaptureId,
        });
      }
    } else if (
      eventType === "PAYMENT.CAPTURE.DENIED" ||
      eventType === "PAYMENT.CAPTURE.DECLINED"
    ) {
      if (order.paymentStatus !== "paid") {
        await updateOrder(order.id, {
          paymentStatus: "denied",
          orderStatus: "cancelled",
          paypalCaptureId: captureId ?? order.paypalCaptureId,
        });
      }
    }

    return NextResponse.json({ received: true, matched: true });
  } catch (error) {
    console.error("[paypal/webhook]", error);
    return NextResponse.json(
      { message: "Webhook-Verarbeitung fehlgeschlagen." },
      { status: 500 },
    );
  }
}

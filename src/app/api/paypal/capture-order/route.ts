import { NextResponse } from "next/server";
import { logMissingEnv, missingConfigMessage } from "@/lib/env";
import {
  capturePayPalOrder,
  getPayPalOrder,
  isPayPalConfigured,
} from "@/lib/paypal";
import { fulfillPaidOrder } from "@/lib/fulfillOrder";
import {
  findOrderById,
  findOrderByPayPalOrderId,
  updateOrder,
} from "@/lib/orderStore";
import { getSiteUrl } from "@/lib/siteUrl";

export const runtime = "nodejs";

function amountsMatch(expected: number, actual: number | undefined): boolean {
  if (typeof actual !== "number" || !Number.isFinite(actual)) return false;
  return Math.abs(expected - actual) < 0.02;
}

export async function POST(request: Request) {
  if (!isPayPalConfigured()) {
    logMissingEnv("paypal/capture-order", [
      "NEXT_PUBLIC_PAYPAL_CLIENT_ID",
      "PAYPAL_CLIENT_SECRET",
    ]);
    return NextResponse.json(
      {
        message: missingConfigMessage("PayPal", [
          "NEXT_PUBLIC_PAYPAL_CLIENT_ID",
          "PAYPAL_CLIENT_SECRET",
        ]),
      },
      { status: 503 },
    );
  }

  let body: { paypalOrderId?: string; orderId?: string };
  try {
    body = (await request.json()) as { paypalOrderId?: string; orderId?: string };
  } catch {
    return NextResponse.json({ message: "Ungültige Anfrage." }, { status: 400 });
  }

  const paypalOrderId = body.paypalOrderId?.trim();
  if (!paypalOrderId) {
    return NextResponse.json(
      { message: "paypalOrderId fehlt." },
      { status: 400 },
    );
  }

  try {
    const order =
      (body.orderId ? await findOrderById(body.orderId) : null) ??
      (await findOrderByPayPalOrderId(paypalOrderId));

    if (!order) {
      return NextResponse.json(
        { message: "Interne Bestellung nicht gefunden." },
        { status: 404 },
      );
    }

    if (order.paymentStatus === "paid") {
      // Still run fulfill so a previously failed confirmation email can retry.
      const { order: paidOrder } = await fulfillPaidOrder({
        orderId: order.id,
        paidAmount: order.paidAmount ?? order.total,
        paypalCaptureId: order.paypalCaptureId,
        providerCustomerEmail: order.providerCustomerEmail,
        requestOrigin: getSiteUrl(request),
      });
      return NextResponse.json({
        ok: true,
        alreadyPaid: true,
        orderId: paidOrder?.id ?? order.id,
        orderNumber: paidOrder?.orderNumber ?? order.orderNumber,
        paymentStatus: paidOrder?.paymentStatus ?? order.paymentStatus,
        paidAmount: paidOrder?.paidAmount ?? order.paidAmount ?? order.total,
        currency: order.currency,
        customerEmail: paidOrder?.customerEmail ?? order.customerEmail,
      });
    }

    const remote = await getPayPalOrder(paypalOrderId);
    if (remote.id !== paypalOrderId) {
      return NextResponse.json(
        { message: "PayPal-Bestellung ungültig." },
        { status: 400 },
      );
    }

    const capture = await capturePayPalOrder(paypalOrderId);

    if (capture.status !== "COMPLETED") {
      await updateOrder(order.id, {
        paymentStatus:
          capture.status === "PENDING" ? "pending_review" : "failed",
        paypalCaptureId: capture.captureId,
      });
      return NextResponse.json(
        {
          ok: false,
          message:
            capture.status === "PENDING"
              ? "Die Zahlung ist noch ausstehend und wird geprüft."
              : "Die Zahlung konnte leider nicht abgeschlossen werden. Bitte versuche es erneut oder wähle eine andere Zahlungsmethode.",
          paymentStatus: capture.status,
        },
        { status: 402 },
      );
    }

    if (!amountsMatch(order.total, capture.paidAmount)) {
      await updateOrder(order.id, {
        paymentStatus: "pending_review",
        paypalCaptureId: capture.captureId,
        paidAmount: capture.paidAmount,
      });
      return NextResponse.json(
        {
          ok: false,
          message:
            "Der gezahlte Betrag weicht ab. Die Bestellung wird manuell geprüft.",
        },
        { status: 409 },
      );
    }

    if (capture.currency && capture.currency !== "EUR") {
      await updateOrder(order.id, {
        paymentStatus: "pending_review",
        paypalCaptureId: capture.captureId,
      });
      return NextResponse.json(
        { ok: false, message: "Ungültige Währung der Zahlung." },
        { status: 409 },
      );
    }

    const { order: paidOrder, newlyPaid } = await fulfillPaidOrder({
      orderId: order.id,
      paidAmount: capture.paidAmount ?? order.total,
      paypalCaptureId: capture.captureId,
      providerCustomerEmail: capture.payerEmail,
      requestOrigin: getSiteUrl(request),
    });

    return NextResponse.json({
      ok: true,
      newlyPaid,
      orderId: paidOrder?.id ?? order.id,
      orderNumber: paidOrder?.orderNumber ?? order.orderNumber,
      paymentProvider: "paypal",
      paymentStatus: "paid",
      paidAmount: capture.paidAmount ?? order.total,
      currency: "EUR",
      customerEmail: paidOrder?.customerEmail ?? order.customerEmail,
    });
  } catch (error) {
    console.error("[paypal/capture-order]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Die Zahlung konnte leider nicht abgeschlossen werden. Bitte versuche es erneut oder wähle eine andere Zahlungsmethode.",
      },
      { status: 500 },
    );
  }
}

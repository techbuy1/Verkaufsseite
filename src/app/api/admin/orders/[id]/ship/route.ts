import { NextResponse } from "next/server";
import { verifyAdminSessionFromRequest } from "@/lib/admin/auth";
import { sendShippingConfirmationEmail } from "@/lib/email";
import {
  findOrderById,
  updateOrder,
} from "@/lib/orderStore";
import {
  getTrackingUrl,
  isShippingCarrier,
} from "@/lib/shippingCarriers";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authed = await verifyAdminSessionFromRequest(request);
  if (!authed) {
    return NextResponse.json({ message: "Nicht autorisiert." }, { status: 401 });
  }

  const { id } = await context.params;
  let body: { carrier?: string; trackingNumber?: string };
  try {
    body = (await request.json()) as {
      carrier?: string;
      trackingNumber?: string;
    };
  } catch {
    return NextResponse.json({ message: "Ungültige Anfrage." }, { status: 400 });
  }

  const carrier = body.carrier?.trim() ?? "";
  const trackingNumber = body.trackingNumber?.trim() ?? "";

  if (!isShippingCarrier(carrier)) {
    return NextResponse.json(
      { message: "Ungültiger Versanddienstleister." },
      { status: 400 },
    );
  }
  if (!trackingNumber) {
    return NextResponse.json(
      { message: "Sendungsnummer ist erforderlich." },
      { status: 400 },
    );
  }

  const order = await findOrderById(id);
  if (!order) {
    return NextResponse.json({ message: "Bestellung nicht gefunden." }, { status: 404 });
  }
  if (order.paymentStatus !== "paid") {
    return NextResponse.json(
      { message: "Nur bezahlte Bestellungen können versendet werden." },
      { status: 400 },
    );
  }

  const alreadyShipped = order.orderStatus === "shipped" || Boolean(order.shippedAt);
  const trackingUrl = getTrackingUrl(carrier, trackingNumber);

  const updated = await updateOrder(order.id, {
    trackingCarrier: carrier,
    trackingNumber,
    trackingUrl,
    orderStatus: "shipped",
    shippedAt: order.shippedAt ?? new Date().toISOString(),
  });

  if (!updated) {
    return NextResponse.json({ message: "Update fehlgeschlagen." }, { status: 500 });
  }

  let emailSent = false;
  if (!updated.shippingEmailSentAt) {
    const emailResult = await sendShippingConfirmationEmail({ order: updated });
    if (emailResult.ok) {
      await updateOrder(updated.id, {
        shippingEmailSentAt: new Date().toISOString(),
      });
      emailSent = true;
    } else {
      console.error("[admin/ship] email", emailResult.error);
    }
  }

  return NextResponse.json({
    ok: true,
    alreadyShipped,
    emailSent,
    order: updated,
  });
}

import { NextResponse } from "next/server";
import { verifyAdminSessionFromRequest } from "@/lib/admin/auth";
import { sendShippingConfirmationEmail } from "@/lib/email";
import { findOrderById, updateOrder } from "@/lib/orderStore";
import { readServerProducts } from "@/lib/serverProductCatalog";
import { getTrackingUrl, isShippingCarrier } from "@/lib/shippingCarriers";
import { getShippingLines, validateOrderForShipping } from "@/lib/shipping";

export const runtime = "nodejs";

/**
 * „Versanddaten an Kunden senden": übernimmt Versanddienstleister +
 * Sendungsnummer, setzt die Bestellung auf „Versendet" und schickt die
 * Versandbestätigung (inkl. der bereits zugeordneten IMEI/Seriennummer).
 *
 * Body: { carrier, trackingNumber, resend? }
 * `resend: true` schickt die Mail bewusst erneut, auch wenn sie schon lief.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authed = await verifyAdminSessionFromRequest(request);
  if (!authed) {
    return NextResponse.json({ message: "Nicht autorisiert." }, { status: 401 });
  }

  const { id } = await context.params;

  let body: { carrier?: string; trackingNumber?: string; resend?: boolean };
  try {
    body = (await request.json()) as {
      carrier?: string;
      trackingNumber?: string;
      resend?: boolean;
    };
  } catch {
    return NextResponse.json({ message: "Ungültige Anfrage." }, { status: 400 });
  }

  const order = await findOrderById(id);
  if (!order) {
    return NextResponse.json(
      { message: "Bestellung nicht gefunden." },
      { status: 404 },
    );
  }

  const carrier = body.carrier?.trim() ?? "";
  const trackingNumber = body.trackingNumber?.trim() ?? "";

  const { products } = await readServerProducts();
  const validation = validateOrderForShipping(order, products, {
    carrier,
    trackingNumber,
  });
  if (!validation.ok) {
    return NextResponse.json(
      { ok: false, message: validation.errors[0], errors: validation.errors },
      { status: 400 },
    );
  }

  // Ab hier ist carrier ein gültiger ShippingCarrier (durch die Validierung).
  const safeCarrier = isShippingCarrier(carrier) ? carrier : "Andere";
  const trackingUrl = getTrackingUrl(safeCarrier, trackingNumber);
  const alreadyEmailed = Boolean(order.shippingEmailSentAt);
  const wantsResend = body.resend === true;

  let updated: Awaited<ReturnType<typeof updateOrder>>;
  try {
    updated = await updateOrder(order.id, {
      trackingCarrier: safeCarrier,
      trackingNumber,
      trackingUrl,
      orderStatus: "shipped",
      shippedAt: order.shippedAt ?? new Date().toISOString(),
    });
  } catch (error) {
    console.error("[admin/ship] persist failed", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      error,
    });
    return NextResponse.json(
      {
        ok: false,
        message:
          "Versanddaten konnten technisch nicht gespeichert werden. Bitte erneut versuchen.",
      },
      { status: 500 },
    );
  }

  if (!updated) {
    return NextResponse.json(
      { ok: false, message: "Versanddaten konnten nicht gespeichert werden." },
      { status: 500 },
    );
  }

  // Nicht doppelt senden: nur wenn noch nie gesendet ODER bewusster Resend.
  if (alreadyEmailed && !wantsResend) {
    return NextResponse.json({
      ok: true,
      emailSent: false,
      alreadyEmailed: true,
      shippingEmailSentAt: updated.shippingEmailSentAt,
      order: updated,
      message: `Versandbestätigung wurde bereits am ${new Date(
        updated.shippingEmailSentAt as string,
      ).toLocaleString("de-DE")} versendet.`,
    });
  }

  const lines = getShippingLines(updated, products);
  const emailResult = await sendShippingConfirmationEmail({ order: updated, lines });

  if (!emailResult.ok) {
    console.error("[admin/ship] email failed", {
      orderId: updated.id,
      orderNumber: updated.orderNumber,
      error: emailResult.error,
    });
    return NextResponse.json(
      {
        ok: false,
        message:
          "Versanddaten wurden gespeichert, aber die E-Mail konnte nicht gesendet werden. Bitte erneut versuchen.",
        order: updated,
      },
      { status: 502 },
    );
  }

  const sentAt = new Date().toISOString();
  const finalOrder =
    (await updateOrder(updated.id, { shippingEmailSentAt: sentAt })) ?? updated;

  return NextResponse.json({
    ok: true,
    emailSent: true,
    resent: alreadyEmailed && wantsResend,
    shippingEmailSentAt: sentAt,
    order: finalOrder,
  });
}

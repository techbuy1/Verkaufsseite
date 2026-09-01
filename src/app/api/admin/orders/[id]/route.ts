import { NextResponse } from "next/server";
import { verifyAdminSessionFromCookieHeader } from "@/lib/admin/auth";
import { getInvoiceReadiness } from "@/lib/invoiceValidation";
import { findOrderById, normalizeOrderItems } from "@/lib/orderStore";
import { readServerProducts } from "@/lib/serverProductCatalog";
import {
  orderItemRequiresDeviceId,
  validateOrderForShipping,
} from "@/lib/shipping";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const ok = verifyAdminSessionFromCookieHeader(request.headers.get("cookie"));
  if (!ok) {
    return NextResponse.json({ message: "Nicht autorisiert." }, { status: 401 });
  }

  const { id } = await context.params;
  const order = await findOrderById(id);
  if (!order) {
    return NextResponse.json({ message: "Bestellung nicht gefunden." }, { status: 404 });
  }

  const { products } = await readServerProducts();

  // Pro Position markieren, ob eine Gerätekennung (IMEI/Seriennummer) nötig ist.
  const items = normalizeOrderItems(order.items).map((item) => ({
    ...item,
    requiresDeviceId: orderItemRequiresDeviceId(item, products),
  }));

  const readiness = getInvoiceReadiness(order, products);
  const shippingReadiness = validateOrderForShipping(order, products, {
    carrier: order.trackingCarrier ?? "DHL",
    trackingNumber: order.trackingNumber ?? "",
  });

  return NextResponse.json({
    ok: true,
    order: { ...order, items },
    invoiceReady: readiness.ok,
    invoiceMissing: readiness.missing,
    shippingBlockers: shippingReadiness.errors.filter(
      (message) =>
        // „Sendungsnummer eintragen" ist kein Blocker für die Anzeige –
        // das steuert der Button selbst.
        !message.startsWith("Bitte zuerst eine Sendungsnummer") &&
        !message.startsWith("Bitte einen gültigen Versanddienstleister"),
    ),
  });
}

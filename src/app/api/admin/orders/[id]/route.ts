import { NextResponse } from "next/server";
import {
  verifyAdminSessionFromCookieHeader,
  verifyAdminSessionFromRequest,
} from "@/lib/admin/auth";
import { getInvoiceReadiness } from "@/lib/invoiceValidation";
import {
  deleteOrder,
  findOrderById,
  normalizeOrderItems,
  setOrderArchived,
} from "@/lib/orderStore";
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

/** Bestellung archivieren oder wieder aktiv setzen. Body: { archived: boolean } */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await verifyAdminSessionFromRequest(request))) {
    return NextResponse.json({ message: "Nicht autorisiert." }, { status: 401 });
  }

  const { id } = await context.params;

  let body: { archived?: boolean };
  try {
    body = (await request.json()) as { archived?: boolean };
  } catch {
    return NextResponse.json({ message: "Ungültige Anfrage." }, { status: 400 });
  }

  try {
    const updated = await setOrderArchived(id, body.archived === true);
    if (!updated) {
      return NextResponse.json(
        { message: "Bestellung nicht gefunden." },
        { status: 404 },
      );
    }
    return NextResponse.json({
      ok: true,
      id: updated.id,
      archivedAt: updated.archivedAt ?? null,
    });
  } catch (error) {
    console.error("[admin/orders] archive failed", { id, error });
    return NextResponse.json(
      {
        message:
          "Archivierung fehlgeschlagen. Bitte die Datenbank-Migration ausführen (npm run db:migrate-orders).",
      },
      { status: 500 },
    );
  }
}

/** Bestellung endgültig löschen. */
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await verifyAdminSessionFromRequest(request))) {
    return NextResponse.json({ message: "Nicht autorisiert." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const deleted = await deleteOrder(id);
    if (!deleted) {
      return NextResponse.json(
        { message: "Bestellung nicht gefunden." },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/orders] delete failed", { id, error });
    return NextResponse.json(
      { message: "Löschen fehlgeschlagen. Bitte erneut versuchen." },
      { status: 500 },
    );
  }
}

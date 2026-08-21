import { NextResponse } from "next/server";
import { verifyAdminSessionFromCookieHeader } from "@/lib/admin/auth";
import { getInvoiceReadiness } from "@/lib/invoiceValidation";
import { findOrderById } from "@/lib/orderStore";

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

  const readiness = getInvoiceReadiness(order);

  return NextResponse.json({
    ok: true,
    order,
    invoiceReady: readiness.ok,
    invoiceMissing: readiness.missing,
  });
}

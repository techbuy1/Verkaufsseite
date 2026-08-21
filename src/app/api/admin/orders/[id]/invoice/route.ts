import { NextResponse } from "next/server";
import { verifyAdminSessionFromRequest } from "@/lib/admin/auth";
import { buildInvoiceDownloadUrl, sendInvoiceEmail } from "@/lib/email";
import { createInvoiceForOrder, loadExistingInvoice } from "@/lib/invoice";
import { getInvoiceReadiness } from "@/lib/invoiceValidation";
import { findOrderById, updateOrder } from "@/lib/orderStore";
import { getSiteUrl } from "@/lib/stripe";

export const runtime = "nodejs";

/** Manual invoice creation after IMEI + tax assignment. */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await verifyAdminSessionFromRequest(request))) {
    return NextResponse.json({ message: "Nicht autorisiert." }, { status: 401 });
  }

  const { id } = await context.params;
  const order = await findOrderById(id);
  if (!order) {
    return NextResponse.json({ message: "Bestellung nicht gefunden." }, { status: 404 });
  }

  const readiness = getInvoiceReadiness(order);
  if (!readiness.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: "Rechnung kann noch nicht erstellt werden.",
        missing: readiness.missing,
      },
      { status: 400 },
    );
  }

  try {
    const invoice = await createInvoiceForOrder(order);
    const downloadUrl = invoice.order.invoiceAccessToken
      ? buildInvoiceDownloadUrl(
          getSiteUrl(request),
          invoice.order.invoiceAccessToken,
        )
      : null;

    return NextResponse.json({
      ok: true,
      newlyCreated: invoice.newlyCreated,
      invoiceNumber: invoice.invoiceNumber,
      downloadUrl,
      order: invoice.order,
    });
  } catch (error) {
    console.error("[admin/invoice]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Rechnung konnte nicht erstellt werden.",
      },
      { status: 500 },
    );
  }
}

/** Send invoice PDF to customer email. */
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await verifyAdminSessionFromRequest(request))) {
    return NextResponse.json({ message: "Nicht autorisiert." }, { status: 401 });
  }

  const { id } = await context.params;
  const order = await findOrderById(id);
  if (!order) {
    return NextResponse.json({ message: "Bestellung nicht gefunden." }, { status: 404 });
  }

  const invoice = await loadExistingInvoice(order);
  if (!invoice) {
    return NextResponse.json(
      { message: "Bitte zuerst die Rechnung erstellen." },
      { status: 400 },
    );
  }

  const downloadUrl = order.invoiceAccessToken
    ? buildInvoiceDownloadUrl(getSiteUrl(request), order.invoiceAccessToken)
    : null;

  const result = await sendInvoiceEmail({
    order,
    invoiceDownloadUrl: downloadUrl,
    invoicePdf: {
      filename: invoice.filename,
      content: Buffer.from(invoice.pdfBytes),
    },
  });

  if (!result.ok) {
    return NextResponse.json(
      { message: result.error ?? "E-Mail-Versand fehlgeschlagen." },
      { status: 502 },
    );
  }

  await updateOrder(order.id, {
    invoiceEmailSentAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}

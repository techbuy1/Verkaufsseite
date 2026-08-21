import { NextResponse } from "next/server";
import { loadExistingInvoice } from "@/lib/invoice";
import { findOrderByInvoiceToken } from "@/lib/orderStore";

export const runtime = "nodejs";

/** Secure invoice download — only after invoice was created manually. */
export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const order = await findOrderByInvoiceToken(token);

  if (!order || order.paymentStatus !== "paid") {
    return NextResponse.json({ message: "Rechnung nicht gefunden." }, { status: 404 });
  }

  const invoice = await loadExistingInvoice(order);
  if (!invoice) {
    return NextResponse.json(
      { message: "Rechnung wurde noch nicht erstellt." },
      { status: 404 },
    );
  }

  return new NextResponse(Buffer.from(invoice.pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

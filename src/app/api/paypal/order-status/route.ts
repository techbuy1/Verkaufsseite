import { NextResponse } from "next/server";
import { findOrderById } from "@/lib/orderStore";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("order_id")?.trim();

  if (!orderId) {
    return NextResponse.json({ message: "order_id fehlt." }, { status: 400 });
  }

  const order = await findOrderById(orderId);
  if (!order) {
    return NextResponse.json(
      { message: "Bestellung nicht gefunden." },
      { status: 404 },
    );
  }

  if (order.paymentProvider !== "paypal") {
    return NextResponse.json(
      { message: "Keine PayPal-Bestellung." },
      { status: 400 },
    );
  }

  if (order.paymentStatus !== "paid") {
    return NextResponse.json(
      {
        ok: false,
        message:
          order.paymentStatus === "pending_review"
            ? "Die Zahlung ist noch ausstehend und wird geprüft."
            : "Die Zahlung ist noch nicht bestätigt.",
        paymentStatus: order.paymentStatus,
      },
      { status: 402 },
    );
  }

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    orderNumber: order.orderNumber,
    paymentProvider: "paypal",
    paymentStatus: order.paymentStatus,
    paidAmount: order.paidAmount ?? order.total,
    currency: order.currency,
    customerEmail: order.customerEmail,
    customerFirstName: order.customerFirstName,
    items: order.items,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    total: order.total,
  });
}

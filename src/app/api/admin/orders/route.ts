import { NextResponse } from "next/server";
import { verifyAdminSessionFromCookieHeader } from "@/lib/admin/auth";
import { listOrders } from "@/lib/orderStore";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ok = verifyAdminSessionFromCookieHeader(request.headers.get("cookie"));
  if (!ok) {
    return NextResponse.json({ message: "Nicht autorisiert." }, { status: 401 });
  }

  const orders = await listOrders();
  return NextResponse.json({
    ok: true,
    orders: orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      customerFirstName: order.customerFirstName,
      customerLastName: order.customerLastName,
      customerEmail: order.customerEmail,
      total: order.total,
      currency: order.currency,
      paymentProvider: order.paymentProvider,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      trackingNumber: order.trackingNumber ?? null,
      shippedAt: order.shippedAt ?? null,
      archivedAt: order.archivedAt ?? null,
      itemCount: order.items.length,
    })),
  });
}

"use client";

import Link from "next/link";
import { DEMO_ORDERS } from "@/data/admin/demoData";
import { formatCurrency, formatDate } from "@/types/admin";
import { OrderStatusBadge, PaymentStatusBadge } from "./StatusBadge";

const statusLabels: Record<string, string> = {
  pending: "Ausstehend",
  processing: "In Bearbeitung",
  shipped: "Versendet",
  delivered: "Zugestellt",
};

export function OrderTable() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-[#1d1d1f]">Bestellungen</h1>
        <p className="mt-1 text-[14px] text-[#6e6e73]">Demo-Bestellungen</p>
      </div>

      <div className="overflow-hidden rounded-[18px] border border-[#d2d2d7]/40 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-[14px]">
            <thead>
              <tr className="border-b border-[#d2d2d7]/40 bg-[#f5f5f7]/50 text-[12px] uppercase tracking-wider text-[#6e6e73]">
                <th className="px-4 py-3 font-medium">Bestellnummer</th>
                <th className="px-4 py-3 font-medium">Kunde</th>
                <th className="px-4 py-3 font-medium">Datum</th>
                <th className="px-4 py-3 font-medium">Produkte</th>
                <th className="px-4 py-3 font-medium">Gesamt</th>
                <th className="px-4 py-3 font-medium">Zahlung</th>
                <th className="px-4 py-3 font-medium">Versand</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_ORDERS.map((order) => (
                <tr key={order.id} className="border-b border-[#d2d2d7]/30 last:border-0 hover:bg-[#f5f5f7]/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-accent hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-[12px] text-[#6e6e73]">{order.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">{order.items.length}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-3">
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </td>
                  <td className="px-4 py-3 text-[13px]">
                    {statusLabels[order.shippingStatus] ?? order.shippingStatus}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

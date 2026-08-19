"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { DEMO_ORDERS } from "@/data/admin/demoData";
import { formatCurrency, formatDate } from "@/types/admin";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/StatusBadge";

export function OrderDetailContent({ orderId }: { orderId: string }) {
  const order = DEMO_ORDERS.find((o) => o.id === orderId);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-[900px] space-y-6">
      <Link href="/admin/orders" className="text-[14px] text-accent hover:underline">
        ← Bestellungen
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">{order.orderNumber}</h1>
          <p className="mt-1 text-[14px] text-[#6e6e73]">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard title="Kundendaten">
          <p className="font-medium">{order.customerName}</p>
          <p className="text-[14px] text-[#6e6e73]">{order.customerEmail}</p>
        </InfoCard>
        <InfoCard title="Lieferadresse">
          <p className="text-[14px]">{order.shippingAddress}</p>
        </InfoCard>
      </div>

      <div className="overflow-hidden rounded-[18px] border border-[#d2d2d7]/40 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <table className="w-full text-left text-[14px]">
          <thead>
            <tr className="border-b border-[#d2d2d7]/40 bg-[#f5f5f7]/50 text-[12px] uppercase text-[#6e6e73]">
              <th className="px-4 py-3">Produkt</th>
              <th className="px-4 py-3">Menge</th>
              <th className="px-4 py-3">Einzelpreis</th>
              <th className="px-4 py-3">Summe</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-[#d2d2d7]/30 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{item.productName}</p>
                  {item.variantLabel && (
                    <p className="text-[12px] text-[#6e6e73]">{item.variantLabel}</p>
                  )}
                </td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">{formatCurrency(item.unitPrice)}</td>
                <td className="px-4 py-3 font-medium">
                  {formatCurrency(item.unitPrice * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-[#d2d2d7]/40 bg-[#f5f5f7]/30 px-4 py-4 text-right">
          <p className="text-[14px] text-[#6e6e73]">Zwischensumme: {formatCurrency(order.subtotal)}</p>
          <p className="text-[14px] text-[#6e6e73]">Versand: {formatCurrency(order.shipping)}</p>
          <p className="mt-1 text-[18px] font-bold">{formatCurrency(order.total)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="rounded-full bg-accent px-5 py-2.5 text-[14px] font-medium text-white hover:bg-accent-hover">
          Als versendet markieren
        </button>
        <button className="rounded-full border border-[#d2d2d7] px-5 py-2.5 text-[14px] font-medium hover:bg-white">
          Bestellung stornieren
        </button>
        <button
          className="rounded-full border border-red-200 px-5 py-2.5 text-[14px] font-medium text-red-600 hover:bg-red-50"
          title="Stripe-Rückerstattung — Backend folgt"
        >
          Rückerstattung
        </button>
      </div>
      <p className="text-[12px] text-[#6e6e73]">
        Rückerstattung und Versandaktionen sind Demo-UI — Stripe-Integration folgt serverseitig.
      </p>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[18px] border border-[#d2d2d7]/40 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-[#6e6e73]">
        {title}
      </h2>
      {children}
    </div>
  );
}

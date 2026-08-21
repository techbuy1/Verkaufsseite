"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OrderStatusBadge, PaymentStatusBadge } from "./StatusBadge";

interface AdminOrderRow {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  total: number;
  paymentProvider: string;
  paymentStatus: string;
  orderStatus: string;
  trackingNumber: string | null;
  itemCount: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function OrderTable() {
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/admin/orders");
        const data = (await response.json()) as {
          ok?: boolean;
          orders?: AdminOrderRow[];
          message?: string;
        };
        if (!response.ok) {
          throw new Error(data.message ?? "Bestellungen konnten nicht geladen werden.");
        }
        if (!cancelled) {
          setOrders(data.orders ?? []);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Fehler beim Laden.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-[#1d1d1f]">Bestellungen</h1>
        <p className="mt-1 text-[14px] text-[#6e6e73]">
          Bezahlte und ausstehende Bestellungen aus Stripe und PayPal
        </p>
      </div>

      {loading && <p className="text-[14px] text-[#6e6e73]">Laden…</p>}
      {error && <p className="text-[14px] text-red-600">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p className="rounded-[16px] border border-[#d2d2d7]/40 bg-white p-6 text-[14px] text-[#6e6e73]">
          Noch keine Bestellungen vorhanden.
        </p>
      )}

      {!loading && orders.length > 0 && (
        <div className="overflow-hidden rounded-[18px] border border-[#d2d2d7]/40 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-[14px]">
              <thead>
                <tr className="border-b border-[#d2d2d7]/40 bg-[#f5f5f7]/50 text-[12px] uppercase tracking-wider text-[#6e6e73]">
                  <th className="px-4 py-3 font-medium">Bestellnummer</th>
                  <th className="px-4 py-3 font-medium">Datum</th>
                  <th className="px-4 py-3 font-medium">Kunde</th>
                  <th className="px-4 py-3 font-medium">Betrag</th>
                  <th className="px-4 py-3 font-medium">Zahlung</th>
                  <th className="px-4 py-3 font-medium">Zahlungsstatus</th>
                  <th className="px-4 py-3 font-medium">Bestellstatus</th>
                  <th className="px-4 py-3 font-medium">Versand</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[#d2d2d7]/30 last:border-0 hover:bg-[#f5f5f7]/40"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-accent hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {order.customerFirstName} {order.customerLastName}
                      </p>
                      <p className="text-[12px] text-[#6e6e73]">{order.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-4 py-3 capitalize">{order.paymentProvider}</td>
                    <td className="px-4 py-3">
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.orderStatus} />
                    </td>
                    <td className="px-4 py-3 text-[13px]">
                      {order.trackingNumber
                        ? order.trackingNumber
                        : order.orderStatus === "shipped"
                          ? "Versendet"
                          : "Versand ausstehend"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

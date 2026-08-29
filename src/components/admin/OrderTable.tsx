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
        <h1 className="admin-page-title">Bestellungen</h1>
        <p className="admin-page-subtitle">
          Bezahlte und ausstehende Bestellungen aus Stripe und PayPal
        </p>
      </div>

      {loading && <p className="text-[14px] text-text-secondary">Laden…</p>}
      {error && <div className="admin-alert-error">{error}</div>}

      {!loading && !error && orders.length === 0 && (
        <div className="admin-panel p-6 text-[14px] text-text-secondary">
          Noch keine Bestellungen vorhanden.
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="admin-table-wrap">
          <div className="admin-table-scroll">
            <table className="admin-table min-w-[1000px]">
              <thead>
                <tr>
                  <th>Bestellnummer</th>
                  <th>Datum</th>
                  <th>Kunde</th>
                  <th>Betrag</th>
                  <th>Zahlung</th>
                  <th>Zahlungsstatus</th>
                  <th>Bestellstatus</th>
                  <th>Versand</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-accent hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      <p className="font-medium">
                        {order.customerFirstName} {order.customerLastName}
                      </p>
                      <p className="text-[12px] text-text-secondary">{order.customerEmail}</p>
                    </td>
                    <td className="font-semibold">{formatCurrency(order.total)}</td>
                    <td className="capitalize">{order.paymentProvider}</td>
                    <td>
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </td>
                    <td>
                      <OrderStatusBadge status={order.orderStatus} />
                    </td>
                    <td className="text-[13px]">
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

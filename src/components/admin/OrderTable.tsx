"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  archivedAt: string | null;
  itemCount: number;
}

type View = "active" | "archived";

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
  const [view, setView] = useState<View>("active");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
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
      setOrders(data.orders ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Laden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Fortlaufende Nummer: älteste Bestellung = 1, stabil und unabhängig vom Filter.
  const sequenceById = useMemo(() => {
    const map = new Map<string, number>();
    [...orders]
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
      .forEach((order, index) => map.set(order.id, index + 1));
    return map;
  }, [orders]);

  const activeCount = useMemo(
    () => orders.filter((order) => !order.archivedAt).length,
    [orders],
  );
  const archivedCount = orders.length - activeCount;

  const visibleOrders = useMemo(
    () =>
      orders.filter((order) =>
        view === "archived" ? Boolean(order.archivedAt) : !order.archivedAt,
      ),
    [orders, view],
  );

  async function archiveOrder(id: string, archived: boolean) {
    setBusyId(id);
    setActionError(null);
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived }),
      });
      const data = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? "Aktion fehlgeschlagen.");
      }
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Aktion fehlgeschlagen.");
    } finally {
      setBusyId(null);
    }
  }

  async function removeOrder(order: AdminOrderRow) {
    if (
      !window.confirm(
        `Bestellung ${order.orderNumber} endgültig löschen? Das kann nicht rückgängig gemacht werden.`,
      )
    ) {
      return;
    }
    setBusyId(order.id);
    setActionError(null);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? "Löschen fehlgeschlagen.");
      }
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Löschen fehlgeschlagen.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="admin-page-title">Bestellungen</h1>
        <p className="admin-page-subtitle">
          Alle Bestellungen aus dem Shop – Handys, Hüllen, Folien und Zubehör –
          mit fortlaufender Nummer.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setView("active")}
          className={`rounded-full border px-4 py-2 text-[13px] font-medium ${
            view === "active"
              ? "border-accent bg-accent text-white"
              : "border-[#d2d2d7] bg-white text-[#1d1d1f]"
          }`}
        >
          Aktiv ({activeCount})
        </button>
        <button
          type="button"
          onClick={() => setView("archived")}
          className={`rounded-full border px-4 py-2 text-[13px] font-medium ${
            view === "archived"
              ? "border-accent bg-accent text-white"
              : "border-[#d2d2d7] bg-white text-[#1d1d1f]"
          }`}
        >
          Archiviert ({archivedCount})
        </button>
      </div>

      {loading && <p className="text-[14px] text-text-secondary">Laden…</p>}
      {error && <div className="admin-alert-error">{error}</div>}
      {actionError && <div className="admin-alert-error">{actionError}</div>}

      {!loading && !error && visibleOrders.length === 0 && (
        <div className="admin-panel p-6 text-[14px] text-text-secondary">
          {view === "archived"
            ? "Keine archivierten Bestellungen."
            : "Noch keine Bestellungen vorhanden."}
        </div>
      )}

      {!loading && visibleOrders.length > 0 && (
        <div className="admin-table-wrap">
          <div className="admin-table-scroll">
            <table className="admin-table min-w-[1100px]">
              <thead>
                <tr>
                  <th>Nr.</th>
                  <th>Bestellnummer</th>
                  <th>Datum</th>
                  <th>Kunde</th>
                  <th>Betrag</th>
                  <th>Zahlung</th>
                  <th>Zahlungsstatus</th>
                  <th>Bestellstatus</th>
                  <th>Versand</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {visibleOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-semibold text-text-secondary">
                      {sequenceById.get(order.id)}
                    </td>
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
                    <td className="whitespace-nowrap text-[13px]">
                      <button
                        type="button"
                        disabled={busyId === order.id}
                        onClick={() =>
                          void archiveOrder(order.id, !order.archivedAt)
                        }
                        className="mr-3 text-accent hover:underline disabled:opacity-50"
                      >
                        {order.archivedAt ? "Wiederherstellen" : "Archivieren"}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === order.id}
                        onClick={() => void removeOrder(order)}
                        className="text-red-600 hover:underline disabled:opacity-50"
                      >
                        Löschen
                      </button>
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

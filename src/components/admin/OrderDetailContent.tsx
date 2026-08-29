"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/StatusBadge";
import {
  SHIPPING_CARRIERS,
  TAX_MODE_OPTIONS,
  type ShippingCarrier,
  type TaxMode,
} from "@/lib/companySettings";

interface OrderDevice {
  id: string;
  imei?: string | null;
  serialNumber?: string | null;
  taxMode?: TaxMode | null;
  purchasePrice?: number | null;
}

interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  storage?: string;
  color?: string;
  conditionLabel?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  devices: OrderDevice[];
  compatibleDeviceLabel?: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone?: string;
  shippingStreet: string;
  shippingHouseNumber: string;
  shippingAddressLine2?: string;
  shippingPostalCode: string;
  shippingCity: string;
  shippingCountry: string;
  items: OrderItem[];
  accessoryUpsells?: Array<{
    cartLineId: string;
    targetProductName: string;
    mode: "singles" | "bundle";
    bundleType?: string;
    bundleTitle?: string;
    displayName: string;
    lineTotal: number;
    items: Array<{
      type: string;
      variant?: string;
      compatibleProduct?: string;
      label: string;
    }>;
  }>;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  paymentProvider: string;
  paymentStatus: string;
  orderStatus: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  invoiceNumber?: string;
  invoiceAccessToken?: string;
  invoiceEmailSentAt?: string;
  trackingNumber?: string;
  trackingCarrier?: ShippingCarrier;
  trackingUrl?: string | null;
  shippedAt?: string;
  shippingEmailSentAt?: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function OrderDetailContent({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [invoiceMissing, setInvoiceMissing] = useState<string[]>([]);
  const [invoiceReady, setInvoiceReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carrier, setCarrier] = useState<ShippingCarrier>("DHL");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingBusy, setShippingBusy] = useState(false);
  const [shippingMessage, setShippingMessage] = useState<string | null>(null);
  const [deviceBusyKey, setDeviceBusyKey] = useState<string | null>(null);
  const [deviceMessage, setDeviceMessage] = useState<string | null>(null);
  const [invoiceBusy, setInvoiceBusy] = useState(false);
  const [invoiceMessage, setInvoiceMessage] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`);
      const data = (await response.json()) as {
        ok?: boolean;
        order?: OrderDetail;
        invoiceReady?: boolean;
        invoiceMissing?: string[];
        message?: string;
      };
      if (!response.ok || !data.order) {
        throw new Error(data.message ?? "Bestellung nicht gefunden.");
      }
      setOrder(data.order);
      setInvoiceReady(Boolean(data.invoiceReady));
      setInvoiceMissing(data.invoiceMissing ?? []);
      if (data.order.trackingCarrier) setCarrier(data.order.trackingCarrier);
      if (data.order.trackingNumber) setTrackingNumber(data.order.trackingNumber);
      if (data.order.invoiceAccessToken) {
        setDownloadUrl(`/api/invoices/${data.order.invoiceAccessToken}`);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Laden.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  function updateLocalDevice(
    itemIndex: number,
    deviceId: string,
    patch: Partial<OrderDevice>,
  ) {
    setOrder((current) => {
      if (!current) return current;
      const items = current.items.map((item, index) => {
        if (index !== itemIndex) return item;
        return {
          ...item,
          devices: item.devices.map((device) =>
            device.id === deviceId ? { ...device, ...patch } : device,
          ),
        };
      });
      return { ...current, items };
    });
  }

  async function saveDevice(itemIndex: number, device: OrderDevice) {
    if (!order) return;
    const item = order.items[itemIndex];
    if (!item) return;
    const key = `${itemIndex}-${device.id}`;
    setDeviceBusyKey(key);
    setDeviceMessage(null);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/devices`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              productId: item.productId,
              itemIndex,
              devices: [
                {
                  id: device.id,
                  imei: device.imei ?? null,
                  serialNumber: device.serialNumber ?? null,
                  taxMode: device.taxMode ?? null,
                  purchasePrice:
                    typeof device.purchasePrice === "number"
                      ? device.purchasePrice
                      : null,
                },
              ],
            },
          ],
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
      };
      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? "Speichern fehlgeschlagen.");
      }
      setDeviceMessage("Gerätedaten gespeichert.");
      await load();
    } catch (err) {
      setDeviceMessage(
        err instanceof Error ? err.message : "Speichern fehlgeschlagen.",
      );
    } finally {
      setDeviceBusyKey(null);
    }
  }

  async function createInvoice() {
    setInvoiceBusy(true);
    setInvoiceMessage(null);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/invoice`, {
        method: "POST",
      });
      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
        missing?: string[];
        downloadUrl?: string;
        invoiceNumber?: string;
      };
      if (!response.ok || !data.ok) {
        if (data.missing?.length) {
          setInvoiceMissing(data.missing);
        }
        throw new Error(data.message ?? "Rechnung konnte nicht erstellt werden.");
      }
      setInvoiceMessage(`Rechnung ${data.invoiceNumber} erstellt.`);
      if (data.downloadUrl) setDownloadUrl(data.downloadUrl);
      await load();
    } catch (err) {
      setInvoiceMessage(
        err instanceof Error ? err.message : "Rechnung fehlgeschlagen.",
      );
    } finally {
      setInvoiceBusy(false);
    }
  }

  async function sendInvoice() {
    setInvoiceBusy(true);
    setInvoiceMessage(null);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/invoice`, {
        method: "PUT",
      });
      const data = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? "Rechnungsmail fehlgeschlagen.");
      }
      setInvoiceMessage("Rechnung per E-Mail gesendet.");
      await load();
    } catch (err) {
      setInvoiceMessage(
        err instanceof Error ? err.message : "Rechnungsmail fehlgeschlagen.",
      );
    } finally {
      setInvoiceBusy(false);
    }
  }

  async function markShipped() {
    setShippingBusy(true);
    setShippingMessage(null);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/ship`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carrier, trackingNumber }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
        emailSent?: boolean;
        alreadyShipped?: boolean;
      };
      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? "Versand konnte nicht gespeichert werden.");
      }
      setShippingMessage(
        data.emailSent
          ? "Als versendet markiert und Versandmail gesendet."
          : data.alreadyShipped
            ? "Versanddaten aktualisiert (Mail wurde zuvor bereits gesendet)."
            : "Als versendet markiert.",
      );
      await load();
    } catch (err) {
      setShippingMessage(
        err instanceof Error ? err.message : "Versand konnte nicht gespeichert werden.",
      );
    } finally {
      setShippingBusy(false);
    }
  }

  if (loading) {
    return <p className="text-[14px] text-[#6e6e73]">Laden…</p>;
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <p className="text-[14px] text-red-600">{error ?? "Nicht gefunden"}</p>
        <Link href="/admin/orders" className="text-accent hover:underline">
          ← Zurück zur Liste
        </Link>
      </div>
    );
  }

  const invoiceLocked = Boolean(order.invoiceNumber);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/orders" className="text-[13px] text-[#6e6e73] hover:text-[#1d1d1f]">
            ← Bestellungen
          </Link>
          <h1 className="mt-2 text-[28px] font-bold tracking-tight text-[#1d1d1f]">
            {order.orderNumber}
          </h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <PaymentStatusBadge status={order.paymentStatus} />
            <OrderStatusBadge status={order.orderStatus} />
          </div>
        </div>
        <p className="text-[13px] text-[#6e6e73]">
          {new Date(order.createdAt).toLocaleString("de-DE")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-[18px] border border-[#d2d2d7]/40 bg-white p-5">
          <h2 className="text-[16px] font-semibold">Kunde</h2>
          <p className="mt-2 text-[14px]">
            {order.customerFirstName} {order.customerLastName}
          </p>
          <p className="text-[14px] text-[#6e6e73]">{order.customerEmail}</p>
          {order.customerPhone && (
            <p className="text-[14px] text-[#6e6e73]">{order.customerPhone}</p>
          )}
        </section>

        <section className="rounded-[18px] border border-[#d2d2d7]/40 bg-white p-5">
          <h2 className="text-[16px] font-semibold">Lieferadresse</h2>
          <p className="mt-2 text-[14px]">
            {order.shippingStreet} {order.shippingHouseNumber}
          </p>
          {order.shippingAddressLine2 && (
            <p className="text-[14px]">{order.shippingAddressLine2}</p>
          )}
          <p className="text-[14px]">
            {order.shippingPostalCode} {order.shippingCity}
          </p>
          <p className="text-[14px]">{order.shippingCountry}</p>
        </section>
      </div>

      <section className="rounded-[18px] border border-[#d2d2d7]/40 bg-white p-5">
        <h2 className="text-[16px] font-semibold">Produkte & Gerätezuordnung</h2>
        <p className="mt-1 text-[13px] text-[#6e6e73]">
          Pro Gerät IMEI/Seriennummer und Steuerart setzen, bevor die Rechnung erstellt wird.
        </p>
        {deviceMessage && (
          <p className="mt-2 text-[13px] text-[#6e6e73]">{deviceMessage}</p>
        )}

        <div className="mt-4 space-y-6">
          {order.items.map((item, itemIndex) => (
            <div
              key={`${item.productId}-${itemIndex}`}
              className="rounded-[14px] border border-[#eee] p-4"
            >
              <div className="flex gap-3">
                {item.productImage && (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[10px] bg-[#f5f5f7]">
                    <Image
                      src={item.productImage}
                      alt=""
                      fill
                      className="object-contain p-1"
                      sizes="56px"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[14px]">{item.productName}</p>
                  {item.compatibleDeviceLabel && (
                    <p className="text-[12px] font-medium text-[#1d1d1f]">
                      Für: {item.compatibleDeviceLabel}
                    </p>
                  )}
                  <p className="text-[12px] text-[#6e6e73]">
                    {[item.storage, item.color, item.conditionLabel]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="text-[12px] text-[#6e6e73]">
                    Menge {item.quantity} · {formatCurrency(item.unitPrice)} / Stück
                  </p>
                </div>
                <p className="font-semibold text-[14px]">
                  {formatCurrency(item.lineTotal)}
                </p>
              </div>

              <div className="mt-4 space-y-4">
                {item.devices.map((device, deviceIndex) => {
                  const busyKey = `${itemIndex}-${device.id}`;
                  return (
                    <div
                      key={device.id}
                      className="rounded-[12px] bg-[#fafafa] p-3"
                    >
                      <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6e6e73]">
                        Gerät {deviceIndex + 1}
                      </p>
                      <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <label className="text-[13px] font-medium">
                          IMEI
                          <input
                            className="mt-1.5 w-full rounded-[10px] border border-[#d2d2d7] bg-white px-3 py-2 text-[14px]"
                            value={device.imei ?? ""}
                            disabled={invoiceLocked || deviceBusyKey === busyKey}
                            onChange={(e) =>
                              updateLocalDevice(itemIndex, device.id, {
                                imei: e.target.value,
                              })
                            }
                          />
                        </label>
                        <label className="text-[13px] font-medium">
                          Seriennummer
                          <input
                            className="mt-1.5 w-full rounded-[10px] border border-[#d2d2d7] bg-white px-3 py-2 text-[14px]"
                            value={device.serialNumber ?? ""}
                            disabled={invoiceLocked || deviceBusyKey === busyKey}
                            onChange={(e) =>
                              updateLocalDevice(itemIndex, device.id, {
                                serialNumber: e.target.value,
                              })
                            }
                          />
                        </label>
                        <label className="text-[13px] font-medium md:col-span-2">
                          Besteuerung
                          <select
                            className="mt-1.5 w-full rounded-[10px] border border-[#d2d2d7] bg-white px-3 py-2 text-[14px]"
                            value={device.taxMode ?? ""}
                            disabled={invoiceLocked || deviceBusyKey === busyKey}
                            onChange={(e) =>
                              updateLocalDevice(itemIndex, device.id, {
                                taxMode: (e.target.value || null) as TaxMode | null,
                              })
                            }
                          >
                            <option value="">Bitte wählen…</option>
                            {TAX_MODE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-[13px] font-medium md:col-span-2">
                          Einkaufspreis intern (optional, nie auf Rechnung)
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="mt-1.5 w-full rounded-[10px] border border-[#d2d2d7] bg-white px-3 py-2 text-[14px]"
                            value={
                              typeof device.purchasePrice === "number"
                                ? device.purchasePrice
                                : ""
                            }
                            disabled={invoiceLocked || deviceBusyKey === busyKey}
                            onChange={(e) =>
                              updateLocalDevice(itemIndex, device.id, {
                                purchasePrice:
                                  e.target.value === ""
                                    ? null
                                    : Number(e.target.value),
                              })
                            }
                          />
                        </label>
                      </div>
                      {!invoiceLocked && (
                        <button
                          type="button"
                          className="mt-3 rounded-full border border-[#d2d2d7] bg-white px-4 py-2 text-[13px] font-medium disabled:opacity-60"
                          disabled={deviceBusyKey === busyKey}
                          onClick={() => void saveDevice(itemIndex, device)}
                        >
                          {deviceBusyKey === busyKey ? "Speichern…" : "Speichern"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {order.accessoryUpsells && order.accessoryUpsells.length > 0 && (
          <div className="mt-6 rounded-[14px] border border-[#eee] p-4">
            <h3 className="text-[14px] font-semibold">Zubehör</h3>
            <div className="mt-3 space-y-4">
              {order.accessoryUpsells.map((upsell) => (
                <div key={upsell.cartLineId}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-medium">
                        {upsell.bundleTitle
                          ? `${upsell.bundleTitle} · ${upsell.targetProductName}`
                          : upsell.displayName}
                      </p>
                      {upsell.bundleType ? (
                        <p className="mt-0.5 text-[12px] text-[#6e6e73]">
                          Bundle: {upsell.bundleTitle ?? upsell.bundleType}
                        </p>
                      ) : null}
                      <ul className="mt-2 space-y-1 text-[13px] text-[#1d1d1f]">
                        {upsell.items.map((item) => (
                          <li key={`${item.type}-${item.variant ?? ""}-${item.label}`}>
                            ✓ {item.label}
                            {item.compatibleProduct
                              ? ` – ${item.compatibleProduct}`
                              : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="shrink-0 text-[14px] font-semibold">
                      {formatCurrency(upsell.lineTotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 space-y-1 text-[14px]">
          <div className="flex justify-between">
            <span>Zwischensumme</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Versand</span>
            <span>
              {order.shippingCost > 0
                ? formatCurrency(order.shippingCost)
                : "Kostenlos"}
            </span>
          </div>
          <div className="flex justify-between border-t border-[#eee] pt-2 font-semibold">
            <span>Gesamt</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </section>

      <section className="rounded-[18px] border border-[#d2d2d7]/40 bg-white p-5">
        <h2 className="text-[16px] font-semibold">Rechnung</h2>
        <p className="mt-1 text-[13px] text-[#6e6e73]">
          Wird nicht automatisch nach Zahlung erstellt — erst nach Geräte- und Steuerzuordnung.
        </p>

        {!invoiceLocked && invoiceMissing.length > 0 && (
          <div className="mt-3 rounded-[12px] border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-900">
            <p className="font-medium">Noch unvollständig:</p>
            <ul className="mt-1 list-disc pl-5">
              {invoiceMissing.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </div>
        )}

        {order.invoiceNumber && (
          <p className="mt-3 text-[14px]">
            Rechnungsnummer:{" "}
            <span className="font-semibold">{order.invoiceNumber}</span>
          </p>
        )}
        {order.invoiceEmailSentAt && (
          <p className="mt-1 text-[12px] text-[#6e6e73]">
            Per E-Mail gesendet:{" "}
            {new Date(order.invoiceEmailSentAt).toLocaleString("de-DE")}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {!invoiceLocked && (
            <button
              type="button"
              onClick={() => void createInvoice()}
              disabled={invoiceBusy || !invoiceReady}
              className="btn-techbuy-primary min-h-[44px] px-5 text-[14px] disabled:opacity-60"
            >
              {invoiceBusy ? "Erstellen…" : "Rechnung erstellen"}
            </button>
          )}
          {downloadUrl && (
            <>
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center rounded-full border border-[#d2d2d7] bg-white px-5 text-[14px] font-medium"
              >
                Rechnung ansehen / herunterladen
              </a>
              <button
                type="button"
                onClick={() => void sendInvoice()}
                disabled={invoiceBusy}
                className="inline-flex min-h-[44px] items-center rounded-full border border-[#d2d2d7] bg-white px-5 text-[14px] font-medium disabled:opacity-60"
              >
                Rechnung per E-Mail senden
              </button>
            </>
          )}
        </div>
        {invoiceMessage && (
          <p className="mt-3 text-[13px] text-[#6e6e73]">{invoiceMessage}</p>
        )}
      </section>

      <section className="rounded-[18px] border border-[#d2d2d7]/40 bg-white p-5">
        <h2 className="text-[16px] font-semibold">Zahlung</h2>
        <dl className="mt-3 grid grid-cols-1 gap-2 text-[14px] sm:grid-cols-2">
          <div>
            <dt className="text-[#6e6e73]">Anbieter</dt>
            <dd className="capitalize">{order.paymentProvider}</dd>
          </div>
          <div>
            <dt className="text-[#6e6e73]">Status</dt>
            <dd>{order.paymentStatus}</dd>
          </div>
          {order.stripeSessionId && (
            <div>
              <dt className="text-[#6e6e73]">Stripe Session</dt>
              <dd className="break-all text-[12px]">{order.stripeSessionId}</dd>
            </div>
          )}
          {order.paypalOrderId && (
            <div>
              <dt className="text-[#6e6e73]">PayPal Order</dt>
              <dd className="break-all text-[12px]">{order.paypalOrderId}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="rounded-[18px] border border-[#d2d2d7]/40 bg-white p-5">
        <h2 className="text-[16px] font-semibold">Versand</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-[13px] font-medium">
            Versanddienstleister
            <select
              className="mt-1.5 w-full rounded-[12px] border border-[#d2d2d7] px-3 py-2.5 text-[14px]"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value as ShippingCarrier)}
              disabled={shippingBusy}
            >
              {SHIPPING_CARRIERS.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[13px] font-medium">
            Sendungsnummer
            <input
              className="mt-1.5 w-full rounded-[12px] border border-[#d2d2d7] px-3 py-2.5 text-[14px]"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              disabled={shippingBusy}
              placeholder="z. B. 00340434…"
            />
          </label>
        </div>
        {order.trackingUrl && (
          <p className="mt-3 text-[13px]">
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Tracking öffnen
            </a>
          </p>
        )}
        <button
          type="button"
          onClick={() => void markShipped()}
          disabled={shippingBusy || !trackingNumber.trim()}
          className="btn-techbuy-primary mt-4 min-h-[44px] px-5 text-[14px] disabled:opacity-60"
        >
          {shippingBusy ? "Speichern…" : "Als versendet markieren"}
        </button>
        {shippingMessage && (
          <p className="mt-3 text-[13px] text-[#6e6e73]">{shippingMessage}</p>
        )}
      </section>
    </div>
  );
}

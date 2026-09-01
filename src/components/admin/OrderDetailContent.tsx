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
  imei2?: string | null;
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
  /** Vom Server: braucht diese Position eine IMEI/Seriennummer? */
  requiresDeviceId?: boolean;
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

function formatDateTime(iso?: string): string {
  return iso ? new Date(iso).toLocaleString("de-DE") : "";
}

type ShipState = "idle" | "sending" | "sent" | "error";

export function OrderDetailContent({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [shippingBlockers, setShippingBlockers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [carrier, setCarrier] = useState<ShippingCarrier>("DHL");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipState, setShipState] = useState<ShipState>("idle");
  const [shipMessage, setShipMessage] = useState<string | null>(null);
  const [shipErrors, setShipErrors] = useState<string[]>([]);

  const [deviceBusyKey, setDeviceBusyKey] = useState<string | null>(null);
  const [deviceMessage, setDeviceMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`);
      const data = (await response.json()) as {
        ok?: boolean;
        order?: OrderDetail;
        shippingBlockers?: string[];
        message?: string;
      };
      if (!response.ok || !data.order) {
        throw new Error(data.message ?? "Bestellung nicht gefunden.");
      }
      setOrder(data.order);
      setShippingBlockers(data.shippingBlockers ?? []);
      if (data.order.trackingCarrier) setCarrier(data.order.trackingCarrier);
      if (data.order.trackingNumber) setTrackingNumber(data.order.trackingNumber);
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
                  imei2: device.imei2 ?? null,
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
      const data = (await response.json()) as { ok?: boolean; message?: string };
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

  async function sendShippingData(resend = false) {
    if (shipState === "sending") return;
    setShipState("sending");
    setShipMessage(null);
    setShipErrors([]);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/ship`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carrier, trackingNumber, resend }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
        errors?: string[];
        emailSent?: boolean;
        alreadyEmailed?: boolean;
        resent?: boolean;
      };
      if (!response.ok || !data.ok) {
        setShipErrors(data.errors ?? []);
        throw new Error(
          data.message ??
            "Versanddaten konnten nicht gesendet werden. Bitte erneut versuchen.",
        );
      }
      setShipState("sent");
      setShipMessage(
        data.emailSent
          ? data.resent
            ? "Versandbestätigung wurde erneut an den Kunden gesendet."
            : "Versanddaten gesendet – der Kunde hat die Versandbestätigung erhalten."
          : data.message ?? "Versanddaten gespeichert.",
      );
      await load();
    } catch (err) {
      setShipState("error");
      setShipMessage(
        err instanceof Error
          ? err.message
          : "Versanddaten konnten nicht gesendet werden. Bitte erneut versuchen.",
      );
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

  const shipped = Boolean(order.shippedAt) || order.orderStatus === "shipped";
  const emailSent = Boolean(order.shippingEmailSentAt);
  const devicesLocked = shipped;
  const isPaid = order.paymentStatus === "paid";
  const sendDisabled =
    shipState === "sending" || !trackingNumber.trim() || !isPaid;

  const sendLabel =
    shipState === "sending"
      ? "Wird gesendet …"
      : shipState === "sent"
        ? "Versanddaten gesendet ✓"
        : "Versanddaten an Kunden senden";

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
          Bei Geräten IMEI / IMEI 2 / Seriennummer zuordnen. Zubehör braucht
          keine Gerätekennung.
        </p>
        {deviceMessage && (
          <p className="mt-2 text-[13px] text-[#6e6e73]">{deviceMessage}</p>
        )}

        <div className="mt-4 space-y-6">
          {order.items.map((item, itemIndex) => {
            const needsId = item.requiresDeviceId ?? true;
            return (
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

                {!needsId ? (
                  <p className="mt-3 rounded-[10px] bg-[#fafafa] px-3 py-2 text-[12px] text-[#6e6e73]">
                    Zubehör – keine IMEI/Seriennummer erforderlich.
                  </p>
                ) : (
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
                                disabled={devicesLocked || deviceBusyKey === busyKey}
                                onChange={(e) =>
                                  updateLocalDevice(itemIndex, device.id, {
                                    imei: e.target.value,
                                  })
                                }
                              />
                            </label>
                            <label className="text-[13px] font-medium">
                              IMEI 2 (Dual-SIM, optional)
                              <input
                                className="mt-1.5 w-full rounded-[10px] border border-[#d2d2d7] bg-white px-3 py-2 text-[14px]"
                                value={device.imei2 ?? ""}
                                disabled={devicesLocked || deviceBusyKey === busyKey}
                                onChange={(e) =>
                                  updateLocalDevice(itemIndex, device.id, {
                                    imei2: e.target.value,
                                  })
                                }
                              />
                            </label>
                            <label className="text-[13px] font-medium md:col-span-2">
                              Seriennummer
                              <input
                                className="mt-1.5 w-full rounded-[10px] border border-[#d2d2d7] bg-white px-3 py-2 text-[14px]"
                                value={device.serialNumber ?? ""}
                                disabled={devicesLocked || deviceBusyKey === busyKey}
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
                                disabled={devicesLocked || deviceBusyKey === busyKey}
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
                                disabled={devicesLocked || deviceBusyKey === busyKey}
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
                          {!devicesLocked && (
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
                )}
              </div>
            );
          })}
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
          {order.stripePaymentIntentId && (
            <div>
              <dt className="text-[#6e6e73]">Stripe PaymentIntent</dt>
              <dd className="break-all text-[12px]">
                {order.stripePaymentIntentId}
              </dd>
            </div>
          )}
          {order.paypalOrderId && (
            <div>
              <dt className="text-[#6e6e73]">PayPal Order</dt>
              <dd className="break-all text-[12px]">{order.paypalOrderId}</dd>
            </div>
          )}
          {order.paypalCaptureId && (
            <div>
              <dt className="text-[#6e6e73]">PayPal Capture</dt>
              <dd className="break-all text-[12px]">{order.paypalCaptureId}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="rounded-[18px] border border-[#d2d2d7]/40 bg-white p-5">
        <h2 className="text-[16px] font-semibold">Versand</h2>

        {emailSent ? (
          <div className="mt-3 space-y-2">
            <p className="text-[15px] font-semibold text-[#1d1d1f]">Versendet ✓</p>
            <p className="text-[14px]">
              {order.trackingCarrier ?? "—"}
              {order.trackingNumber ? (
                <>
                  {" "}
                  · <code className="text-[13px]">{order.trackingNumber}</code>
                </>
              ) : null}
            </p>
            <p className="text-[13px] text-[#6e6e73]">
              Versandbestätigung gesendet: {formatDateTime(order.shippingEmailSentAt)}
            </p>
            {order.trackingUrl && (
              <p className="text-[13px]">
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
            <div className="pt-2">
              <button
                type="button"
                onClick={() => void sendShippingData(true)}
                disabled={shipState === "sending"}
                className="rounded-full border border-[#d2d2d7] bg-white px-4 py-2 text-[13px] font-medium disabled:opacity-60"
              >
                {shipState === "sending" ? "Wird gesendet …" : "Erneut senden"}
              </button>
            </div>
            {shipMessage && (
              <p
                className={`text-[13px] ${
                  shipState === "error" ? "text-red-600" : "text-[#6e6e73]"
                }`}
              >
                {shipMessage}
              </p>
            )}
          </div>
        ) : (
          <>
            {!isPaid && (
              <p className="mt-3 rounded-[12px] border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-900">
                Diese Bestellung ist noch nicht als bezahlt markiert. Nur bezahlte
                Bestellungen können versendet werden.
              </p>
            )}
            {isPaid && shippingBlockers.length > 0 && (
              <div className="mt-3 rounded-[12px] border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-900">
                <p className="font-medium">Vor dem Versand noch nötig:</p>
                <ul className="mt-1 list-disc pl-5">
                  {shippingBlockers.map((entry) => (
                    <li key={entry}>{entry}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-[13px] font-medium">
                Versanddienstleister
                <select
                  className="mt-1.5 w-full rounded-[12px] border border-[#d2d2d7] px-3 py-2.5 text-[14px]"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value as ShippingCarrier)}
                  disabled={shipState === "sending"}
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
                  disabled={shipState === "sending"}
                  placeholder="z. B. 00340434123456789012"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => void sendShippingData(false)}
              disabled={sendDisabled}
              className="btn-techbuy-primary mt-4 min-h-[44px] px-5 text-[14px] disabled:opacity-60"
            >
              {sendLabel}
            </button>

            {shipErrors.length > 0 && (
              <ul className="mt-3 list-disc pl-5 text-[13px] text-red-600">
                {shipErrors.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            )}
            {shipMessage && shipErrors.length === 0 && (
              <p
                className={`mt-3 text-[13px] ${
                  shipState === "error" ? "text-red-600" : "text-[#6e6e73]"
                }`}
              >
                {shipMessage}
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}

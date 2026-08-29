"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import { useProductStore } from "@/context/ProductStoreContext";
import { useSalesLedger } from "@/context/SalesLedgerContext";
import {
  clearPendingCheckout,
  loadPendingCheckout,
} from "@/lib/checkout";
import { formatPrice } from "@/lib/cart";

type Status = "loading" | "success" | "error";

interface OrderSummaryItem {
  productName: string;
  storage?: string;
  color?: string;
  conditionLabel?: string;
  quantity: number;
  lineTotal: number;
  compatibleDeviceLabel?: string;
}

export function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const provider = searchParams.get("provider");
  const paypalOrderId = searchParams.get("order_id");
  const { clearCart } = useShop();
  const { refreshFromServer } = useProductStore();
  const { addSaleTransaction } = useSalesLedger();
  const fulfilledRef = useRef(false);

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Zahlung wird geprüft…");
  const [email, setEmail] = useState<string | null>(null);
  const [amountLabel, setAmountLabel] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [summaryItems, setSummaryItems] = useState<OrderSummaryItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    function fulfillFromPending(note: string) {
      if (fulfilledRef.current) return;
      fulfilledRef.current = true;
      const pending = loadPendingCheckout();
      if (pending.length > 0) {
        // Stock was already deducted server-side (source of truth) as part
        // of payment confirmation above — just pull the fresh numbers so
        // the shop UI reflects them without a hard reload.
        void refreshFromServer();

        for (const item of pending) {
          addSaleTransaction({
            productId: item.productId,
            productName: item.brand ? `${item.brand} ${item.name}` : item.name,
            variantLabel: [
              item.deviceLabel ? `Für ${item.deviceLabel}` : undefined,
              item.colorName,
              item.storage,
              item.conditionLabel,
            ]
              .filter(Boolean)
              .join(" · "),
            purchasePrice: 0,
            salePrice: item.price,
            quantity: item.quantity,
            source: "checkout",
            note,
          });
        }
      }

      clearCart();
      clearPendingCheckout();
      sessionStorage.removeItem("techbuy-paypal-internal-order");
      sessionStorage.removeItem("techbuy-pending-order-id");
    }

    async function confirmStripe() {
      if (!sessionId) {
        setStatus("error");
        setMessage("Keine Stripe-Session gefunden.");
        return;
      }

      try {
        const response = await fetch(
          `/api/checkout/confirm?session_id=${encodeURIComponent(sessionId)}`,
        );
        const data = (await response.json()) as {
          ok?: boolean;
          message?: string;
          customerEmail?: string | null;
          amountTotal?: number | null;
          orderNumber?: string | null;
          items?: OrderSummaryItem[] | null;
          total?: number | null;
        };

        if (!response.ok || !data.ok) {
          if (!cancelled) {
            setStatus("error");
            setMessage(data.message ?? "Zahlung konnte nicht bestätigt werden.");
          }
          return;
        }

        fulfillFromPending(`Stripe ${sessionId}`);

        if (!cancelled) {
          setStatus("success");
          setEmail(data.customerEmail ?? null);
          setOrderNumber(
            data.orderNumber ??
              sessionStorage.getItem("techbuy-pending-order-number"),
          );
          if (Array.isArray(data.items)) {
            setSummaryItems(data.items);
          }
          if (typeof data.total === "number") {
            setAmountLabel(formatPrice(data.total));
          } else if (typeof data.amountTotal === "number") {
            setAmountLabel(formatPrice(data.amountTotal / 100));
          }
          setMessage("Vielen Dank für deine Bestellung!");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Netzwerkfehler bei der Zahlungsprüfung.");
        }
      }
    }

    async function confirmPayPal() {
      if (!paypalOrderId) {
        setStatus("error");
        setMessage("Keine PayPal-Bestellung gefunden.");
        return;
      }

      try {
        const response = await fetch(
          `/api/paypal/order-status?order_id=${encodeURIComponent(paypalOrderId)}`,
        );
        const data = (await response.json()) as {
          ok?: boolean;
          message?: string;
          customerEmail?: string | null;
          paidAmount?: number;
          orderNumber?: string;
          items?: OrderSummaryItem[];
          total?: number;
        };

        if (!response.ok || !data.ok) {
          if (!cancelled) {
            setStatus("error");
            setMessage(data.message ?? "Zahlung konnte nicht bestätigt werden.");
          }
          return;
        }

        fulfillFromPending(`PayPal ${paypalOrderId}`);

        if (!cancelled) {
          setStatus("success");
          setEmail(data.customerEmail ?? null);
          setOrderNumber(data.orderNumber ?? null);
          if (Array.isArray(data.items)) setSummaryItems(data.items);
          if (typeof data.total === "number") {
            setAmountLabel(formatPrice(data.total));
          } else if (typeof data.paidAmount === "number") {
            setAmountLabel(formatPrice(data.paidAmount));
          }
          setMessage("Vielen Dank für deine Bestellung!");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Netzwerkfehler bei der Zahlungsprüfung.");
        }
      }
    }

    if (provider === "paypal" || paypalOrderId) {
      void confirmPayPal();
    } else {
      void confirmStripe();
    }

    return () => {
      cancelled = true;
    };
  }, [
    sessionId,
    provider,
    paypalOrderId,
    clearCart,
    refreshFromServer,
    addSaleTransaction,
  ]);

  return (
    <section className="min-h-screen bg-[#f5f5f7] px-5 pb-16 pt-28 md:pt-32">
      <div className="mx-auto max-w-[560px] rounded-[24px] border border-[#d2d2d7]/40 bg-white p-8 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)] md:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
          TechBuy Checkout
        </p>
        <h1 className="mt-3 text-[28px] font-bold tracking-tight text-[#1d1d1f]">
          {status === "loading"
            ? "Bitte warten…"
            : status === "success"
              ? "Vielen Dank für deine Bestellung!"
              : "Zahlung prüfen"}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[#6e6e73]">{message}</p>

        {status === "success" && (
          <div className="mt-5 space-y-3 text-[14px] text-[#6e6e73]">
            {orderNumber && (
              <p>
                Bestellung{" "}
                <span className="font-semibold text-[#1d1d1f]">{orderNumber}</span>
              </p>
            )}
            {email && (
              <p>
                Wir haben eine Bestellbestätigung an{" "}
                <span className="font-semibold text-[#1d1d1f]">{email}</span>{" "}
                gesendet.
              </p>
            )}
            {amountLabel && (
              <p>
                Betrag:{" "}
                <span className="font-semibold text-[#1d1d1f]">{amountLabel}</span>
              </p>
            )}
            {summaryItems.length > 0 && (
              <div className="mt-4 rounded-[16px] border border-[#e5e5ea] bg-[#fafafa] p-4 text-left">
                <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6e6e73]">
                  Zusammenfassung
                </p>
                <ul className="mt-2 space-y-2">
                  {summaryItems.map((item, index) => (
                    <li key={`${item.productName}-${index}`} className="text-[13px]">
                      <span className="font-medium text-[#1d1d1f]">
                        {item.productName}
                      </span>
                      {[
                        item.compatibleDeviceLabel
                          ? `Für ${item.compatibleDeviceLabel}`
                          : undefined,
                        item.storage,
                        item.color,
                        item.conditionLabel,
                      ].filter(Boolean).length > 0 && (
                        <span className="block text-[#6e6e73]">
                          {[
                            item.compatibleDeviceLabel
                              ? `Für ${item.compatibleDeviceLabel}`
                              : undefined,
                            item.storage,
                            item.color,
                            item.conditionLabel,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      )}
                      <span className="block text-[#6e6e73]">
                        Menge {item.quantity} · {formatPrice(item.lineTotal)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/" className="btn-techbuy-primary min-h-[48px] px-5">
            Weiter einkaufen
          </Link>
          {status === "error" && (
            <Link
              href="/checkout"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-border bg-white px-5 text-[14px] font-medium"
            >
              Zurück zur Kasse
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

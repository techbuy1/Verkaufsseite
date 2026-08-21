"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CartItem } from "@/lib/cart";
import { savePendingCheckout } from "@/lib/checkout";
import type { DeviceUpsellSelectionInput } from "@/lib/checkoutUpsell";
import type { CheckoutCustomerInput } from "@/lib/companySettings";

interface PayPalCheckoutPanelProps {
  items: CartItem[];
  customer: CheckoutCustomerInput;
  upsellSelections?: DeviceUpsellSelectionInput[];
  disabled?: boolean;
  onBeforeCreate?: () => boolean;
  onError: (message: string) => void;
  onStatus: (message: string | null) => void;
}

function toPayload(items: CartItem[]) {
  return items.map((item) => ({
    productId: item.productId,
    lineId: item.lineId,
    quantity: item.quantity,
    colorId: item.color,
    colorName: item.colorName,
    storage: item.storage,
    condition: item.condition,
  }));
}

export function PayPalCheckoutPanel({
  items,
  customer,
  upsellSelections = [],
  disabled = false,
  onBeforeCreate,
  onError,
  onStatus,
}: PayPalCheckoutPanelProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim();

  const options = useMemo(
    () => ({
      clientId: clientId || "test",
      currency: "EUR",
      intent: "capture" as const,
      components: "buttons",
    }),
    [clientId],
  );

  if (!clientId) {
    return (
      <p className="rounded-[14px] border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
        PayPal ist noch nicht konfiguriert. Bitte{" "}
        <code className="text-[12px]">NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> in{" "}
        <code className="text-[12px]">.env.local</code> setzen.
      </p>
    );
  }

  return (
    <div className={`rounded-[16px] border border-border bg-white p-4 ${disabled || busy ? "opacity-70" : ""}`}>
      {(disabled || busy) && (
        <p className="mb-3 text-[13px] text-text-secondary">
          {busy ? "Zahlung wird bestätigt …" : "Zahlung wird vorbereitet …"}
        </p>
      )}
      <PayPalScriptProvider options={options}>
        <PayPalButtons
          style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal" }}
          disabled={disabled || busy}
          createOrder={async () => {
            if (onBeforeCreate && !onBeforeCreate()) {
              throw new Error("Bitte Kontaktdaten und Lieferadresse prüfen.");
            }
            onError("");
            onStatus("Zahlung wird vorbereitet …");
            setBusy(true);
            try {
              savePendingCheckout(items);
              const response = await fetch("/api/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  items: toPayload(items),
                  customer,
                  upsellSelections,
                }),
              });
              const data = (await response.json()) as {
                paypalOrderId?: string;
                orderId?: string;
                orderNumber?: string;
                message?: string;
              };
              if (!response.ok || !data.paypalOrderId) {
                throw new Error(
                  data.message ??
                    "PayPal-Bestellung konnte nicht erstellt werden.",
                );
              }
              sessionStorage.setItem(
                "techbuy-paypal-internal-order",
                data.orderId ?? "",
              );
              if (data.orderNumber) {
                sessionStorage.setItem(
                  "techbuy-pending-order-number",
                  data.orderNumber,
                );
              }
              onStatus(null);
              return data.paypalOrderId;
            } catch (error) {
              setBusy(false);
              onStatus(null);
              onError(
                error instanceof Error
                  ? error.message
                  : "Die Zahlung konnte leider nicht abgeschlossen werden. Bitte versuche es erneut oder wähle eine andere Zahlungsmethode.",
              );
              throw error;
            }
          }}
          onApprove={async (data) => {
            onStatus("Zahlung wird bestätigt …");
            setBusy(true);
            try {
              const internalOrderId =
                sessionStorage.getItem("techbuy-paypal-internal-order") || undefined;
              const response = await fetch("/api/paypal/capture-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  paypalOrderId: data.orderID,
                  orderId: internalOrderId,
                }),
              });
              const result = (await response.json()) as {
                ok?: boolean;
                message?: string;
                orderId?: string;
              };

              if (!response.ok || !result.ok) {
                throw new Error(
                  result.message ??
                    "Die Zahlung konnte leider nicht abgeschlossen werden. Bitte versuche es erneut oder wähle eine andere Zahlungsmethode.",
                );
              }

              const orderId = result.orderId ?? "";
              router.push(
                `/success?provider=paypal&order_id=${encodeURIComponent(orderId)}`,
              );
            } catch (error) {
              setBusy(false);
              onStatus(null);
              onError(
                error instanceof Error
                  ? error.message
                  : "Die Zahlung konnte leider nicht abgeschlossen werden. Bitte versuche es erneut oder wähle eine andere Zahlungsmethode.",
              );
            }
          }}
          onCancel={() => {
            setBusy(false);
            onStatus(null);
            onError(
              "Die PayPal-Zahlung wurde abgebrochen. Dein Warenkorb bleibt erhalten.",
            );
          }}
          onError={() => {
            setBusy(false);
            onStatus(null);
            onError(
              "Die Zahlung konnte leider nicht abgeschlossen werden. Bitte versuche es erneut oder wähle eine andere Zahlungsmethode.",
            );
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
}

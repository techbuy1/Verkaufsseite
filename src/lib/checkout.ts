import type { CartItem } from "@/lib/cart";
import type { DeviceUpsellSelectionInput } from "@/lib/checkoutUpsell";
import type { CheckoutCustomerInput } from "@/lib/companySettings";

export interface CheckoutResult {
  ok: boolean;
  message: string;
  redirected?: boolean;
  /**
   * true, wenn die Bestellung serverseitig an einer echten Produkt-/
   * Bestandsprüfung gescheitert ist (Antwort 409/400). Die Kasse kann dann
   * den Warenkorb zur Korrektur anbieten. Bei technischen Fehlern (5xx)
   * bleibt dies `false`.
   */
  cartNeedsReview?: boolean;
}

/** Vom Server (validateAndPriceCart) für „Variante/Produkt ungültig" genutzt. */
const VARIANT_UNAVAILABLE_FALLBACK =
  "Diese Variante ist derzeit nicht verfügbar. Bitte wähle eine andere Farbe oder Speichergröße.";

const PENDING_CHECKOUT_KEY = "techbuy-pending-checkout";

export function savePendingCheckout(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(items));
}

export function loadPendingCheckout(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(PENDING_CHECKOUT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearPendingCheckout(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
}

/**
 * Starts Stripe Checkout — redirects to Stripe when configured.
 * Stock is deducted only after successful payment on the success page.
 */
export async function initiateCheckout(
  items: CartItem[],
  customer: CheckoutCustomerInput,
  upsellSelections: DeviceUpsellSelectionInput[] = [],
): Promise<CheckoutResult> {
  if (items.length === 0) {
    return { ok: false, message: "Warenkorb ist leer." };
  }

  // Keine client-seitige Bestands-/Variantenprüfung mehr: früher hat
  // `validateCheckoutStock(items, loadProducts())` hier gegen den im Browser
  // gecachten Katalog (localStorage) geprüft und den Stripe-Checkout
  // blockiert, während PayPal direkt an den Server ging und dieselbe
  // Variante bezahlen ließ. Einzige Quelle der Wahrheit ist jetzt für beide
  // Zahlungsarten die serverseitige `validateAndPriceCart` in
  // `src/lib/serverCheckout.ts` (Produkt/Variante/Farbe/Speicher/Zustand/
  // Bestand/Preis aus dem Server-Katalog).
  savePendingCheckout(items);

  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "cart",
      customer,
      upsellSelections,
      items: items.map((item) => ({
        productId: item.productId,
        lineId: item.lineId,
        quantity: item.quantity,
        colorId: item.color,
        colorName: item.colorName,
        storage: item.storage,
        condition: item.condition,
        conditionLabel: item.conditionLabel,
        deviceId: item.deviceId,
      })),
    }),
  });

  const data = (await response.json().catch(() => null)) as
    | {
        url?: string;
        message?: string;
        ok?: boolean;
        sessionId?: string;
        orderId?: string;
        orderNumber?: string;
      }
    | null;

  if (response.ok && data?.url) {
    if (data.orderId) {
      sessionStorage.setItem("techbuy-pending-order-id", data.orderId);
    }
    if (data.orderNumber) {
      sessionStorage.setItem("techbuy-pending-order-number", data.orderNumber);
    }
    window.location.href = data.url;
    return { ok: true, redirected: true, message: "Weiterleitung zu Stripe…" };
  }

  clearPendingCheckout();

  // 409 = echte Bestands-/Variantenprüfung fehlgeschlagen (identisch zu PayPal).
  if (response.status === 409) {
    return {
      ok: false,
      cartNeedsReview: true,
      message: data?.message ?? VARIANT_UNAVAILABLE_FALLBACK,
    };
  }

  // 400 = Warenkorb-/Kundendaten ungültig (z. B. altes Produkt/alte Variante,
  // Preis nicht ermittelbar). Servernachricht anzeigen, Warenkorb prüfen lassen.
  if (response.status === 400) {
    return {
      ok: false,
      cartNeedsReview: true,
      message: data?.message ?? "Bitte prüfe deinen Warenkorb.",
    };
  }

  if (response.status === 503) {
    return {
      ok: false,
      message:
        data?.message ??
        "Die Zahlung ist derzeit nicht verfügbar. Bitte versuche es später erneut.",
    };
  }

  // 5xx / Netzwerk = technischer Fehler. NICHT als „nicht verfügbar" ausgeben.
  return {
    ok: false,
    message:
      "Der Checkout konnte aus einem technischen Grund nicht gestartet werden. Bitte versuche es erneut oder wähle eine andere Zahlungsmethode.",
  };
}

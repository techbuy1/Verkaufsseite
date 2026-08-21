import type { CartItem } from "@/lib/cart";
import type { DeviceUpsellSelectionInput } from "@/lib/checkoutUpsell";
import type { CheckoutCustomerInput } from "@/lib/companySettings";
import { validateCheckoutStock } from "@/lib/productAvailability";
import { loadProducts } from "@/lib/productStore";

export interface CheckoutResult {
  ok: boolean;
  message: string;
  redirected?: boolean;
}

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

  const clientStockErrors = validateCheckoutStock(
    items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      colorId: item.color,
      colorName: item.colorName,
      storage: item.storage,
      condition: item.condition,
    })),
    loadProducts(),
  );

  if (clientStockErrors.length > 0) {
    return {
      ok: false,
      message:
        clientStockErrors[0]?.message ??
        "Diese Variante ist leider nicht mehr verfügbar.",
    };
  }

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

  if (response.status === 409) {
    return {
      ok: false,
      message:
        data?.message ?? "Diese Variante ist leider nicht mehr verfügbar.",
    };
  }

  if (response.status === 503) {
    return {
      ok: false,
      message:
        data?.message ??
        "Stripe ist noch nicht konfiguriert. Bitte STRIPE_SECRET_KEY setzen.",
    };
  }

  return {
    ok: false,
    message:
      data?.message ?? "Checkout konnte nicht gestartet werden. Bitte erneut versuchen.",
  };
}

import type { CartItem } from "@/lib/cart";
import { validateCheckoutStock } from "@/lib/productAvailability";
import { loadProducts } from "@/lib/productStore";

export interface CheckoutResult {
  ok: boolean;
  message: string;
}

/**
 * Stripe Checkout entry point — sends the full cart as line_items.
 * Server-side price and stock validation runs before demo checkout completes.
 */
export async function initiateCheckout(items: CartItem[]): Promise<CheckoutResult> {
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

  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: items.map((item) => ({
        productId: item.productId,
        lineId: item.lineId,
        quantity: item.quantity,
        colorId: item.color,
        colorName: item.colorName,
        storage: item.storage,
        condition: item.condition,
        conditionLabel: item.conditionLabel,
        price: item.price,
      })),
    }),
  });

  const data = (await response.json().catch(() => null)) as
    | { url?: string; message?: string; ok?: boolean; stockValidated?: boolean }
    | null;

  if (response.ok && data?.url) {
    window.location.href = data.url;
    return { ok: true, message: "Weiterleitung zu Stripe…" };
  }

  if (response.status === 409) {
    return {
      ok: false,
      message:
        data?.message ?? "Diese Variante ist leider nicht mehr verfügbar.",
    };
  }

  if (response.ok && data?.stockValidated) {
    return {
      ok: true,
      message:
        data.message ??
        "Bestellung validiert. Stripe Checkout ist noch nicht konfiguriert.",
    };
  }

  return {
    ok: false,
    message:
      data?.message ??
      "Stripe Checkout ist noch nicht konfiguriert. Der Warenkorb ist bereit für die serverseitige Übergabe.",
  };
}
